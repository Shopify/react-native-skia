#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkTextBlob.h"
#include "JsiSkRSXform.h"
#include <jsi/jsi.h>
#include <SkTextBlob.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkTextBlobFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(MakeFromText) {
            auto str = arguments[0].asString(runtime).utf8(runtime);
            auto font = JsiSkFont::fromValue(runtime, arguments[1]);
            auto textBlob = SkTextBlob::MakeFromString(str.c_str(), *font);
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkTextBlob>(getContext(), textBlob)
            );
        }

        JSI_HOST_FUNCTION(MakeFromGlyphs) {
            auto jsiGlyphs = arguments[0].asObject(runtime).asArray(runtime);
            auto font = JsiSkFont::fromValue(runtime, arguments[1]);
            int bytesPerGlyph = 2;
            std::vector<SkGlyphID> glyphs;
            int glyphsSize = static_cast<int>(jsiGlyphs.size(runtime));
            for (int i = 0; i < glyphsSize; i++) {
                glyphs.push_back(jsiGlyphs.getValueAtIndex(runtime, i).asNumber());
            }
            auto textBlob =  SkTextBlob::MakeFromText(glyphs.data(), glyphs.size() * bytesPerGlyph, *font, SkTextEncoding::kGlyphID);
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkTextBlob>(getContext(), textBlob)
            );
        }

        JSI_HOST_FUNCTION(MakeFromRSXform) {
            auto str = arguments[0].asString(runtime).utf8(runtime);
            auto jsiRsxforms = arguments[1].asObject(runtime).asArray(runtime);
            auto font = JsiSkFont::fromValue(runtime, arguments[2]);            
            std::vector<SkRSXform> rsxforms;
            int rsxformsSize = static_cast<int>(jsiRsxforms.size(runtime));
            for (int i = 0; i < rsxformsSize; i++) {
                auto rsxform = JsiSkRSXform::fromValue(runtime, jsiRsxforms.getValueAtIndex(runtime, i));
                rsxforms.push_back(*rsxform);
            }
            auto textBlob = SkTextBlob::MakeFromRSXform(str.c_str(), str.length(), rsxforms.data(), *font);
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkTextBlob>(getContext(), textBlob)
            );
        }

        JSI_HOST_FUNCTION(MakeFromRSXformGlyphs) {
            auto jsiGlyphs = arguments[0].asObject(runtime).asArray(runtime);
            auto jsiRsxforms = arguments[1].asObject(runtime).asArray(runtime);
            auto font = JsiSkFont::fromValue(runtime, arguments[2]);
            int bytesPerGlyph = 2;
            std::vector<SkGlyphID> glyphs;
            int glyphsSize = static_cast<int>(jsiGlyphs.size(runtime));
            for (int i = 0; i < glyphsSize; i++) {
                glyphs.push_back(jsiGlyphs.getValueAtIndex(runtime, i).asNumber());
            }
            std::vector<SkRSXform> rsxforms;
            int rsxformsSize = static_cast<int>(jsiRsxforms.size(runtime));
            for (int i = 0; i < rsxformsSize; i++) {
                auto rsxform = JsiSkRSXform::fromValue(runtime, jsiRsxforms.getValueAtIndex(runtime, i));
                rsxforms.push_back(*rsxform);
            }
            auto textBlob = SkTextBlob::MakeFromRSXform(glyphs.data(), glyphs.size() * bytesPerGlyph, rsxforms.data(), *font, SkTextEncoding::kGlyphID);
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkTextBlob>(getContext(), textBlob)
            );
        }


        JSI_EXPORT_FUNCTIONS(
            JSI_EXPORT_FUNC(JsiSkTextBlobFactory, MakeFromText),
            JSI_EXPORT_FUNC(JsiSkTextBlobFactory, MakeFromGlyphs),
            JSI_EXPORT_FUNC(JsiSkTextBlobFactory, MakeFromRSXform),
            JSI_EXPORT_FUNC(JsiSkTextBlobFactory, MakeFromRSXformGlyphs),
        )

        JsiSkTextBlobFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(context) {}
    };

} // namespace RNSkia
