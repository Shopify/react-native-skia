#pragma once

#include "JsiDomDeclarationNode.h"

#include "NodeProp.h"
#include "BlendModeProp.h"
#include "ColorProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiBaseColorFilterNode:
public JsiDomDeclarationNode<JsiBaseColorFilterNode, sk_sp<SkColorFilter>> {
public:
  JsiBaseColorFilterNode(std::shared_ptr<RNSkPlatformContext> context,
                         const char* type) :
  JsiDomDeclarationNode<JsiBaseColorFilterNode, sk_sp<SkColorFilter>>(context, type) {}
  
protected:
  
  void setColorFilter(DrawingContext* context, sk_sp<SkColorFilter> f) {
    set(context, f);
  }
  
  void set(DrawingContext* context, sk_sp<SkColorFilter> ColorFilter) override {
    auto paint = context->getMutablePaint();
    if (paint->getColorFilter() != nullptr && paint->getColorFilter() != getCurrent().get()) {
      paint->setColorFilter(SkColorFilters::Compose(paint->refColorFilter(), ColorFilter));
    } else {
      paint->setColorFilter(ColorFilter);
    }
    
    setCurrent(ColorFilter);
  }
};


class JsiMatrixColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiMatrixColorFilterNode> {
public:
  JsiMatrixColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skMatrixColorFilter") {}
    
protected:
  
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      auto array = _matrixProp->value()->getAsArray();
      float matrix[20];
      for (int i = 0; i < 20; i++) {
        if (array.size() > i) {
          matrix[i] = array[i]->getAsNumber();
        }
      }
      setColorFilter(context, SkColorFilters::Matrix(matrix));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _matrixProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("matrix")));
    _matrixProp->require();
  }
  
private:
  NodeProp* _matrixProp;
};


class JsiBlendColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiBlendColorFilterNode> {
public:
  JsiBlendColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skBlendColorFilter") {}
    
protected:
  
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      setColorFilter(context, SkColorFilters::Blend(*_colorProp->getDerivedValue(),
                                                    *_blendModeProp->getDerivedValue()));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _blendModeProp = container->defineProperty(std::make_shared<BlendModeProp>(JsiPropId::get("mode")));
    _colorProp = container->defineProperty(std::make_shared<ColorProp>(JsiPropId::get("color")));
    
    _blendModeProp->require();
    _colorProp->require();
  }
  
private:
  BlendModeProp* _blendModeProp;
  ColorProp* _colorProp;
};


class JsiLinearToSRGBGammaColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiLinearToSRGBGammaColorFilterNode> {
public:
  JsiLinearToSRGBGammaColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skLinearToSRGBGammaColorFilter") {}
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      setColorFilter(context, SkColorFilters::LinearToSRGBGamma());
    }
  }
};

class JsiSRGBToLinearGammaColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiSRGBToLinearGammaColorFilterNode> {
public:
  JsiSRGBToLinearGammaColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skSRGBToLinearGammaColorFilter") {}
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      setColorFilter(context, SkColorFilters::SRGBToLinearGamma());
    }
  }
};


class JsiLumaColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiLumaColorFilterNode> {
public:
  JsiLumaColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skLumaColorFilter") {}
protected:
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      setColorFilter(context, SkLumaColorFilter::Make());
    }
  }
};


class JsiLerpColorFilterNode : public JsiBaseColorFilterNode,
public JsiDomNodeCtor<JsiLerpColorFilterNode> {
public:
  JsiLerpColorFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseColorFilterNode(context, "skLerpColorFilter") {}
    
protected:
  
  void materialize(DrawingContext* context) override {
    if (isChanged(context)) {
      setColorFilter(context, SkColorFilters::Lerp(_tProp->value()->getAsNumber(),
                                                   requireChild(0)->getCurrent(),
                                                   requireChild(1)->getCurrent()));
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _tProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("t")));
    _tProp->require();
  }
  
private:
  NodeProp* _tProp;
};

}
