#pragma once

#include "JsiHostObject.h"
#include "JsiDomNodeProps.h"

#include <vector>
#include <unordered_map>
#include <memory>

#include "RNSkPlatformContext.h"

namespace RNSkia {

/**
 Implements an abstract base class for nodes in the Skia Reconciler. This node coresponds to the native implementation
 of the Node.ts class in Javascript.
 */
class JsiDomNode :
public JsiHostObject,
public std::enable_shared_from_this<JsiDomNode> {
public:
  /**
   Contructor. Takes as parameters the values comming from the JS world that initialized the class.
   */
  JsiDomNode(std::shared_ptr<RNSkPlatformContext>,
             jsi::Runtime &runtime,
             const jsi::Value *arguments,
             size_t count) :
  JsiHostObject() {}
  
  /**
   JS-function for setting the properties from the JS reconciler on the node.
   */
  JSI_HOST_FUNCTION(setProps) {
    setProps(runtime, getArgumentAsObject(runtime, arguments, count, 0));
    return jsi::Value::undefined();
  }
  
  /**
   JS Function to be called when the node is no longer part of the reconciler tree. Use for cleaning up.
   */
  JSI_HOST_FUNCTION(dispose) {
    dispose();
    return jsi::Value::undefined();
  }
  
  /**
   JS Function for adding a child node to this node.
   */
  JSI_HOST_FUNCTION(addChild) {
    // child: Node<unknown>
    auto newChild = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    addChild(newChild);
    return jsi::Value::undefined();
  }
  
  /*
   JS Function for removing a child node from this node
   */
  JSI_HOST_FUNCTION(removeChild) {
    auto child = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    removeChild(child);
    return jsi::Value::undefined();
  }
  
  /**
   JS Function for insering a child node to a specific location in the children array on this node
   */
  JSI_HOST_FUNCTION(insertChildBefore) {
    // child: Node<unknown>, before: Node<unknown>
    auto child = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 0);
    auto before = getArgumentAsHostObject<JsiDomNode>(runtime, arguments, count, 1);
    insertChildBefore(child, before);
    return jsi::Value::undefined();
  }
  
  /**
   JS Function returning true for native nodes.
   */
  JSI_HOST_FUNCTION(isNative) {
    return true;
  }
  
  /**
   JS Function for getting child nodes for this node
   */
  JSI_HOST_FUNCTION(children) {
    auto array = jsi::Array(runtime, _children.size());
    
    size_t index = 0;
    for (auto child: _children) {
      array.setValueAtIndex(runtime, index++, child->asHostObject(runtime));
    }
    return array;
  }
  
  /**
   JS Property for getting the type of node
   */
  JSI_PROPERTY_GET(type) {
    return jsi::String::createFromUtf8(runtime, getType());
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomNode, type))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose))
  
  /**
   Returns the type of node. Must be overridden in implementations of this abstract class.
  */
  virtual const char *getType() = 0;
  
protected:
  
  /**
   Returns this node as a host object that can be returned to the JS side.
  */
  jsi::Object asHostObject(jsi::Runtime &runtime) {
    return jsi::Object::createFromHostObject(runtime, shared_from_this());
  }
  
  /**
   Called when properties are set from the JS reconciler on the node. To optimize reading properties
   each node needs to explicitly tell the props object which objects it expects and what types they are.
   See the JsiDomNodeProps class for details.
  */
  virtual void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) {
    // We don't need to do anything in the base class since we don't have any
    // properties that we want to read.
  };
  
  /**
   Called when one or more properties have changed from the native side due to updates
   from animation values or other mechanisms.
   */
  virtual void onPropsChanged(JsiDomNodeProps* props) {};
  
  /**
   Native implementation of the set properties method. This is called from the reconciler when
   properties are set due to changes in React. This method will always call the onPropsSet method
   as a signal that things have changed.
   */
  void setProps(jsi::Runtime &runtime, jsi::Object &&props) {
    {
      if (_props != nullptr) {
        _props->unsubscribe();
      }
      _props = std::make_shared<JsiDomNodeProps>(runtime, std::move(props));
    }
    onPropsSet(runtime, _props.get());
  };
  
  /**
   Returns all child JsiDomNodes for this node.
   */
  const std::vector<std::shared_ptr<JsiDomNode>> &getChildren() {
    return _children;
  }
  
  /**
   Returns all properties for this node
   */
  JsiDomNodeProps* getProperties() {
    return _props.get();
  }
  
  /**
   Adds a child node to the array of children for this node
   */
  virtual void addChild(std::shared_ptr<JsiDomNode> child) {
    _children.push_back(child);
  }
  
  /**
   Inserts a child node before a given child node in the children array for this node
   */
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) {
    auto position = std::find(_children.begin(), _children.end(), before);
    _children.insert(position, child);
  }
  
  /**
   Removes a child. Removing a child will remove the child from the array of children and call dispose on the child node.
   */
  virtual void removeChild(std::shared_ptr<JsiDomNode> child) {
    _children.erase(std::remove_if(_children.begin(), _children.end(),
                                   [child](const auto &node) { return node == child; }),
                    _children.end());
    
    // We don't need to call dispose since the dtor handles disposing
    child->dispose();
  }
  
  /**
   Clean up resources in use by the node. We have to explicitly call dispose when the node is removed from the
   reconciler tree, since due to garbage collection we can't be sure that the destructor is called when the node is
   removed - JS might hold a reference that will later be GC'ed.
   */
  void dispose() {
    if (_props != nullptr) {
      _props->unsubscribe();
      _props = nullptr;
    }
  }
  
private:
  
  std::vector<std::shared_ptr<JsiDomNode>> _children;
  std::shared_ptr<JsiDomNodeProps> _props;
};

}
