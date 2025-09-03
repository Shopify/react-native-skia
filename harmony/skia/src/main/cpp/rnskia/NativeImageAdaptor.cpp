/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "NativeImageAdaptor.h"
#include "HarmonyOpenGLHelper.h"
#include "common.h"

namespace RNSkia {
using GetPlatformDisplayExt = PFNEGLGETPLATFORMDISPLAYEXTPROC;
constexpr const char *EGL_EXT_PLATFORM_WAYLAND = "EGL_EXT_platform_wayland";
constexpr const char *EGL_KHR_PLATFORM_WAYLAND = "EGL_KHR_platform_wayland";
constexpr int32_t EGL_CONTEXT_CLIENT_VERSION_NUM = 2;
constexpr char CHARACTER_WHITESPACE = ' ';
constexpr const char *CHARACTER_STRING_WHITESPACE = " ";
constexpr const char *EGL_GET_PLATFORM_DISPLAY_EXT = "eglGetPlatformDisplayEXT";
constexpr int32_t NATIVE_CACHE_BUFFER = 3;

NativeImageAdaptor::NativeImageAdaptor() {

}

NativeImageAdaptor *NativeImageAdaptor::GetInstance() {
    static NativeImageAdaptor imageAdaptor;
    return &imageAdaptor;
};

bool NativeImageAdaptor::CheckEglExtension(const char *eglExtensions, const char *eglExtension) {
    // Check egl extension
    size_t extLenth = strlen(eglExtension);
    const char *endPos = eglExtensions + strlen(eglExtensions);

    while (eglExtensions < endPos) {
        size_t len = 0;
        if (*eglExtensions == CHARACTER_WHITESPACE) {
            eglExtensions++;
            continue;
        }
        len = strcspn(eglExtensions, CHARACTER_STRING_WHITESPACE);
        if (len == extLenth && strncmp(eglExtension, eglExtensions, len) == 0) {
            return true;
        }
        eglExtensions += len;
    }
    return false;
}

EGLDisplay NativeImageAdaptor::GetPlatformEglDisplay(EGLenum platform, void *native_display,
                                                     const EGLint *attrib_list) {
    static GetPlatformDisplayExt eglGetPlatformDisplayExt = NULL;
    if (!eglGetPlatformDisplayExt) {
        const char *extensions = eglQueryString(EGL_NO_DISPLAY, EGL_EXTENSIONS);
        if (extensions && (CheckEglExtension(extensions, EGL_EXT_PLATFORM_WAYLAND) ||
                           CheckEglExtension(extensions, EGL_KHR_PLATFORM_WAYLAND))) {
            eglGetPlatformDisplayExt = (GetPlatformDisplayExt)eglGetProcAddress(EGL_GET_PLATFORM_DISPLAY_EXT);
        }
    }

    if (eglGetPlatformDisplayExt) {
        return eglGetPlatformDisplayExt(platform, native_display, attrib_list);
    }

    return eglGetDisplay((EGLNativeDisplayType)native_display);
}

void NativeImageAdaptor::InitEGLEnv() {
    // Obtain the current display device
    eglDisplay_ = GetPlatformEglDisplay(EGL_PLATFORM_OHOS_KHR, EGL_DEFAULT_DISPLAY, NULL);
    if (eglDisplay_ == EGL_NO_DISPLAY) {
        return;
    }

    EGLint major, minor;
    // Initialize EGLDisplay
    if (eglInitialize(eglDisplay_, &major, &minor) == EGL_FALSE) {
        return;
    }
    // The API for binding graphic drawing is OpenGLES
    if (eglBindAPI(EGL_OPENGL_ES_API) == EGL_FALSE) {
        return;
    }
    unsigned int ret;
    EGLint count;
    EGLint config_attribs[] = {EGL_SURFACE_TYPE,
                               EGL_WINDOW_BIT,
                               EGL_RED_SIZE,
                               8,
                               EGL_GREEN_SIZE,
                               8,
                               EGL_BLUE_SIZE,
                               8,
                               EGL_ALPHA_SIZE,
                               8,
                               EGL_RENDERABLE_TYPE,
                               EGL_OPENGL_ES3_BIT,
                               EGL_NONE};

    // Obtain a valid system configuration information
    ret = eglChooseConfig(eglDisplay_, config_attribs, &config_, 1, &count);
    if (!(ret && static_cast<unsigned int>(count) >= 1)) {
        return;
    }
    static const EGLint context_attribs[] = {EGL_CONTEXT_CLIENT_VERSION, EGL_CONTEXT_CLIENT_VERSION_NUM, EGL_NONE};
    eglContext_ = eglCreateContext(eglDisplay_, config_, EGL_NO_CONTEXT, context_attribs);
    if (eglContext_ == EGL_NO_CONTEXT) {
        return;
    }

    // Associated Context
    eglMakeCurrent(eglDisplay_, EGL_NO_SURFACE, EGL_NO_SURFACE, eglContext_);

    OpenGLResourceHolder::getInstance().glDisplay = eglDisplay_;
    OpenGLResourceHolder::getInstance().glContext = eglContext_;
    OpenGLResourceHolder::getInstance().glConfig = config_;
}

bool NativeImageAdaptor::Export(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"GetAvailableCount", nullptr, NativeImageAdaptor::GetAvailableCount, nullptr, nullptr, nullptr, napi_default,
         nullptr},
        {"GetBufferQueueSize", nullptr, NativeImageAdaptor::NapiOnGetBufferQueueSize, nullptr, nullptr, nullptr,
         napi_default, nullptr},
        {"GetAttachBufferCount", nullptr, NativeImageAdaptor::NapiOnGetAttachBufferCount, nullptr, nullptr, nullptr,
         napi_default, nullptr},
        {"GetCacheBufferCount", nullptr, NativeImageAdaptor::NapiOnGetCacheBufferCount, nullptr, nullptr, nullptr,
         napi_default, nullptr},
        {"ProduceBuffer", nullptr, NativeImageAdaptor::NapiOnProduceBuffer, nullptr, nullptr, nullptr, napi_default,
         nullptr},
        {"AttachBuffer", nullptr, NativeImageAdaptor::NapiOnAttachBuffer, nullptr, nullptr, nullptr, napi_default,
         nullptr},
        {"DettachBuffer", nullptr, NativeImageAdaptor::NapiOnDettachBuffer, nullptr, nullptr, nullptr, napi_default,
         nullptr},
    };
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);

    eglContext_ = EGL_NO_CONTEXT;
    eglDisplay_ = EGL_NO_DISPLAY;
    availableBufferCount_ = 0;
    // Creating OpenGL textures
    InitEGLEnv();
    bool ret = InitNativeWindow();
    ret = InitNativeWindowCache() && ret;
    return ret;
}

bool NativeImageAdaptor::InitNativeWindow() {
    GLuint textureId;
    glGenTextures(1, &textureId);
    // Create a NativeImage instance and associate it with OpenGL textures
    image_ = OH_NativeImage_Create(textureId, GL_TEXTURE_2D);
    // Obtain Producer NativeWindow
    nativeWindow_ = OH_NativeImage_AcquireNativeWindow(image_);

    int code = SET_BUFFER_GEOMETRY;
    width_ = 0x832;
    height_ = 0x832;
    int32_t ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, width_, height_);
    if (ret != 0) {
        return false;
    }

    code = SET_USAGE;
    int32_t usage = NATIVEBUFFER_USAGE_CPU_READ | NATIVEBUFFER_USAGE_CPU_WRITE | NATIVEBUFFER_USAGE_MEM_DMA;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, usage);

    OH_OnFrameAvailableListener listener;
    listener.context = static_cast<void *>(image_);
    listener.onFrameAvailable = NativeImageAdaptor::OnFrameAvailable;
    ret = OH_NativeImage_SetOnFrameAvailableListener(image_, listener);

    uint64_t surfaceId;
    ret = OH_NativeImage_GetSurfaceId(image_, &surfaceId);
    if (ret != 0) {
        return false;
    }

    OHNativeWindow *nativeWindow = nullptr;
    ret = OH_NativeWindow_CreateNativeWindowFromSurfaceId(surfaceId, &nativeWindow);
    if (ret != 0 || nativeWindow != nativeWindow_) {
        return false;
    }

    uint64_t surfaceIdTmp = 0;
    ret = OH_NativeWindow_GetSurfaceId(nativeWindow, &surfaceIdTmp);
    if (ret != 0 || surfaceIdTmp != surfaceId) {
    }
    OH_NativeWindow_DestroyNativeWindow(nativeWindow);

    return true;
}

bool NativeImageAdaptor::InitNativeWindowCache() {
    GLuint textureId;
    glGenTextures(1, &textureId);
    imageCache_ = OH_NativeImage_Create(textureId, GL_TEXTURE_2D);
    nativeWindowCache_ = OH_NativeImage_AcquireNativeWindow(imageCache_);

    int code = SET_BUFFER_GEOMETRY;
    width_ = 0x100;
    height_ = 0x100;
    int32_t ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindowCache_, code, width_, height_);
    if (ret != 0) {
    }

    code = SET_USAGE;
    int32_t usage = NATIVEBUFFER_USAGE_CPU_READ | NATIVEBUFFER_USAGE_CPU_WRITE | NATIVEBUFFER_USAGE_MEM_DMA;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindowCache_, code, usage);

    for (int i = 0; i < NATIVE_CACHE_BUFFER; i++) {
        ProduceBuffer(0x00, nativeWindowCache_);
    }

    return true;
}

napi_value NativeImageAdaptor::NapiOnAttachBuffer(napi_env env, napi_callback_info info) {
    //     NativeImageAdaptor::GetInstance("xxxx")->AttachBuffer();
    return nullptr;
}

napi_value NativeImageAdaptor::NapiOnDettachBuffer(napi_env env, napi_callback_info info) {
    //     NativeImageAdaptor::GetInstance()->DettachBuffer();
    return nullptr;
}

void NativeImageAdaptor::AttachBuffer() {
    if (bufferCache_.size() == 0) {
        return;
    }

    NativeWindowBuffer *buffer = bufferCache_.front();
    int ret = OH_NativeWindow_NativeWindowAttachBuffer(nativeWindowCache_, buffer);
    if (ret != 0) {
        return;
    }

    bufferAttached_.push(buffer);
    bufferCache_.pop();
}

void NativeImageAdaptor::DettachBuffer() {
    if (bufferAttached_.size() == 0) {
        return;
    }

    NativeWindowBuffer *buffer = bufferAttached_.front();
    int ret = OH_NativeWindow_NativeWindowDetachBuffer(nativeWindowCache_, buffer);
    if (ret != 0) {

        return;
    }

    bufferCache_.push(buffer);
    bufferAttached_.pop();
}

void NativeImageAdaptor::SetConfigAndGetValue() {
    static int32_t g_cnt = 0;
    int32_t code = SET_FORMAT;
    int32_t value = NATIVEBUFFER_PIXEL_FMT_CLUT1;
    int32_t ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, value);
    if (ret != 0) {
    }
    value = 0;
    code = GET_FORMAT;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, &value);
    if (ret != 0 || value != NATIVEBUFFER_PIXEL_FMT_CLUT1) {
    }
    code = SET_TRANSFORM;
    value = NATIVEBUFFER_ROTATE_180;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, value);
    if (ret != 0) {
    }
    code = GET_TRANSFORM;
    value = 0;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, &value);
    if (ret != 0 || value != NATIVEBUFFER_ROTATE_180) {
    }
    code = SET_COLOR_GAMUT;
    value = NATIVEBUFFER_COLOR_GAMUT_STANDARD_BT709;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, value);
    if (ret != 0) {
    }
    code = GET_COLOR_GAMUT;
    value = 0;
    ret = OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, &value);
    if (ret != 0 || value != NATIVEBUFFER_COLOR_GAMUT_STANDARD_BT709) {
    }
    code = SET_FORMAT;
    if (g_cnt % 2 == 0) { // 2 : 每次执行使用不同的format类型
        OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, NATIVEBUFFER_PIXEL_FMT_RGBA_8888);
    } else {
        OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, NATIVEBUFFER_PIXEL_FMT_YCBCR_420_SP);
    }
    code = SET_TRANSFORM;
    OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, NATIVEBUFFER_ROTATE_NONE);
    code = SET_COLOR_GAMUT;
    OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, NATIVEBUFFER_COLOR_GAMUT_SRGB);
    g_cnt++;
}

void NativeImageAdaptor::GetBufferMapPlanes(NativeWindowBuffer *buffer) {
    void *virAddr = nullptr;
    OH_NativeBuffer_Planes outPlanes;
    OH_NativeBuffer *nativeBuffer = nullptr;

    int32_t ret = OH_NativeBuffer_FromNativeWindowBuffer(buffer, &nativeBuffer);
    if (ret != 0) {
        return;
    }
    ret = OH_NativeBuffer_MapPlanes(nativeBuffer, &virAddr, &outPlanes);
    if (ret != 0) {
        return;
    }
}

void NativeImageAdaptor::ProduceBuffer(uint32_t value, OHNativeWindow *InNativeWindow) {
    if (InNativeWindow == nativeWindow_) {
        SetConfigAndGetValue();
    }

    NativeWindowBuffer *buffer = nullptr;
    int fenceFd = -1;
    int ret = OH_NativeWindow_NativeWindowRequestBuffer(InNativeWindow, &buffer, &fenceFd);
    if (ret != 0) {

        return;
    }
    GetBufferMapPlanes(buffer);

    if (InNativeWindow == nativeWindowCache_) {
        OH_NativeWindow_NativeWindowDetachBuffer(nativeWindowCache_, buffer);
        bufferCache_.push(buffer);
        return;
    }
    int32_t code = GET_FORMAT;
    int32_t formatType = NATIVEBUFFER_PIXEL_FMT_CLUT1;
    OH_NativeWindow_NativeWindowHandleOpt(nativeWindow_, code, &formatType);

    BufferHandle *handle = OH_NativeWindow_GetBufferHandleFromNative(buffer);
    // Obtain the memory virtual address of bufferHandle using the system mmap interface
    void *mappedAddr = mmap(handle->virAddr, handle->size, PROT_READ | PROT_WRITE, MAP_SHARED, handle->fd, 0);
    if (formatType == NATIVEBUFFER_PIXEL_FMT_RGBA_8888) {
        uint32_t *pixel = static_cast<uint32_t *>(mappedAddr);
        for (uint32_t x = 0; x < width_; x++) {
            for (uint32_t y = 0; y < height_; y++) {
                *pixel++ = value;
            }
        }
    }

    // Remember to remove memory mapping after using memory
    int result = munmap(mappedAddr, handle->size);
    if (result == -1) {
    }

    struct Region *region = new Region();
    struct Region::Rect *rect = new Region::Rect();
    rect->x = 0x100;
    rect->y = 0x100;
    rect->w = 0x100;
    rect->h = 0x100;
    region->rects = rect;
    ret = OH_NativeWindow_NativeWindowFlushBuffer(InNativeWindow, buffer, fenceFd, *region);
    if (ret != 0) {
        return;
    }
    delete region;
}

void NativeImageAdaptor::OnFrameAvailable(void *context) {
    NativeImageAdaptor::GetInstance()->DealCallback(context);
    return;
}

void NativeImageAdaptor::DealCallback(void *context) {
    std::lock_guard<std::mutex> lockGuard(opMutex_);

    availableBufferCount_++;
    int32_t ret = OH_NativeImage_UpdateSurfaceImage(image_);
    if (ret != 0) {
    }
    return;
}

void NativeImageAdaptor::Update() {
    std::lock_guard<std::mutex> lockGuard(opMutex_);
    availableBufferCount_++;
    int32_t ret = OH_NativeImage_UpdateSurfaceImage(image_);
    if (ret != 0) {
    }
    return;
}

int32_t NativeImageAdaptor::GetCount() {
    std::lock_guard<std::mutex> lockGuard(opMutex_);
    return availableBufferCount_;
}

int32_t NativeImageAdaptor::GetAttachBufferCount() { return bufferAttached_.size(); }

int32_t NativeImageAdaptor::GetCacheBufferCount() { return bufferCache_.size(); }


NativeImageAdaptor::~NativeImageAdaptor() {
    OH_NativeImage_UnsetOnFrameAvailableListener(image_);
    OH_NativeWindow_DestroyNativeWindow(nativeWindow_);
    OH_NativeImage_Destroy(&image_);
}
} // namespace RNSkia