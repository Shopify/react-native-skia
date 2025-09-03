/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "egl_core.h"

#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <EGL/eglplatform.h>
#include <GLES3/gl3.h>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <hilog/log.h>

namespace RNSkia {
EGLCore EGLCore::GLCore;


namespace {
const unsigned int LOG_PRINT_DOMAIN = 0xFF00;
constexpr int32_t NUM_4 = 4;
/**
 * Vertex shader.
 */
const char VERTEX_SHADER[] = "#version 300 es\n"
                             "layout(location = 0) in vec4 a_position;\n"
                             "layout(location = 1) in vec4 a_color;   \n"
                             "out vec4 v_color;                       \n"
                             "void main()                             \n"
                             "{                                       \n"
                             "   gl_Position = a_position;            \n"
                             "   v_color = a_color;                   \n"
                             "}                                       \n";

/**
 * Fragment shader.
 */
const char FRAGMENT_SHADER[] = "#version 300 es\n"
                               "precision mediump float;                  \n"
                               "in vec4 v_color;                          \n"
                               "out vec4 fragColor;                       \n"
                               "void main()                               \n"
                               "{                                         \n"
                               "   fragColor = v_color;                   \n"
                               "}                                         \n";

/**
 * Background color #f4f4f4.
 */
const GLfloat BACKGROUND_COLOR[] = {244.0f / 255, 244.0f / 255, 244.0f / 255, 1.0f};

/**
 * Draw color #7E8FFB.
 */
const GLfloat DRAW_COLOR[] = {126.0f / 255, 143.0f / 255, 251.0f / 255, 1.0f};

/**
 * Change color #92D6CC.
 */
const GLfloat CHANGE_COLOR[] = {146.0f / 255, 214.0f / 255, 204.0f / 255, 1.0f};

/**
 * Background area.
 */
const GLfloat BACKGROUND_RECTANGLE_VERTICES[] = {-1.0f, 1.0f, 1.0f, 1.0f, 1.0f, -1.0f, -1.0f, -1.0f};

/**
 * Get context parameter count.
 */
const size_t GET_CONTEXT_PARAM_CNT = 1;

/**
 * Fifty percent.
 */
const float FIFTY_PERCENT = 0.5;

/**
 * Pointer size.
 */
const GLint POINTER_SIZE = 2;

/**
 * Triangle fan size.
 */
const GLsizei TRIANGLE_FAN_SIZE = 4;

/**
 * Egl red size default.
 */
const int EGL_RED_SIZE_DEFAULT = 8;

/**
 * Egl green size default.
 */
const int EGL_GREEN_SIZE_DEFAULT = 8;

/**
 * Egl blue size default.
 */
const int EGL_BLUE_SIZE_DEFAULT = 8;

/**
 * Egl alpha size default.
 */
const int EGL_ALPHA_SIZE_DEFAULT = 8;

/**
 * Default x position.
 */
const int DEFAULT_X_POSITION = 0;

/**
 * Default y position.
 */
const int DEFAULT_Y_POSITION = 0;

/**
 * Gl red default.
 */
const GLfloat GL_RED_DEFAULT = 0.0;

/**
 * Gl green default.
 */
const GLfloat GL_GREEN_DEFAULT = 0.0;

/**
 * Gl blue default.
 */
const GLfloat GL_BLUE_DEFAULT = 0.0;

/**
 * Gl alpha default.
 */
const GLfloat GL_ALPHA_DEFAULT = 1.0;

/**
 * Program error.
 */
const GLuint PROGRAM_ERROR = 0;

/**
 * Shape vertices size.
 */
const int SHAPE_VERTICES_SIZE = 8;

/**
 * Position handle name.
 */
const char POSITION_NAME[] = "a_position";

/**
 * Position error.
 */
const GLint POSITION_ERROR = -1;

/**
 * Config attribute list.
 */
const EGLint ATTRIB_LIST[] = {
    // Key,value.
    EGL_SURFACE_TYPE, EGL_WINDOW_BIT, EGL_RED_SIZE, EGL_RED_SIZE_DEFAULT, EGL_GREEN_SIZE, EGL_GREEN_SIZE_DEFAULT,
    EGL_BLUE_SIZE, EGL_BLUE_SIZE_DEFAULT, EGL_ALPHA_SIZE, EGL_ALPHA_SIZE_DEFAULT, EGL_RENDERABLE_TYPE,
    EGL_OPENGL_ES2_BIT,
    // End.
    EGL_NONE};

/**
 * Context attributes.
 */
const EGLint CONTEXT_ATTRIBS[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
} // namespace
bool EGLCore::EglContextInit(void *window, int width, int height) {
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "EGLCore", "EglContextInit execute");
    if ((window == nullptr) || (width <= 0) || (height <= 0)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "EglContextInit: param error");
        return false;
    }

    UpdateSize(width, height);
    eglWindow_ = static_cast<EGLNativeWindowType>(window);

    // Init display.
    eglDisplay_ = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    if (eglDisplay_ == EGL_NO_DISPLAY) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "eglGetDisplay: unable to get EGL display");
        return false;
    }

    EGLint majorVersion;
    EGLint minorVersion;
    if (!eglInitialize(eglDisplay_, &majorVersion, &minorVersion)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore",
                     "eglInitialize: unable to get initialize EGL display");
        return false;
    }

    // Select configuration.
    const EGLint maxConfigSize = 1;
    EGLint numConfigs;
    if (!eglChooseConfig(eglDisplay_, ATTRIB_LIST, &eglConfig_, maxConfigSize, &numConfigs)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "eglChooseConfig: unable to choose configs");
        return false;
    }

    return CreateEnvironment();
}

bool EGLCore::CreateEnvironment() {
    // Create surface.
    if (eglWindow_ == nullptr) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "eglWindow_ is null");
        return false;
    }
    eglSurface_ = eglCreateWindowSurface(eglDisplay_, eglConfig_, eglWindow_, NULL);
    if (eglSurface_ == nullptr) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore",
                     "eglCreateWindowSurface: unable to create surface");
        return false;
    }
    // Create context.
    eglContext_ = eglCreateContext(eglDisplay_, eglConfig_, EGL_NO_CONTEXT, CONTEXT_ATTRIBS);
    if (!eglMakeCurrent(eglDisplay_, eglSurface_, eglSurface_, eglContext_)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "eglMakeCurrent failed");
        return false;
    }
    // Create program.
    program_ = CreateProgram(VERTEX_SHADER, FRAGMENT_SHADER);
    if (program_ == PROGRAM_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "CreateProgram: unable to create program");
        return false;
    }
    return true;
}

void EGLCore::Background() {
    GLint position = PrepareDraw();
    if (position == POSITION_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Background get position failed");
        return;
    }

    if (!ExecuteDraw(position, BACKGROUND_COLOR, BACKGROUND_RECTANGLE_VERTICES,
                     sizeof(BACKGROUND_RECTANGLE_VERTICES))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Background execute draw failed");
        return;
    }

    if (!FinishDraw()) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Background FinishDraw failed");
        return;
    }
}

void EGLCore::Draw(int &hasDraw) {
    flag_ = false;
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "EGLCore", "Draw");
    GLint position = PrepareDraw();
    if (position == POSITION_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw get position failed");
        return;
    }

    if (!ExecuteDraw(position, BACKGROUND_COLOR, BACKGROUND_RECTANGLE_VERTICES,
                     sizeof(BACKGROUND_RECTANGLE_VERTICES))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw execute draw background failed");
        return;
    }

    // Divided into five quadrilaterals and calculate one of the quadrilateral's Vertices
    GLfloat rotateX = 0;
    GLfloat rotateY = FIFTY_PERCENT * height_;
    GLfloat centerX = 0;
    // Convert DEG(54° & 18°) to RAD
    GLfloat centerY = -rotateY * (M_PI / 180 * 54) * (M_PI / 180 * 18);
    // Convert DEG(18°) to RAD
    GLfloat leftX = -rotateY * (M_PI / 180 * 18);
    GLfloat leftY = 0;
    // Convert DEG(18°) to RAD
    GLfloat rightX = rotateY * (M_PI / 180 * 18);
    GLfloat rightY = 0;

    const GLfloat shapeVertices[] = {centerX / width_, centerY / height_, leftX / width_,  leftY / height_,
                                     rotateX / width_, rotateY / height_, rightX / width_, rightY / height_};

    if (!ExecuteDrawStar(position, DRAW_COLOR, shapeVertices, sizeof(shapeVertices))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw execute draw shape failed");
        return;
    }

    // Convert DEG(72°) to RAD
    GLfloat rad = M_PI / 180 * 72;
    // Rotate four times
    for (int i = 0; i < NUM_4; ++i) {
        Rotate2d(centerX, centerY, &rotateX, &rotateY, rad);
        Rotate2d(centerX, centerY, &leftX, &leftY, rad);
        Rotate2d(centerX, centerY, &rightX, &rightY, rad);

        const GLfloat shapeVertices[] = {centerX / width_, centerY / height_, leftX / width_,  leftY / height_,
                                         rotateX / width_, rotateY / height_, rightX / width_, rightY / height_};

        if (!ExecuteDrawStar(position, DRAW_COLOR, shapeVertices, sizeof(shapeVertices))) {
            OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw execute draw shape failed");
            return;
        }
    }

    if (!FinishDraw()) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw FinishDraw failed");
        return;
    }
    hasDraw = 1;

    flag_ = true;
}

void EGLCore::ChangeColor(int &hasChangeColor) {
    if (!flag_) {
        return;
    }
    OH_LOG_Print(LOG_APP, LOG_INFO, LOG_PRINT_DOMAIN, "EGLCore", "ChangeColor");
    GLint position = PrepareDraw();
    if (position == POSITION_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ChangeColor get position failed");
        return;
    }

    if (!ExecuteDraw(position, BACKGROUND_COLOR, BACKGROUND_RECTANGLE_VERTICES,
                     sizeof(BACKGROUND_RECTANGLE_VERTICES))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ChangeColor execute draw background failed");
        return;
    }

    // Divided into five quadrilaterals and calculate one of the quadrilateral's Vertices
    GLfloat rotateX = 0;
    GLfloat rotateY = FIFTY_PERCENT * height_;
    GLfloat centerX = 0;
    // Convert DEG(54° & 18°) to RAD
    GLfloat centerY = -rotateY * (M_PI / 180 * 54) * (M_PI / 180 * 18);
    // Convert DEG(18°) to RAD
    GLfloat leftX = -rotateY * (M_PI / 180 * 18);
    GLfloat leftY = 0;
    // Convert DEG(18°) to RAD
    GLfloat rightX = rotateY * (M_PI / 180 * 18);
    GLfloat rightY = 0;

    const GLfloat shapeVertices[] = {centerX / width_, centerY / height_, leftX / width_,  leftY / height_,
                                     rotateX / width_, rotateY / height_, rightX / width_, rightY / height_};

    if (!ExecuteDrawNewStar(0, CHANGE_COLOR, shapeVertices, sizeof(shapeVertices))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw execute draw shape failed");
        return;
    }

    // Convert DEG(72°) to RAD
    GLfloat rad = M_PI / 180 * 72;
    // Rotate four times
    for (int i = 0; i < NUM_4; ++i) {
        Rotate2d(centerX, centerY, &rotateX, &rotateY, rad);
        Rotate2d(centerX, centerY, &leftX, &leftY, rad);
        Rotate2d(centerX, centerY, &rightX, &rightY, rad);
        const GLfloat shapeVertices[] = {centerX / width_, centerY / height_, leftX / width_,  leftY / height_,
                                         rotateX / width_, rotateY / height_, rightX / width_, rightY / height_};

        if (!ExecuteDrawNewStar(position, CHANGE_COLOR, shapeVertices, sizeof(shapeVertices))) {
            OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Draw execute draw shape failed");
            return;
        }
    }

    if (!FinishDraw()) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ChangeColor FinishDraw failed");
    }
    hasChangeColor = 1;
}

GLint EGLCore::PrepareDraw() {
    if ((eglDisplay_ == nullptr) || (eglSurface_ == nullptr) || (eglContext_ == nullptr) ||
        (!eglMakeCurrent(eglDisplay_, eglSurface_, eglSurface_, eglContext_))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "PrepareDraw: param error");
        return POSITION_ERROR;
    }

    // The gl function has no return value.
    glViewport(DEFAULT_X_POSITION, DEFAULT_Y_POSITION, width_, height_);
    glClearColor(GL_RED_DEFAULT, GL_GREEN_DEFAULT, GL_BLUE_DEFAULT, GL_ALPHA_DEFAULT);
    glClear(GL_COLOR_BUFFER_BIT);
    glUseProgram(program_);

    return glGetAttribLocation(program_, POSITION_NAME);
}

bool EGLCore::ExecuteDraw(GLint position, const GLfloat *color, const GLfloat shapeVertices[], unsigned long vertSize) {
    if ((position > 0) || (color == nullptr) || (vertSize / sizeof(shapeVertices[0])) != SHAPE_VERTICES_SIZE) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ExecuteDraw: param error");
        return false;
    }

    // The gl function has no return value.
    glVertexAttribPointer(position, POINTER_SIZE, GL_FLOAT, GL_FALSE, 0, shapeVertices);
    glEnableVertexAttribArray(position);
    glVertexAttrib4fv(1, color);
    glDrawArrays(GL_TRIANGLE_FAN, 0, TRIANGLE_FAN_SIZE);
    glDisableVertexAttribArray(position);

    return true;
}

bool EGLCore::ExecuteDrawStar(GLint position, const GLfloat *color, const GLfloat shapeVertices[],
                              unsigned long vertSize) {
    if ((position > 0) || (color == nullptr) || (vertSize / sizeof(shapeVertices[0])) != SHAPE_VERTICES_SIZE) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ExecuteDraw: param error");
        return false;
    }

    // The gl function has no return value.
    glVertexAttribPointer(position, POINTER_SIZE, GL_FLOAT, GL_FALSE, 0, shapeVertices);
    glVertexAttribPointer(1, POINTER_SIZE, GL_FLOAT, GL_FALSE, 0, color);
    glEnableVertexAttribArray(position);
    glEnableVertexAttribArray(1);
    glVertexAttrib4fv(1, color);
    glDrawArrays(GL_TRIANGLE_FAN, 0, TRIANGLE_FAN_SIZE);
    glDisableVertexAttribArray(position);
    glDisableVertexAttribArray(1);

    return true;
}

bool EGLCore::ExecuteDrawNewStar(GLint position, const GLfloat *color, const GLfloat shapeVertices[],
                                 unsigned long vertSize) {
    if ((position > 0) || (color == nullptr) || (vertSize / sizeof(shapeVertices[0])) != SHAPE_VERTICES_SIZE) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "ExecuteDraw: param error");
        return false;
    }

    // The gl function has no return value.
    glVertexAttribPointer(position, POINTER_SIZE, GL_FLOAT, GL_FALSE, 0, shapeVertices);
    glEnableVertexAttribArray(position);
    glVertexAttrib4fv(1, color);
    glDrawArrays(GL_TRIANGLE_FAN, 0, TRIANGLE_FAN_SIZE);
    glDisableVertexAttribArray(position);

    return true;
}

void EGLCore::Rotate2d(GLfloat centerX, GLfloat centerY, GLfloat *rotateX, GLfloat *rotateY, GLfloat theta) {
    GLfloat tempX = cos(theta) * (*rotateX - centerX) - sin(theta) * (*rotateY - centerY);
    GLfloat tempY = sin(theta) * (*rotateX - centerX) + cos(theta) * (*rotateY - centerY);
    *rotateX = tempX + centerX;
    *rotateY = tempY + centerY;
}

bool EGLCore::FinishDraw() {
    // The gl function has no return value.
    glFlush();
    glFinish();
    return eglSwapBuffers(eglDisplay_, eglSurface_);
}

GLuint EGLCore::LoadShader(GLenum type, const char *shaderSrc) {
    if ((type <= 0) || (shaderSrc == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "glCreateShader type or shaderSrc error");
        return PROGRAM_ERROR;
    }

    GLuint shader = glCreateShader(type);
    if (shader == 0) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "glCreateShader unable to load shader");
        return PROGRAM_ERROR;
    }

    // The gl function has no return value.
    glShaderSource(shader, 1, &shaderSrc, nullptr);
    glCompileShader(shader);

    GLint compiled;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &compiled);
    if (compiled != 0) {
        return shader;
    }

    GLint infoLen = 0;
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, &infoLen);
    if (infoLen <= 1) {
        glDeleteShader(shader);
        return PROGRAM_ERROR;
    }

    char *infoLog = (char *)malloc(sizeof(char) * (infoLen + 1));
    if (infoLog != nullptr) {
        memset(infoLog, 0, infoLen + 1);
        glGetShaderInfoLog(shader, infoLen, nullptr, infoLog);
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "glCompileShader error = %s", infoLog);
        free(infoLog);
        infoLog = nullptr;
    }
    glDeleteShader(shader);
    return PROGRAM_ERROR;
}

GLuint EGLCore::CreateProgram(const char *vertexShader, const char *fragShader) {
    if ((vertexShader == nullptr) || (fragShader == nullptr)) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore",
                     "createProgram: vertexShader or fragShader is null");
        return PROGRAM_ERROR;
    }

    GLuint vertex = LoadShader(GL_VERTEX_SHADER, vertexShader);
    if (vertex == PROGRAM_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "createProgram vertex error");
        return PROGRAM_ERROR;
    }

    GLuint fragment = LoadShader(GL_FRAGMENT_SHADER, fragShader);
    if (fragment == PROGRAM_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "createProgram fragment error");
        return PROGRAM_ERROR;
    }

    GLuint program = glCreateProgram();
    if (program == PROGRAM_ERROR) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "createProgram program error");
        glDeleteShader(vertex);
        glDeleteShader(fragment);
        return PROGRAM_ERROR;
    }

    // The gl function has no return value.
    glAttachShader(program, vertex);
    glAttachShader(program, fragment);
    glLinkProgram(program);

    GLint linked;
    glGetProgramiv(program, GL_LINK_STATUS, &linked);
    if (linked != 0) {
        glDeleteShader(vertex);
        glDeleteShader(fragment);
        return program;
    }

    OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "createProgram linked error");
    GLint infoLen = 0;
    glGetProgramiv(program, GL_INFO_LOG_LENGTH, &infoLen);
    if (infoLen > 1) {
        char *infoLog = (char *)malloc(sizeof(char) * (infoLen + 1));
        memset(infoLog, 0, infoLen + 1);
        glGetProgramInfoLog(program, infoLen, nullptr, infoLog);
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "glLinkProgram error = %s", infoLog);
        free(infoLog);
        infoLog = nullptr;
    }
    glDeleteShader(vertex);
    glDeleteShader(fragment);
    glDeleteProgram(program);
    return PROGRAM_ERROR;
}

void EGLCore::UpdateSize(int width, int height) {
    width_ = width;
    height_ = height;
    if (width_ > 0) {
        widthPercent_ = FIFTY_PERCENT * height_ / width_;
    }
}

void EGLCore::Release() {
    if ((eglDisplay_ == nullptr) || (eglSurface_ == nullptr) || (!eglDestroySurface(eglDisplay_, eglSurface_))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Release eglDestroySurface failed");
    }

    if ((eglDisplay_ == nullptr) || (eglContext_ == nullptr) || (!eglDestroyContext(eglDisplay_, eglContext_))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Release eglDestroyContext failed");
    }

    if ((eglDisplay_ == nullptr) || (!eglTerminate(eglDisplay_))) {
        OH_LOG_Print(LOG_APP, LOG_ERROR, LOG_PRINT_DOMAIN, "EGLCore", "Release eglTerminate failed");
    }
}
} // namespace RNSkia
