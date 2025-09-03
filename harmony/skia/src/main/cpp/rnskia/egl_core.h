/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef NATIVE_XCOMPONENT_EGL_CORE_H
#define NATIVE_XCOMPONENT_EGL_CORE_H

#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <GLES3/gl3.h>

/**
 * EGLCore demo，与skia无关
 */
namespace RNSkia {
class EGLCore {
public:
    explicit EGLCore(){};
    ~EGLCore() {}
    
    static EGLCore *GetInstance()
    {
        return &EGLCore::GLCore;
    }
    
    bool EglContextInit(void *window, int width, int height);
    bool CreateEnvironment();
    void Draw(int &hasDraw);
    void Background();
    void ChangeColor(int &hasChangeColor);
    void Release();
    void UpdateSize(int width, int height);
    
    EGLSurface eglSurface_ = EGL_NO_SURFACE;
private:
    
    static EGLCore GLCore;
    
    GLuint LoadShader(GLenum type, const char *shaderSrc);
    GLuint CreateProgram(const char *vertexShader, const char *fragShader);
    GLint PrepareDraw();
    bool ExecuteDraw(GLint position, const GLfloat *color, const GLfloat shapeVertices[], unsigned long vertSize);
    bool ExecuteDrawStar(GLint position, const GLfloat *color, const GLfloat shapeVertices[], unsigned long vertSize);
    bool ExecuteDrawNewStar(GLint position, const GLfloat *color, const GLfloat shapeVertices[],
                            unsigned long vertSize);
    void Rotate2d(GLfloat centerX, GLfloat centerY, GLfloat *rotateX, GLfloat *rotateY, GLfloat theta);
    bool FinishDraw();

private:
    EGLNativeWindowType eglWindow_;
    EGLDisplay eglDisplay_ = EGL_NO_DISPLAY;
    EGLConfig eglConfig_ = EGL_NO_CONFIG_KHR;
    EGLContext eglContext_ = EGL_NO_CONTEXT;
    GLuint program_;
    bool flag_ = false;
    int width_;
    int height_;
    GLfloat widthPercent_;
};
} // namespace RNSkia
#endif // NATIVE_XCOMPONENT_EGL_CORE_H
