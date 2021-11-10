#pragma once

#include <jsi/jsi.h>
#include <map>

#define JSI_FUNC_SIGNATURE                                                     \
  [=](jsi::Runtime & runtime, const jsi::Value &thisValue,                     \
      const jsi::Value *arguments, size_t count) -> jsi::Value

namespace RNJsi {

using namespace facebook;

using JsPropertyType = struct {
  std::function<jsi::Value(jsi::Runtime &)> get;
  std::function<void(jsi::Runtime &, const jsi::Value &)> set;
};

/**
 * Base class for jsi host objects
 */
class JsiHostObject : public jsi::HostObject {

protected:
  /**
   * Overridden jsi::HostObject set property method
   * @param rt Runtime
   * @param name Name of value to set
   * @param value Value to set
   */
  void set(jsi::Runtime &rt, const jsi::PropNameID &name,
           const jsi::Value &value) override;

  /**
   * Overridden jsi::HostObject get property method. Returns functions from
   * the map of functions.
   * @param runtime Runtime
   * @param name Name of value to get
   * @return Value
   */
  jsi::Value get(jsi::Runtime &runtime, const jsi::PropNameID &name) override;

  /**
   * Overridden getPropertyNames from jsi::HostObject. Returns all keys in the
   * function and property maps
   * @param runtime Runtime
   * @return List of property names
   */
  std::vector<jsi::PropNameID> getPropertyNames(jsi::Runtime &runtime) override;

  /**
   * Installs a function into the function map
   */
  void installFunction(const std::string &name,
                       const jsi::HostFunctionType &function) {
    _funcMap.emplace(name, function);
  }

  /**
   * Installs a property with get/set
   * @param name Name of property to install
   * @param get Getter function
   * @param set Setter function
   */
  void installProperty(
      const std::string &name,
      const std::function<jsi::Value(jsi::Runtime &)> &get,
      const std::function<void(jsi::Runtime &, const jsi::Value &)> &set) {
    _propMap.emplace(name, JsPropertyType{.get = get, .set = set});
  }

  /**
   * Installs a property with only gettter
   * @param name Name of property to install
   * @param get Getter function
   */
  void installReadonlyProperty(
      const std::string &name,
      const std::function<jsi::Value(jsi::Runtime &)> &get) {
    _propMap.emplace(name, JsPropertyType{
                               .get = get,
                               .set = [](jsi::Runtime &, const jsi::Value &) {},
                           });
  }

  /**
   * Installs a property wich points to a given host object
   * @param name Name of property to install
   * @param hostObject Object to return
   */
  void installReadonlyProperty(const std::string &name,
                               std::shared_ptr<jsi::HostObject> hostObject) {
    _propMap.emplace(name, JsPropertyType{
                               .get =
                                   [hostObject](jsi::Runtime &runtime) {
                                     return jsi::Object::createFromHostObject(
                                         runtime, hostObject);
                                   },
                               .set = [](jsi::Runtime &, const jsi::Value &) {},
                           });
  }

private:
  std::map<std::string, jsi::HostFunctionType> _funcMap;
  std::map<std::string, JsPropertyType> _propMap;
};
} // namespace RNJsi
