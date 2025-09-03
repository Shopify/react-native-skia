/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "HarmonyBufferUtils.h"
#include "HarmonyOpenGLHelper.h"
#include "native_window/external_window.h"

#include <GLES2/gl2ext.h>

#include "include/gpu/GrBackendSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"
#include "include/gpu/gl/GrGLTypes.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"
#include <EGL/egl.h>
#include <EGL/eglext.h>

#include "HarmonyOpenGLHelper.h"

#define PROT_CONTENT_EXT_STR "EGL_EXT_protected_content"
#define EGL_PROTECTED_CONTENT_EXT 0x32C0

namespace RNSkia {

PFNEGLDESTROYIMAGEKHRPROC eglDestroyImageKHR = (PFNEGLDESTROYIMAGEKHRPROC)eglGetProcAddress("eglDestroyImageKHR");

PFNGLEGLIMAGETARGETTEXTURE2DOESPROC glEGLImageTargetTexture2DOES =
    (PFNGLEGLIMAGETARGETTEXTURE2DOESPROC)eglGetProcAddress("glEGLImageTargetTexture2DOES");

typedef EGLClientBuffer (*EGLGetNativeClientBufferANDROIDProc)(const struct OH_NativeBuffer *);
typedef EGLImageKHR (*EGLCreateImageKHRProc)(EGLDisplay, EGLContext, EGLenum, EGLClientBuffer, const EGLint *);
typedef void (*EGLImageTargetTexture2DOESProc)(EGLenum, void *);

class GLTextureHelper {
public:
    GLTextureHelper(GrGLuint texID, EGLImageKHR image, EGLDisplay display, GrGLuint texTarget)
        : fTexID(texID), fImage(image), fDisplay(display), fTexTarget(texTarget) {}

    ~GLTextureHelper() {
        DLOG(INFO) << "~GLTextureHelper()";
        glDeleteTextures(1, &fTexID);
        eglDestroyImageKHR(fDisplay, fImage);
    }

    void rebind(GrDirectContext *);

private:
    GrGLuint fTexID;
    EGLImageKHR fImage;
    EGLDisplay fDisplay;
    GrGLuint fTexTarget;
};

void GLTextureHelper::rebind(GrDirectContext *dContext) {
    glBindTexture(fTexTarget, fTexID);
    GLenum status = GL_NO_ERROR;
    if ((status = glGetError()) != GL_NO_ERROR) {
        DLOG(ERROR) << "glBindTexture: " << static_cast<int>(fTexTarget) << " failed: " << static_cast<int>(fTexID)
                    << " " << static_cast<int>(status);
        return;
    }
    glEGLImageTargetTexture2DOES(fTexTarget, fImage);
    if ((status = glGetError()) != GL_NO_ERROR) {
        DLOG(ERROR) << "glEGLImageTargetTexture2DOES  failed: " << static_cast<int>(status);
        return;
    }
    dContext->resetContext(kTextureBinding_GrGLBackendState);
}

void delete_gl_texture(void *context) {
    GLTextureHelper *cleanupHelper = static_cast<GLTextureHelper *>(context);
    delete cleanupHelper;
}

void update_gl_texture(void *context, GrDirectContext *dContext) {
    GLTextureHelper *cleanupHelper = static_cast<GLTextureHelper *>(context);
    cleanupHelper->rebind(dContext);
}

static GrBackendTexture make_gl_backend_texture(GrDirectContext *dContext, OH_NativeBuffer *Buffer, int width,
                                                int height, DeleteImageProc *deleteProc, UpdateImageProc *updateProc,
                                                TexImageCtx *imageCtx, bool isProtectedContent,
                                                const GrBackendFormat &backendFormat, bool isRenderable) {
    while (GL_NO_ERROR != glGetError()) {
    } // clear GL errors

    DLOG(INFO) << "make_gl_backend_texture  enter & egl context: " << dContext<<" theardid: "<<std::this_thread::get_id();
    EGLClientBuffer clientBuffer = OH_NativeWindow_CreateNativeWindowBufferFromNativeBuffer(Buffer);
    OH_NativeBuffer_Unreference(Buffer);
    DLOG(INFO) << "make_gl_backend_texture  clientBuffer: " << clientBuffer;
    EGLint attribs[] = {EGL_IMAGE_PRESERVED_KHR, EGL_TRUE, isProtectedContent ? EGL_PROTECTED_CONTENT_EXT : EGL_NONE,
                        isProtectedContent ? EGL_TRUE : EGL_NONE, EGL_NONE};

    //     EGLDisplay display = OpenGLResourceHolder::getInstance().glDisplay;
    EGLDisplay display = eglGetCurrentDisplay();

    //     EGLDisplay display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    DLOG(INFO) << "display: " << display;
    if (GL_NO_ERROR == display) {
        DLOG(ERROR) << "make_gl_backend_texture  eglGetCurrentDisplay: " << static_cast<int>(eglGetError());
        //         return GrBackendTexture();
        //         display = OpenGLResourceHolder::getInstance().glDisplay;
        DLOG(INFO) << "display22222222: " << display;
    }

    PFNEGLCREATEIMAGEKHRPROC EGLCreateImageKHR = (PFNEGLCREATEIMAGEKHRPROC)eglGetProcAddress("eglCreateImageKHR");
    if (!EGLCreateImageKHR) {
        DLOG(ERROR) << "无法获取 EGLCreateImageKHR 函数指针";
        return GrBackendTexture();
    }
    EGLImageKHR image = EGLCreateImageKHR(display, EGL_NO_CONTEXT, EGL_NATIVE_BUFFER_OHOS, clientBuffer, attribs);
    DLOG(INFO) << "make_gl_backend_texture  image: " << image;
    if (EGL_NO_IMAGE_KHR == image) {
        DLOG(ERROR) << "make_gl_backend_texture  Could not create EGL  " << static_cast<int>(eglGetError());
        return GrBackendTexture();
    }

    GrGLuint texID;
    glGenTextures(1, &texID);
    if (!texID) {
        eglDestroyImageKHR(display, image);
        return GrBackendTexture();
    }

    GrGLuint target = isRenderable ? GL_TEXTURE_2D : GL_TEXTURE_EXTERNAL_OES;
    DLOG(INFO) << "make_gl_backend_texture  target: " << target << " texID: " << texID;
    glBindTexture(target, texID);
    GLenum status = GL_NO_ERROR;
    if ((status = glGetError()) != GL_NO_ERROR) {
        DLOG(ERROR) << "make_gl_backend_texture  glBindTexture failed  " << static_cast<int>(status);
        glDeleteTextures(1, &texID);
        eglDestroyImageKHR(display, image);
        return GrBackendTexture();
    }

    glEGLImageTargetTexture2DOES(target, image);
    if ((status = glGetError()) != GL_NO_ERROR) {
        DLOG(ERROR) << "make_gl_backend_texture  glEGLImageTargetTexture2DOES failed " << static_cast<int>(status);
        glDeleteTextures(1, &texID);
        eglDestroyImageKHR(display, image);
        return GrBackendTexture();
    }
    dContext->resetContext(kTextureBinding_GrGLBackendState);

    GrGLTextureInfo textureInfo;
    textureInfo.fID = texID;
    SkASSERT(backendFormat.isValid());
    textureInfo.fTarget = target;
    textureInfo.fFormat = GrBackendFormats::AsGLFormatEnum(backendFormat);
    textureInfo.fProtected = skgpu::Protected(isProtectedContent);

    *deleteProc = delete_gl_texture;
    *updateProc = update_gl_texture;
    *imageCtx = new GLTextureHelper(texID, image, display, target);

    return GrBackendTextures::MakeGL(width, height, skgpu::Mipmapped::kNo, textureInfo);
}

static bool can_import_protected_content_eglimpl() {
    EGLDisplay dpy = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    const char *exts = eglQueryString(dpy, EGL_EXTENSIONS);
    size_t cropExtLen = strlen(PROT_CONTENT_EXT_STR);
    size_t extsLen = strlen(exts);
    bool equal = !strcmp(PROT_CONTENT_EXT_STR, exts);
    bool atStart = !strncmp(PROT_CONTENT_EXT_STR " ", exts, cropExtLen + 1);
    bool atEnd = (cropExtLen + 1) < extsLen && !strcmp(" " PROT_CONTENT_EXT_STR, exts + extsLen - (cropExtLen + 1));
    bool inMiddle = strstr(exts, " " PROT_CONTENT_EXT_STR " ");
    return equal || atStart || atEnd || inMiddle;
}

static bool can_import_protected_content(GrDirectContext *dContext) {
    SkASSERT(GrBackendApi::kOpenGL == dContext->backend());
    // Only compute whether the extension is present once the first time this
    // function is called.
    static bool hasIt = can_import_protected_content_eglimpl();
    return hasIt;
}

GrBackendTexture MakeGLBackendTexture(GrDirectContext *dContext, OH_NativeBuffer *Buffer, int width, int height,
                                      DeleteImageProc *deleteProc, UpdateImageProc *updateProc, TexImageCtx *imageCtx,
                                      bool isProtectedContent, const GrBackendFormat &backendFormat,
                                      bool isRenderable) {
    SkASSERT(dContext);
    if (!dContext || dContext->abandoned()) {
        return GrBackendTexture();
    }

    if (GrBackendApi::kOpenGL != dContext->backend()) {
        return GrBackendTexture();
    }

    if (isProtectedContent && !can_import_protected_content(dContext)) {
        return GrBackendTexture();
    }

    return make_gl_backend_texture(dContext, Buffer, width, height, deleteProc, updateProc, imageCtx,
                                   isProtectedContent, backendFormat, isRenderable);
}

} // namespace RNSkia
