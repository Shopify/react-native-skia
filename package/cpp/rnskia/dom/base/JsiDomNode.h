#pragma once

#include "JsiHostObject.h"
#include "JsiDomNodeProps.h"

#include <vector>
#include <unordered_map>
#include <memory>

#include "RNSkPlatformContext.h"

namespace RNSkia {

class JsiDomNode:
  public JsiHostObject,
  public std::enable_shared_from_this<JsiDomNode> {
public:
  JsiDomNode(std::shared_ptr<RNSkPlatformContext> context,
             jsi::Runtime& runtime,
             const jsi::Value *arguments,
             size_t count):
  JsiHostObject(),
  _platformContext(context) {}
  
  JSI_HOST_FUNCTION(setProps) {
    setProps(runtime, getArgumentAsObject(runtime, arguments, count, 0));
    return jsi::Value::undefined();
  }
    
  JSI_HOST_FUNCTION(setProp) {
    auto key = getArgumentAsString(runtime, arguments, count, 0).utf8(runtime);
    const jsi::Value& value = getArgument(runtime, arguments, count, 1);
    setProp(runtime, key, value);
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(dispose) {
    dispose();
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(addChild) {
    // child: Node<unknown>
    auto newChild = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    addChild(newChild);
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(removeChild) {
    auto child = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    removeChild(child);
    return jsi::Value::undefined();
  }
    
  JSI_HOST_FUNCTION(insertChildBefore) {
    // child: Node<unknown>, before: Node<unknown>
    auto child = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    auto before = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 1);
    insertChildBefore(child, before);    
    return jsi::Value::undefined();
  }
    
  JSI_HOST_FUNCTION(isNative) {
    return true;
  }
    
  JSI_HOST_FUNCTION(children) {
    auto array = jsi::Array(runtime, _children.size());
    
    size_t index = 0;
    for(auto child: _children) {
      array.setValueAtIndex(runtime, index++, child->asHostObject(runtime));
    }
    return array;
  }
    
  JSI_PROPERTY_GET(type) {
    return jsi::String::createFromUtf8(runtime, getType());
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomNode, type))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose))
    
protected:
  
  jsi::Object asHostObject(jsi::Runtime &runtime) {
    return jsi::Object::createFromHostObject(runtime, shared_from_this());
  }
    
  virtual const char* getType() = 0;
    
  virtual void onPropsRead(jsi::Runtime& runtime) {};
    
  void setProps(jsi::Runtime &runtime, jsi::Object&& props) {
    if (_props != nullptr) {
      _props->unsubscribe();
    }    
    _props = std::make_shared<JsiDomNodeProps>(runtime, std::move(props));
    onPropsRead(runtime);
  };
  
  std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }
  
  const std::vector<std::shared_ptr<JsiDomNode>>& getChildren() {
    return _children;    
  }
    
  std::shared_ptr<JsiDomNodeProps> getProperties() { return _props; }
  
  void addChild(std::shared_ptr<JsiDomNode> child) {
    _children.push_back(child);
  }
  
  void insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) {
    auto position = std::find(_children.begin(), _children.end(), before);
    _children.insert(position, child);
  }
  
  void removeChild(std::shared_ptr<JsiDomNode> child) {
    _children.erase(std::remove_if(
      _children.begin(), _children.end(), [child](const auto &node) { return node == child; }),
      _children.end());
    
    // We don't need to call dispose since the dtor handles disposing
    child->dispose();
  }
    
  void dispose() {
    if (_props != nullptr) {
      _props->unsubscribe();
      _props = nullptr;
    }
  }
  
private:
  void setProp(jsi::Runtime &runtime, const std::string key, const jsi::Value& value) {
    _props->setProp(runtime, key, value);    
  };
  
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::vector<std::shared_ptr<JsiDomNode>> _children;
  std::shared_ptr<JsiDomNodeProps> _props;
};

}
