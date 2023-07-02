#include "RNSKLog.h"

#include "OpenGLSkiaContext.h"

#include "SkColorSpace.h"

#define GL_FRAMEBUFFER_UNDEFINED 33305
#define GL_FRAMEBUFFER_COMPLETE 0x00008cd5
#define GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT 0x00008cd6
#define GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT 0x00008cd7
#define GL_FRAMEBUFFER_UNSUPPORTED 0x00008cdd

namespace RNSkia {

OpenGLSkiaContext::OpenGLSkiaContext() {
    // 1. Create a Display
    _display = std::make_unique<Display>();
    // 2. Choose a Config
    ConfigDescriptor desc;
    desc.api = API::kOpenGLES2;
    desc.color_format = ColorFormat::kRGBA8888;
    desc.depth_bits = DepthBits::kZero;
    desc.stencil_bits = StencilBits::kEight;
    desc.samples = Samples::kFour;
    desc.surface_type = SurfaceType::kPBuffer;
    _config = _display->ChooseConfig(desc);
    // 3. Fallback for Android emulator
    if (!_config) {
        desc.samples = Samples::kOne;
        _config = _display->ChooseConfig(desc);
        if (_config) {
            RNSkLogger::logToConsole("Falling back to a single sample (device doesn't support MSAA)");
        } else {
            RNSkLogger::logToConsole("Couldn't choose an offscreen config");
            return;
        }
    }

    _context = _display->CreateContext(*_config, nullptr);
    if (!_context) {
        RNSkLogger::logToConsole("Couldn't create a context");
        return;
    }
    _surface = _display->CreatePixelBufferSurface(*_config, 1, 1);
    if (!_context->MakeCurrent(*_surface)) {
        RNSkLogger::logToConsole("Couldn't create a context");
        return;
    }
    auto backendInterface = GrGLMakeNativeInterface();
    _grContext = GrDirectContext::MakeGL();
    if (!_grContext) {
        RNSkLogger::logToConsole("Could not create GrContext!");
    }
}

OpenGLSkiaContext::~OpenGLSkiaContext() {
}

sk_sp<SkSurface> OpenGLSkiaContext::MakeOffscreenSurface(int width, int height) {
    if (!_grContext) {
        RNSkLogger::logToConsole("GrContext is not initialized!");
        return nullptr;
    }

    // Create a new PBuffer surface with desired width and height
    auto eglSurface = _display->CreatePixelBufferSurface(*_config, width, height);
    if (!_context->MakeCurrent(*eglSurface)) {
        RNSkLogger::logToConsole("Couldn't make context current");
        return nullptr;
    }
    _surfaces.push_back(std::move(eglSurface));  // Store the surface

    auto desc = _config->GetDescriptor();

    GLint buffer;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);


    GLenum status = glCheckFramebufferStatus(GL_FRAMEBUFFER);
    if (status != GL_FRAMEBUFFER_COMPLETE) {
        switch(status) {
            case GL_FRAMEBUFFER_UNDEFINED:
                RNSkLogger::logToConsole("Framebuffer: The specified framebuffer is the default read or draw framebuffer, but the default framebuffer does not exist.");
                break;
            case GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                RNSkLogger::logToConsole("Framebuffer: Any of the framebuffer attachment points are framebuffer incomplete.");
                break;
            case GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                RNSkLogger::logToConsole("Framebuffer: The framebuffer does not have at least one image attached to it.");
                break;
    
            case GL_FRAMEBUFFER_UNSUPPORTED:
                RNSkLogger::logToConsole("Framebuffer: The combination of internal formats of the attached images violates an implementation-dependent set of restrictions.");
                break;
            default:
                RNSkLogger::logToConsole("Framebuffer: Unknown error.");
                break;
        }
    } else {
        RNSkLogger::logToConsole("Framebuffer is complete.");
    }


    GrGLFramebufferInfo info;
    info.fFBOID = buffer; // FBO ID for offscreen surface, 0 for default framebuffer
    info.fFormat = 0x8058; // this should match the format in ConfigDescriptor used to create the GrContext

    auto samples = static_cast<int>(desc.samples);
    int stencilBits = static_cast<int>(desc.stencil_bits);

    // TODO: Should clean the eglSurface? Is is getting deleted too soon?
    GrBackendRenderTarget backendRT(width, height, samples, stencilBits, info);
    sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(_grContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin, kRGBA_8888_SkColorType, nullptr, nullptr);
    if (!surface) {
        RNSkLogger::logToConsole("Failed to create offscreen surface");
    }

    return surface;
}

} // namespace RNSkia