#pragma once

#include "modules/skottie/include/SkottieProperty.h"

namespace skottie {

void PropertyObserver::onColorProperty(const char node_name[],
                         const LazyHandle<skottie::ColorPropertyHandle>& prop) {
}
                         
void PropertyObserver::onOpacityProperty(const char node_name[],
                           const LazyHandle<skottie::OpacityPropertyHandle>& prop)  {}
                           
void PropertyObserver::onTextProperty(const char node_name[],
                        const LazyHandle<skottie::TextPropertyHandle>& prop)  {}
                        
void PropertyObserver::onTransformProperty(const char node_name[],
                             const LazyHandle<skottie::TransformPropertyHandle>& prop)  {}
                             
void PropertyObserver::onEnterNode(const char node_name[], NodeType node_type)  {}
    
void PropertyObserver::onLeavingNode(const char node_name[], NodeType node_type)  {}



} // namespace skottie_utils

namespace RNSkia {

/**
 * Custom implementation of PropertyObserver that can be extended
 * for specific use cases.
 */
class CustomPropertyObserver : public skottie::PropertyObserver {
public:
 
    
    void onColorProperty(const char node_name[],
                            const LazyHandle<skottie::ColorPropertyHandle>& prop) {
        auto value = prop();
        auto color = value->get();
        fColorMap[node_name] = color;
    }
private:
  std::unordered_map<std::string, SkColor> fColorMap;
};

} // namespace RNSkia
