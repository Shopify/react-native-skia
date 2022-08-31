#pragma once

#include <RNSkJsView.h>

#include <SkiaOpenGLRenderer.h>
#include <android/native_window.h>

namespace RNSkia {

class RNSkOpenGLCanvasProvider :
        public RNSkia::RNSkCanvasProvider,
        public std::enable_shared_from_this<RNSkOpenGLCanvasProvider> {
public:
    RNSkOpenGLCanvasProvider(std::function<void()> requestRedraw,
                             std::function<void()> releaseSurfaceCallback,
                             std::shared_ptr <RNSkia::RNSkPlatformContext> context);

    ~RNSkOpenGLCanvasProvider();

    float getScaledWidth() override;

    float getScaledHeight() override;

    void renderToCanvas(const std::function<void(SkCanvas * )> &cb) override;

    void surfaceAvailable(ANativeWindow *surface, int width, int height);

    void surfaceDestroyed();

    void surfaceSizeChanged(int width, int height);

private:
    std::unique_ptr <SkiaOpenGLRenderer> _renderer = nullptr;
    std::function<void()> _releaseSurfaceCallback;
    std::shared_ptr <RNSkPlatformContext> _context;
    float _width = -1;
    float _height = -1;
};
}