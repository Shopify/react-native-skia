/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef HARMONY_RNSKOPENGLCANVASPROVIDER_H
#define HARMONY_RNSKOPENGLCANVASPROVIDER_H
#include "HarmonyBufferUtils.h"
#include "HarmonyOpenGLHelper.h"
#include "RNSkHarmonyVideo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#pragma clang diagnostic pop

#include "include/gpu/ganesh/SkImageGanesh.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "RNSkView.h"
#include "native_buffer/native_buffer.h"
// #include <js_native_api.h>
// #include <js_native_api_types.h>
#include <native_image/native_image.h>
#include <ace/xcomponent/native_interface_xcomponent.h>
#include <native_window/external_window.h>
#include "native_drawing/drawing_surface.h"
#endif // HARMONY_RNSKOPENGLCANVASPROVIDER_H
#pragma once

#include <memory>
#include <sys/mman.h>

namespace RNSkia {
class ThreadContextHarmonyHolder {
public:
    static thread_local SkiaOpenGLContext ThreadSkiaOpenGLContext;
};
class WindowSurfaceHolder {
public:
    // 构造函数，初始化宽度和高度
    WindowSurfaceHolder(OHNativeWindow *window, int width, int height) {
        DLOG(INFO) << "WindowSurfaceHolder creat _window: " << _window;
        _width = width;
        _height = height;
        if (_width > 0) {
            _widthPercent = 0.5 * _height / _width;
        }
        _window = window;
        DLOG(INFO) << "WindowSurfaceHolder init _width: " << _width << " _height: " << _height
                   << " _widthPercent: " << _widthPercent;
    }

    void dispose() { 
        if(_skSurface) { 
            _skSurface.reset();  
            _glSurface = EGL_NO_SURFACE;
        }
        if(_window) { 
            OH_NativeWindow_DestroyNativeWindow(_window);
            _window = nullptr;
        }
    }

    // 析构函数，释放本地窗口
    ~WindowSurfaceHolder() {
        if (_window) {
            OH_NativeWindow_DestroyNativeWindow(_window);
            _window = nullptr;
        }
        DLOG(INFO) << "~WindowSurfaceHolder release _window: " << _window << " _glSurface: " << _glSurface;
    }

    // 获取宽度
    int getWidth() { return _width; }
    // 获取高度
    int getHeight() { return _height; }

    /*
     * 确保持有者有一个有效的表面并返回该表面。
     */
    sk_sp<SkSurface> getSurface() {
        if (_skSurface == nullptr) {

            // Setup OpenGL and Skia
            if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
                    &ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext)) {
                DLOG(INFO) << "Could not create Skia Surface from native window / surface. "
                              "Failed creating Skia Direct Context";
                return nullptr;
            }

            // Now we can create a surface
            DLOG(INFO) << "getSurface nativewindow : " << _window;
            _glSurface = SkiaOpenGLHelper::createWindowedSurface(_window);
            if (_glSurface == EGL_NO_SURFACE) {
                DLOG(INFO) << "Could not create EGL Surface from native window / surface.";
                return nullptr;
            }

            // Now make this one current
            if (!SkiaOpenGLHelper::makeCurrent(&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext, _glSurface)) {
                DLOG(INFO) << "Could not create EGL Surface from native window / surface. Could "
                              "not set new surface as current surface.";
                return nullptr;
            }


            // Set up parameters for the render target so that it
            // matches the underlying OpenGL context.
            GrGLFramebufferInfo fboInfo;

            // We pass 0 as the framebuffer id, since the
            // underlying Skia GrGlGpu will read this when wrapping the context in the
            // render target and the GrGlGpu object.
            fboInfo.fFBOID = 0;
            fboInfo.fFormat = 0x8058; // GL_RGBA8

            GLint stencil;
            glGetIntegerv(GL_STENCIL_BITS, &stencil);

            GLint samples;
            glGetIntegerv(GL_SAMPLES, &samples);

            auto colorType = kN32_SkColorType;

            auto maxSamples =
                ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext->maxSurfaceSampleCountForColorType(
                    colorType);

            if (samples > maxSamples) {
                samples = maxSamples;
            }

            auto renderTarget = GrBackendRenderTargets::MakeGL(_width, _height, samples, stencil, fboInfo);

            SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

            struct ReleaseContext {
                EGLSurface glSurface;
            };

            auto releaseCtx = new ReleaseContext({_glSurface});

            // Create surface object
            _skSurface = SkSurfaces::WrapBackendRenderTarget(
                ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext.get(), renderTarget,
                kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props,
                [](void *addr) {
                    auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);
                    SkiaOpenGLHelper::destroySurface(releaseCtx->glSurface);
                    delete releaseCtx;
                },
                reinterpret_cast<void *>(releaseCtx));
        }

        return _skSurface;
    }

    // 将生产的内容写入NativeWindowBuffer
    void WriteNativeWindowBuffer() { // buffer用来绑定OpenGL画布
        OHNativeWindowBuffer *buffer = nullptr;
        int fenceFd;
        // 通过 OH_NativeWindow_NativeWindowRequestBuffer 获取 OHNativeWindowBuffer 实例
        OH_NativeWindow_NativeWindowRequestBuffer(_window, &buffer, &fenceFd);
        BufferHandle *handle = OH_NativeWindow_GetBufferHandleFromNative(buffer);

        // 使用系统mmap接口拿到bufferHandle的内存虚拟地址
        void *mappedAddr = mmap(handle->virAddr, handle->size, PROT_READ | PROT_WRITE, MAP_SHARED, handle->fd, 0);
        if (mappedAddr == MAP_FAILED) {
            // mmap failed
        }
        static uint32_t value = 0x00;
        value++;
        uint32_t *pixel = static_cast<uint32_t *>(mappedAddr);
        for (uint32_t x = 0; x < _width; x++) {
            for (uint32_t y = 0; y < _height; y++) {
                *pixel++ = value;
            }
        }

        // 将NativeWindowBuffer提交到NativeWindow
        //  设置刷新区域，如果Region中的Rect为nullptr,或者rectNumber为0，则认为NativeWindowBuffer全部有内容更改。
        Region region{nullptr, 0};
        // 通过OH_NativeWindow_NativeWindowFlushBuffer 提交给消费者使用，例如：显示在屏幕上。
        OH_NativeWindow_NativeWindowFlushBuffer(_window, buffer, fenceFd, region);

        // 内存使用完记得去掉内存映射
        int result = munmap(mappedAddr, handle->size);
        if (result == -1) {
            // munmap failed
        }
    }

    // 更新纹理图像到OpenGL纹理
    void updateTexImage() {
        // NativeImageAdaptor::GetInstance()->Update();
        //  OH_NativeImage_UpdateSurfaceImage(_Image);
        //   对update绑定到对应textureId的纹理做对应的opengl后处理后，将纹理上屏
    }

    /**
     * 调整表面的大小
     * @param width 新的宽度
     * @param height 新的高度
     */
    void resize(int width, int height) {
        _width = width;
        _height = height;
        _skSurface = nullptr;
    }

    /**
     * 将当前表面设置为活动表面
     * @return 如果成功则返回true
     */
    bool makeCurrent() {
        return SkiaOpenGLHelper::makeCurrent(&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext, _glSurface);
    }

    /**
     * 通过交换缓冲区来呈现当前的绘图操作
     * @return 如果成功则返回true
     */
    bool present() {
        // 刷新并提交直接上下文
        ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext->flushAndSubmit();

        if (_glSurface == EGL_NO_SURFACE) {
            // 处理无效表面的情况
            return false;
        }
        // 交换缓冲区
        return SkiaOpenGLHelper::swapBuffers(&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext, _glSurface);
    }

private:
    OHNativeWindow *_window;                // 本地窗口
    sk_sp<SkSurface> _skSurface = nullptr;  // Skia表面
    EGLSurface _glSurface = EGL_NO_SURFACE; // OpenGL表面
                                            //     GrGLuint _textureId;
                                            //     GrGLuint _textureTarget;
                                            //     OH_NativeImage *image_;
    int _width = 0;                         // 宽度
    int _height = 0;                        // 高度
    float _widthPercent = 0.0;
};

class SkiaOpenGLSurfaceFactory {
public:
    /**
     * 创建一个新的由纹理支持的 Skia 表面。
     * @param width 表面的宽度
     * @param height 表面的高度
     * @return 一个由纹理支持的 SkSurface。
     */
    static sk_sp<SkSurface> makeOffscreenSurface(int width, int height) {
        // 关联Skia和OpenGL，
        if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(
                &ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext)) {
            DLOG(INFO) << "Could not create Skia Surface from native window / surface. \n"
                       << "Failed creating Skia Direct Context\n";
            return nullptr;
        }

        auto colorType = kN32_SkColorType; //

        SkSurfaceProps props(0, kUnknown_SkPixelGeometry); // kUnknown_SkPixelGeometry
        if (!SkiaOpenGLHelper::makeCurrent(&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext,
                                           ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.gl1x1Surface)) {
            DLOG(INFO) << "Could not create EGL Surface from native window / surface. Could \n"
                          "not set new surface as current surface.\n";
            return nullptr;
        }

        // 创建纹理
        auto texture = ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext->createBackendTexture(
            width, height, colorType, skgpu::Mipmapped::kNo, GrRenderable::kYes);

        if (!texture.isValid()) {
            DLOG(INFO) << "couldn't create offscreen texture:" << width << height;
        }

        struct ReleaseContext {
            SkiaOpenGLContext *context;
            GrBackendTexture texture;
        };

        auto releaseCtx = new ReleaseContext({&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext, texture});

        // GrBackendTexture->SkSurface
        return SkSurfaces::WrapBackendTexture(
            ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext.get(), texture, kTopLeft_GrSurfaceOrigin,
            0, colorType, nullptr, &props,
            [](void *addr) {
                auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

                releaseCtx->context->directContext->deleteBackendTexture(releaseCtx->texture);
            },
            releaseCtx);
    }

    /**
     * 从硬件缓冲区创建一个 SkImage。
     * @param buffer 硬件缓冲区
     * @param requireKnownFormat 是否需要已知格式
     * @return 一个 SkImage 对象
     */
    static sk_sp<SkImage> makeImageFromHardwareBuffer(void *buffer) {
        // Setup OpenGL and Skia:
        if (!SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(&ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext))
            [[unlikely]] {
            throw std::runtime_error("Failed to create Skia Context for this Thread!");
        }
        OH_NativeBuffer *hardwareBuffer = static_cast<OH_NativeBuffer *>(buffer);
        DeleteImageProc deleteImageProc = nullptr;
        UpdateImageProc updateImageProc = nullptr;
        TexImageCtx deleteImageCtx = nullptr;

        OH_NativeBuffer_Config description;
        OH_NativeBuffer_GetConfig(hardwareBuffer, &description);
        GrBackendFormat format = GrBackendFormats::MakeGL(GR_GL_RGBA8, GR_GL_TEXTURE_EXTERNAL);

        auto backendTex =
            MakeGLBackendTexture(ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext.get(),
                                 const_cast<OH_NativeBuffer *>(hardwareBuffer), description.width, description.height,
                                 &deleteImageProc, &updateImageProc, &deleteImageCtx, false, format, false);
        if (!backendTex.isValid()) {
            DLOG(INFO) << "Failed to convert HardwareBuffer to OpenGL Texture!";
            return nullptr;
        }
        sk_sp<SkImage> image =
            SkImages::BorrowTextureFrom(ThreadContextHarmonyHolder::ThreadSkiaOpenGLContext.directContext.get(),
                                        backendTex, kTopLeft_GrSurfaceOrigin, kRGBA_8888_SkColorType,
                                        kOpaque_SkAlphaType, nullptr, deleteImageProc, deleteImageCtx);
        if (image) {
            DLOG(INFO) << "makeImageFromHardwareBuffer SkImage成功 image : " << image
                       << " thread id : " << std::this_thread::get_id();
        }
        return image;
    }

    /**
     * 创建一个窗口化的 Skia Surface 持有者。
     * @param width 表面的初始宽度
     * @param height 表面的初始高度
     * @param window 来自 Surface 的窗口
     * @return 一个 Surface 持有者
     */
    static std::unique_ptr<WindowSurfaceHolder> makeWindowedSurface(OHNativeWindow *window, int width, int height) {
        return std::make_unique<WindowSurfaceHolder>(window, width, height);
    }
};

class RNSkOpenGLCanvasProvider : public RNSkia::RNSkCanvasProvider,
                                 public std::enable_shared_from_this<RNSkOpenGLCanvasProvider> {
public:
    RNSkOpenGLCanvasProvider(std::function<void()> requestRedraw,
                             std::shared_ptr<RNSkia::RNSkPlatformContext> platformContext)
        : RNSkCanvasProvider(requestRedraw), _platformContext(platformContext) {
        DLOG(INFO) << "RNSkOpenGLCanvasProvider 构造函数";
    }

    ~RNSkOpenGLCanvasProvider() { DLOG(INFO) << "RNSkOpenGLCanvasProvider 析构"; }

    float getScaledWidth() override { return _surfaceHolder ? _surfaceHolder->getWidth() : 0; }

    float getScaledHeight() override { return _surfaceHolder ? _surfaceHolder->getHeight() : 0; }

    bool renderToCanvas(const std::function<void(SkCanvas *)> &cb) {
        if (_surfaceHolder != nullptr && cb != nullptr) {
            // Get the surface
            auto surface = _surfaceHolder->getSurface();
            if (surface) {
                DLOG(INFO) << "renderToCanvas 当前线程: " << std::this_thread::get_id();
                
                // Ensure we are ready to render
                if (!_surfaceHolder->makeCurrent()) {
                    return false;
                }
                    
                _surfaceHolder->updateTexImage();
                
                // Draw into canvas using callback
                cb(surface->getCanvas());
                
                // Swap buffers and show on screen
                return _surfaceHolder->present();

            } else {
                // the render context did not provide a surface
                return false;
            }
        }

        return false;
    }

    void surfaceAvailable(OHNativeWindow *surface, int width, int height) {
        // Create renderer!
        _surfaceHolder = SkiaOpenGLSurfaceFactory::makeWindowedSurface(surface, width, height);

        // Post redraw request to ensure we paint in the next draw cycle.
        _requestRedraw();
    }

    void surfaceDestroyed() {
        // destroy the renderer (a unique pointer so the dtor will be called
        // immediately.)
        auto holder = std::move(_surfaceHolder);
        if(!holder)
            return;
        auto sharedHolder = std::shared_ptr<WindowSurfaceHolder>(holder.release());
        _platformContext->runOnMainThread(
            [sharedHolder](){
                sharedHolder->dispose();
            }
        );
    }

    void surfaceSizeChanged(int width, int height) {
        if (width == 0 && height == 0) {
            // Setting width/height to zero is nothing we need to care about when
            // it comes to invalidating the surface.
            return;
        }
        // Recreate RenderContext surface based on size change???
        _surfaceHolder->resize(width, height);

        // Redraw after size change
        _requestRedraw();
    }


private:
    std::unique_ptr<WindowSurfaceHolder> _surfaceHolder = nullptr;
    std::shared_ptr<RNSkPlatformContext> _platformContext;
};


} // namespace RNSkia