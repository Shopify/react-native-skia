#pragma once

#include <map>

#include "JsiSkHostObjects.h"
#include "JsiSkPaint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"
#include "JsiSkPoint.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkFont.h>
#include <SkFontMetrics.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkFont : public JsiSkWrappingSharedPtrHostObject<SkFont> {
    public:

        // TODO: declare in JsiSkWrappingSkPtrHostObject via extra template parameter?
        JSI_PROPERTY_GET(__typename__) {
            return jsi::String::createFromUtf8(runtime, "Font");
        }

        JSI_HOST_FUNCTION(measureText) {
            auto textVal = arguments[0].asString(runtime).utf8(runtime);
            auto text = textVal.c_str();
            SkRect rect;
            std::shared_ptr<SkPaint> paint = nullptr;
            // Check if a paint argument was provided
            if (count == 2) {
                paint = JsiSkPaint::fromValue(runtime, arguments[1]);
            }
            getObject()->measureText(text, strlen(text), SkTextEncoding::kUTF8, &rect,
                                     paint.get());
            rect.setXYWH(0, 0, rect.width(), rect.height());
            return JsiSkRect::toValue(runtime, getContext(), rect);
        }

        JSI_HOST_FUNCTION(getGlyphWidths) {
            auto jsiGlyphs = arguments[0].asObject(runtime).asArray(runtime);
            std::vector<SkGlyphID> glyphs;
            int glyphsSize = static_cast<int>(jsiGlyphs.size(runtime));

            std::vector<SkScalar> widthPtrs;
            widthPtrs.resize(glyphsSize);

            for (int i = 0; i < glyphsSize; i++) {
                glyphs.push_back(jsiGlyphs.getValueAtIndex(runtime, i).asNumber());
            }
            if (count > 1) {
                auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);
                getObject()->getWidthsBounds(glyphs.data(), glyphsSize, static_cast<SkScalar*>(widthPtrs.data()), nullptr, paint.get());
            } else {
                getObject()->getWidthsBounds(glyphs.data(), glyphsSize, static_cast<SkScalar*>(widthPtrs.data()), nullptr, nullptr);
            }
            auto jsiWidths = jsi::Array(runtime, glyphsSize);
            for (int i = 0; i <glyphsSize; i++) {
                jsiWidths.setValueAtIndex(runtime, i, jsi::Value(SkScalarToDouble(static_cast<SkScalar*>(widthPtrs.data())[i])));
            }
            return jsiWidths;
        }

        JSI_HOST_FUNCTION(getMetrics) {
            SkFontMetrics fm;
            getObject()->getMetrics(&fm);
            auto metrics = jsi::Object(runtime);
            metrics.setProperty(runtime, "ascent",  fm.fAscent);
            metrics.setProperty(runtime, "descent", fm.fDescent);
            metrics.setProperty(runtime, "leading", fm.fLeading);
            if (!(fm.fFlags & SkFontMetrics::kBoundsInvalid_Flag)) {
                auto bounds = SkRect::MakeLTRB(fm.fXMin,fm.fTop, fm.fXMax, fm.fBottom );
                auto jsiBounds = JsiSkRect::toValue(runtime, getContext(), bounds);
                metrics.setProperty(runtime, "bounds",  jsiBounds);
            }
            return metrics;
        }

        JSI_HOST_FUNCTION(getGlyphIDs) {
            auto str = arguments[0].asString(runtime).utf8(runtime);
            auto numGlyphIDs = count > 1 && !arguments[1].isNull() && !arguments[1].isUndefined()
                               ? arguments[1].asNumber() : str.length();
            std::vector<SkGlyphID> glyphIDs;
            glyphIDs.resize(numGlyphIDs);
            getObject()->textToGlyphs(str.c_str(), str.length(), SkTextEncoding::kUTF8,
                                      static_cast<SkGlyphID*>(glyphIDs.data()), numGlyphIDs);
            auto jsiGlyphIDs = jsi::Array(runtime, numGlyphIDs);
            for (int i = 0; i < numGlyphIDs; i++) {
                jsiGlyphIDs.setValueAtIndex(runtime, i, jsi::Value(static_cast<int>(glyphIDs[i])));
            }
            return jsiGlyphIDs;
        }

        JSI_HOST_FUNCTION(getGlyphIntercepts) {
            auto jsiGlyphs = arguments[0].asObject(runtime).asArray(runtime);
            auto jsiPositions = arguments[1].asObject(runtime).asArray(runtime);
            auto top = arguments[2].asNumber();
            auto bottom = arguments[3].asNumber();
            std::vector<SkPoint> positions;
            int pointsSize = static_cast<int>(jsiPositions.size(runtime));
            for (int i = 0; i < pointsSize; i++) {
                std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
                        runtime, jsiPositions.getValueAtIndex(runtime, i).asObject(runtime));
                positions.push_back(*point.get());
            }

            std::vector<SkGlyphID> glyphs;
            int glyphsSize = static_cast<int>(jsiGlyphs.size(runtime));
            for (int i = 0; i < glyphsSize; i++) {
                glyphs.push_back(jsiGlyphs.getValueAtIndex(runtime, i).asNumber());
            }

            if (glyphs.size() > positions.size()) {
                jsi::detail::throwJSError(runtime, "Not enough x,y position pairs for glyphs");
                return jsi::Value::null();
            }
            auto sects  = getObject()->getIntercepts(glyphs.data(), SkToInt(glyphs.size()), positions.data(), top, bottom);
            auto jsiSects = jsi::Array(runtime, sects.size());
            for (int i = 0; i < sects.size(); i++) {
                jsiSects.setValueAtIndex(runtime, i, jsi::Value(static_cast<int>(sects.at(i))));
            }
            return jsiSects;
        }

        JSI_HOST_FUNCTION(getScaleX) {
            return jsi::Value(SkScalarToDouble(getObject()->getScaleX()));
        }

        JSI_HOST_FUNCTION(getSize) {
            return jsi::Value(SkScalarToDouble(getObject()->getSize()));
        }

        JSI_HOST_FUNCTION(getSkewX) {
            return jsi::Value(SkScalarToDouble(getObject()->getSkewX()));
        }

        JSI_HOST_FUNCTION(isEmbolden) {
            return jsi::Value(getObject()->isEmbolden());
        }

        JSI_HOST_FUNCTION(getTypeface) {
            return JsiSkTypeface::toValue(runtime, getContext(), sk_sp<SkTypeface>(getObject()->getTypeface()));
        }

        JSI_HOST_FUNCTION(setEdging) {
            auto edging = arguments[0].asNumber();
            getObject()->setEdging(static_cast<SkFont::Edging>(edging));
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(embeddedBitmaps) {
            auto embeddedBitmaps = arguments[0].getBool();
            getObject()->setEmbeddedBitmaps(embeddedBitmaps);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setHinting) {
            auto hinting = arguments[0].asNumber();
            getObject()->setHinting(static_cast<SkFontHinting>(hinting));
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setLinearMetrics) {
            auto linearMetrics = arguments[0].getBool();
            getObject()->setLinearMetrics(linearMetrics);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setScaleX) {
            auto scaleX = arguments[0].asNumber();
            getObject()->setScaleX(scaleX);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setSkewX) {
            auto skewX = arguments[0].asNumber();
            getObject()->setSkewX(skewX);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setSize) {
            auto size = arguments[0].asNumber();
            getObject()->setSize(size);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setEmbolden) {
            auto embolden = arguments[0].asNumber();
            getObject()->setEmbolden(embolden);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setSubpixel) {
            auto subpixel = arguments[0].asNumber();
            getObject()->setSubpixel(subpixel);
            return jsi::Value::undefined();
        }

        JSI_HOST_FUNCTION(setTypeface) {
            auto typeface = arguments[0].isNull() ? nullptr : JsiSkTypeface::fromValue(runtime, arguments[0]);
            getObject()->setTypeface(typeface);
            return jsi::Value::undefined();
        }

        JSI_EXPORT_FUNCTIONS(
                JSI_EXPORT_FUNC(JsiSkFont, measureText),
                JSI_EXPORT_FUNC(JsiSkFont, getMetrics),
                JSI_EXPORT_FUNC(JsiSkFont, getGlyphIDs),
                JSI_EXPORT_FUNC(JsiSkFont, getGlyphIntercepts),
                JSI_EXPORT_FUNC(JsiSkFont, getScaleX),
                JSI_EXPORT_FUNC(JsiSkFont, getSkewX),
                JSI_EXPORT_FUNC(JsiSkFont, getTypeface),
                JSI_EXPORT_FUNC(JsiSkFont, setEdging),
                JSI_EXPORT_FUNC(JsiSkFont, embeddedBitmaps),
                JSI_EXPORT_FUNC(JsiSkFont, setHinting),
                JSI_EXPORT_FUNC(JsiSkFont, setLinearMetrics),
                JSI_EXPORT_FUNC(JsiSkFont, setScaleX),
                JSI_EXPORT_FUNC(JsiSkFont, setSkewX),
                JSI_EXPORT_FUNC(JsiSkFont, setSize),
                JSI_EXPORT_FUNC(JsiSkFont, setEmbolden),
                JSI_EXPORT_FUNC(JsiSkFont, setSubpixel),
                JSI_EXPORT_FUNC(JsiSkFont, setTypeface),
                JSI_EXPORT_FUNC(JsiSkFont, getGlyphWidths)
        )

        JsiSkFont(std::shared_ptr<RNSkPlatformContext> context, const SkFont &font)
                : JsiSkWrappingSharedPtrHostObject(context,
                                                   std::make_shared<SkFont>(font)){};

        /**
          Returns the underlying object from a host object of this type
         */
        static std::shared_ptr<SkFont> fromValue(jsi::Runtime &runtime,
                                                 const jsi::Value &obj) {
            return obj.asObject(runtime)
                    .asHostObject<JsiSkFont>(runtime)
                    .get()
                    ->getObject();
        }

        /**
         * Creates the function for construction a new instance of the SkFont
         * wrapper
         * @param context Platform context
         * @return A function for creating a new host object wrapper for the SkFont
         * class
         */
        static const jsi::HostFunctionType
        createCtor(std::shared_ptr<RNSkPlatformContext> context) {
            return JSI_HOST_FUNCTION_LAMBDA {
                // Handle arguments
                if (count == 2) {
                    auto typeface = JsiSkTypeface::fromValue(runtime, arguments[0]);
                    auto size = arguments[1].asNumber();
                    return jsi::Object::createFromHostObject(
                            runtime,
                            std::make_shared<JsiSkFont>(context, SkFont(typeface, size)));
                } else if (count == 1) {
                    auto typeface = JsiSkTypeface::fromValue(runtime, arguments[0]);
                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkFont>(context, SkFont(typeface)));
                } else {
                    // Return the newly constructed object
                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkFont>(context, SkFont()));
                }
            };
        }
    };

} // namespace RNSkia