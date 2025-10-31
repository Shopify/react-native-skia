#pragma once

#include <memory>

#include "JsiSkData.h"
#include "JsiSkDispatcher.h"
#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkRect.h"
#include "JsiSkShader.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPicture.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPicture : public JsiSkWrappingSkPtrHostObject<SkPicture> {
private:
  std::shared_ptr<Dispatcher> _dispatcher;

public:
  JsiSkPicture(std::shared_ptr<RNSkPlatformContext> context,
               const sk_sp<SkPicture> picture)
      : JsiSkWrappingSkPtrHostObject<SkPicture>(context, picture) {
    // Get the dispatcher for the current thread
    _dispatcher = Dispatcher::getDispatcher();
    // Process any pending operations
    _dispatcher->processQueue();
  }

  ~JsiSkPicture() override {
    // Queue deletion on the creation thread if needed
    auto picture = getObject();
    if (picture && _dispatcher) {
      _dispatcher->run([picture]() {
        // Picture will be deleted when this lambda is destroyed
      });
    }
    // Clear the object to prevent base class destructor from deleting it
    setObject(nullptr);
  }

  JSI_HOST_FUNCTION(makeShader) {
    auto tmx = (SkTileMode)arguments[0].asNumber();
    auto tmy = (SkTileMode)arguments[1].asNumber();
    auto fm = (SkFilterMode)arguments[2].asNumber();
    auto m = count > 3 && !arguments[3].isUndefined()
                 ? JsiSkMatrix::fromValue(runtime, arguments[3]).get()
                 : nullptr;

    auto tr = count > 4 && !arguments[4].isUndefined()
                  ? JsiSkRect::fromValue(runtime, arguments[4]).get()
                  : nullptr;

    // Create shader
    auto shader = getObject()->makeShader(tmx, tmy, fm, m, tr);
    auto shaderObj = std::make_shared<JsiSkShader>(getContext(), shader);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shaderObj,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(serialize) {
    auto data = getObject()->serialize();
    auto arrayCtor =
        runtime.global().getPropertyAsFunction(runtime, "Uint8Array");
    size_t size = data->size();

    jsi::Object array =
        arrayCtor.callAsConstructor(runtime, static_cast<double>(size))
            .getObject(runtime);
    jsi::ArrayBuffer buffer =
        array.getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);

    auto bfrPtr = reinterpret_cast<uint8_t *>(buffer.data(runtime));
    memcpy(bfrPtr, data->bytes(), size);
    return array;
  }

  EXPORT_JSI_API_TYPENAME(JsiSkPicture, Picture)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPicture, makeShader),
                       JSI_EXPORT_FUNC(JsiSkPicture, serialize),
                       JSI_EXPORT_FUNC(JsiSkPicture, dispose))

  size_t getMemoryPressure() const override {
    auto picture = getObject();
    if (!picture) {
      return 0;
    }
    // SkPicture provides approximateBytesUsed() method to estimate memory usage
    auto bytesUsed = picture->approximateBytesUsed();
    return bytesUsed;
  }

  std::string getObjectType() const override { return "JsiSkPicture"; }
};
} // namespace RNSkia
