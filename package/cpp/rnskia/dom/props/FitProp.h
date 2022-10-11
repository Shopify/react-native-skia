#pragma once

#include "DerivedNodeProp.h"

namespace RNSkia {

class FitProp:
public BaseDerivedProp {
public:
  FitProp(PropId name): BaseDerivedProp() {
    _fitProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
private:
  NodeProp* _fitProp;
};
}

/**
 
 export type Fit =
   | "cover"
   | "contain"
   | "fill"
   | "fitHeight"
   | "fitWidth"
   | "none"
   | "scaleDown"

 */
