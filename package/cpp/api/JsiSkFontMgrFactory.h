#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkFontMgr.h"
#include "JsiSKData.h"
#include <SkFontMgr.h>

// TODO: include proper header instead, this might require a Skia version upgrade?
sk_sp<SkFontMgr> SkFontMgr_New_Custom_Data(sk_sp<SkData>* datas, int n);

#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkFontMgrFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(FromData) {
            std::vector<sk_sp<SkData>> data;
            for (int i = 0; i < count; i++) {
                auto d = JsiSkData::fromValue(
                        runtime, arguments[i]);
                data.push_back(d);
            }

            auto fontMgr = SkFontMgr_New_Custom_Data(data.data(), data.size());
            return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkFontMgr>(getContext(), fontMgr));
        }

        JSI_HOST_FUNCTION(RefDefault) {
            auto fontMgr = SkFontMgr::RefDefault();
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkFontMgr>(getContext(), fontMgr));
        }

        JSI_EXPORT_FUNCTIONS(
                JSI_EXPORT_FUNC(JsiSkFontMgrFactory, FromData),
                JSI_EXPORT_FUNC(JsiSkFontMgrFactory, RefDefault)
        )

        JsiSkFontMgrFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(context) {}
    };

} // namespace RNSkia
