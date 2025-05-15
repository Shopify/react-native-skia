#pragma once

#include "modules/skottie/include/SkottieProperty.h"


namespace RNSkia {

/**
 * Custom implementation of PropertyObserver that can be extended
 * for specific use cases.
 */
class CustomPropertyObserver: public skottie::PropertyObserver {
public:
 
    
    void onColorProperty(const char node_name[],
                            const skottie::PropertyObserver::LazyHandle<skottie::ColorPropertyHandle>& prop) {
        auto value = prop();
        auto color = value->get();
        fColorMap[node_name] = color;
    }
    
    // void onOpacityProperty(const char node_name[],
    //                          const LazyHandle<skottie::OpacityPropertyHandle>& prop) {
    //     auto value = prop();
    //     auto opacity = value->get();
    //     fOpacityMap[node_name] = opacity;
    // }
    
    // void onTextProperty(const char node_name[],
    //                       const LazyHandle<skottie::TextPropertyHandle>& prop) {
    //     auto value = prop();
    //     auto text = value->get();
    //     fTextMap[node_name] = text;
    // }
    
    // void onTransformProperty(const char node_name[],
    //                            const LazyHandle<skottie::TransformPropertyHandle>& prop) {
    //     auto value = prop();
    //     auto transform = value->get();
    //     fTransformMap[node_name] = transform;
    // }

//    std::unordered_map<std::string, SkColor> getColorMap() {
//        return fColorMap;
//    }
//    
    // std::unordered_map<std::string, float> getOpacityMap() {
    //     return fOpacityMap;
    // }
    
    // std::unordered_map<std::string, skottie::TextPropertyValue> getTextMap() {
    //     return fTextMap;
    // }
    
    // std::unordered_map<std::string, skottie::TransformPropertyValue> getTransformMap() {
    //     return fTransformMap;
    // }
    
private:
  std::unordered_map<std::string, SkColor> fColorMap;
//   std::unordered_map<std::string, float> fOpacityMap;
//   std::unordered_map<std::string, skottie::TextPropertyValue> fTextMap;
//   std::unordered_map<std::string, skottie::TransformPropertyValue> fTransformMap;
};

} // namespace RNSkia
