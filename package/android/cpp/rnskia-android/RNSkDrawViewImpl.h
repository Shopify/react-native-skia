#pragma once

#include <RNSkDrawView.h>

#include <SkiaOpenGLRenderer.h>
#include <android/native_window.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPicture.h>
#include <SkRefCnt.h>

#pragma clang diagnostic pop

namespace RNSkia {
    class RNSkDrawViewImpl : public RNSkia::RNSkDrawView {
    public:
        RNSkDrawViewImpl(std::shared_ptr <RNSkia::RNSkPlatformContext> context);

        void surfaceAvailable(ANativeWindow* surface, int, int);
        void surfaceDestroyed();
        void surfaceSizeChanged(int, int);

        float getPixelDensity() {
            return getPlatformContext()->getPixelDensity();
        }

    protected:
        int getWidth() override { return _width * getPlatformContext()->getPixelDensity(); };

        int getHeight() override { return _height * getPlatformContext()->getPixelDensity(); };

        void drawPicture(const sk_sp <SkPicture> picture) override;

    private:
        bool createSkiaSurface();

        std::shared_ptr<SkiaOpenGLRenderer> _renderer = nullptr;

        int _nativeId;
        int _width = -1;
        int _height = -1;
    };
}
