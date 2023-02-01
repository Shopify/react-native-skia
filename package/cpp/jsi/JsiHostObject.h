#pragma once

#include <jsi/jsi.h>

#include <functional>
#include <map>
#include <memory>
#include <string>
#include <unordered_map>
#include <vector>

#define STR_CAT_NX(A, B) A##B
#define STR_CAT(A, B) STR_CAT_NX(A, B)
#define STR_GET get_
#define STR_SET set_

/**
 * Creates a new Host function declaration as a lambda with all deps passed
 * with implicit lambda capture clause
 */
#define JSI_HOST_FUNCTION_LAMBDA                                               \
  [=](jsi::Runtime & runtime, const jsi::Value &thisValue,                     \
      const jsi::Value *arguments, size_t count) -> jsi::Value

/**
 * Creates a new Host function declaration
 */
#define JSI_HOST_FUNCTION(NAME)                                                \
  jsi::Value NAME(jsi::Runtime &runtime, const jsi::Value &thisValue,          \
                  const jsi::Value *arguments, size_t count)

/**
 * Creates a new property setter function declaration
 */
#define JSI_PROPERTY_SET(NAME)                                                 \
  void STR_CAT(STR_SET, NAME)(jsi::Runtime & runtime, const jsi::Value &value)

/**
 * Creates a new property getter function declaration
 */
#define JSI_PROPERTY_GET(NAME)                                                 \
  jsi::Value STR_CAT(STR_GET, NAME)(jsi::Runtime & runtime)

/**
 * Creates a JSI export function declaration
 */
#define JSI_EXPORT_FUNC(CLASS, FUNCTION)                                       \
  {                                                                            \
#FUNCTION, (jsi::Value(JsiHostObject::*)(                                  \
                   jsi::Runtime & runtime, const jsi::Value &thisValue,        \
                   const jsi::Value *arguments, size_t)) &                     \
                   CLASS::FUNCTION                                             \
  }

/**
 * Creates a JSI export functions statement
 */
#define JSI_EXPORT_FUNCTIONS(...)                                              \
  const RNJsi::JsiFunctionMap &getExportedFunctionMap() override {             \
    static RNJsi::JsiFunctionMap map = {__VA_ARGS__};                          \
    return map;                                                                \
  }

/**
 * Creates a JSI export getter declaration
 */
#define JSI_EXPORT_PROP_GET(CLASS, FUNCTION)                                   \
  {                                                                            \
#FUNCTION, (jsi::Value(JsiHostObject::*)(jsi::Runtime & runtime)) &        \
                   CLASS::STR_CAT(STR_GET, FUNCTION)                           \
  }

/**
 * Creates a JSI export getters statement
 */
#define JSI_EXPORT_PROPERTY_GETTERS(...)                                       \
  const RNJsi::JsiPropertyGettersMap &getExportedPropertyGettersMap()          \
      override {                                                               \
    static RNJsi::JsiPropertyGettersMap map = {__VA_ARGS__};                   \
    return map;                                                                \
  }

/**
 * Creates a JSI export setter declaration
 */
#define JSI_EXPORT_PROP_SET(CLASS, FUNCTION)                                   \
  {                                                                            \
#FUNCTION,                                                                 \
        (void(JsiHostObject::*)(jsi::Runtime & runtime, const jsi::Value &)) & \
            CLASS::STR_CAT(STR_SET, FUNCTION)                                  \
  }

/**
 * Creates a JSI export setters statement
 */
#define JSI_EXPORT_PROPERTY_SETTERS(...)                                       \
  const RNJsi::JsiPropertySettersMap &getExportedPropertySettersMap()          \
      override {                                                               \
    static RNJsi::JsiPropertySettersMap map = {__VA_ARGS__};                   \
    return map;                                                                \
  }

namespace RNJsi {

namespace jsi = facebook::jsi;

using JsPropertyType = struct {
  std::function<jsi::Value(jsi::Runtime &)> get;
  std::function<void(jsi::Runtime &, const jsi::Value &)> set;
};

using JsiFunctionCacheKey = std::pair<jsi::Runtime*,std::string>;

class JsiHostObject;

using JsiFunctionMap =
    std::unordered_map<std::string, jsi::Value (JsiHostObject::*)(
                                        jsi::Runtime &, const jsi::Value &,
                                        const jsi::Value *, size_t)>;

using JsiPropertyGettersMap =
    std::unordered_map<std::string,
                       jsi::Value (JsiHostObject::*)(jsi::Runtime &)>;

using JsiPropertySettersMap =
    std::unordered_map<std::string, void (JsiHostObject::*)(
                                        jsi::Runtime &, const jsi::Value &)>;

struct RuntimeMonitorListener {
  virtual ~RuntimeMonitorListener() {}
  virtual void onRuntimeDestroyed(jsi::Runtime *) = 0;
};

struct RuntimeMonitor {
  static void addRuntimeListener(jsi::Runtime &rt, RuntimeMonitorListener *listener);
  static void removeRuntimeListener(jsi::Runtime &rt, RuntimeMonitorListener *listener);
};

template <typename StoreType>
class JsiRuntimeAwareStore : public RuntimeMonitorListener {

private:
  jsi::Runtime *_primaryRuntime, *_secondaryRuntime;
  std::unique_ptr<StoreType> _primaryStore, _secondaryStore;

public:

  void onRuntimeDestroyed(jsi::Runtime *rt) override {
    if (_primaryRuntime == rt) {
      _primaryRuntime = _secondaryRuntime;
      _secondaryRuntime = nullptr;
      _primaryStore = nullptr;
      _primaryStore.swap(_secondaryStore);
    } else if (_secondaryRuntime == rt) {
      _secondaryRuntime = nullptr;
      _secondaryStore = nullptr;
    }
  }

  ~JsiRuntimeAwareStore() {
    if (_secondaryRuntime != nullptr) {
      RuntimeMonitor::removeRuntimeListener(*_secondaryRuntime, this);
    }
  }

  StoreType& get(jsi::Runtime &rt) {
    if (_primaryRuntime == &rt) {
      return *_primaryStore;
    } else if (_primaryRuntime == nullptr) {
      _primaryRuntime = &rt;
      _primaryStore = std::make_unique<StoreType>();
      return *_primaryStore;
    } else if (_secondaryRuntime == &rt) {
      return *_secondaryStore;
    } else if (_secondaryStore == nullptr) {
      _secondaryRuntime = &rt;
      _secondaryStore = std::make_unique<StoreType>();
      // we only add listener when the secondary runtime is used, this assumes that the secondary
      // runtime is terminated first. This lets us avoid additional complexity for the majority of
      // cases when objects are not shared between runtimes. Otherwise we'd have to register all
      // objecrts with the RuntimeMonitor as opposed to only registering ones that are used in secondary
      // runtime. Note that we can't register listener here with the primary runtime as it may run
      // on a separate thread.
      RuntimeMonitor::addRuntimeListener(rt, this);
      return *_secondaryStore;
    } else {
      // we don't support more than two stores
      throw std::runtime_error("RuntimeAwareStore supports up to two separate JSI runtimes");
    }
  }
};

/**
 * Base class for jsi host objects
 */
class JsiHostObject : public jsi::HostObject {
public:
  JsiHostObject();
  ~JsiHostObject();

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

protected:
  /**
   Override to return map of name/functions
   */
  virtual const RNJsi::JsiFunctionMap &getExportedFunctionMap() {
    static const RNJsi::JsiFunctionMap empty;
    return empty;
  }

  /**
   Override to get property getters map of name/functions
   */
  virtual const JsiPropertyGettersMap &getExportedPropertyGettersMap() {
    static const JsiPropertyGettersMap empty;
    return empty;
  }

  /**
   Override to get property setters map of name/functions
   */
  virtual const JsiPropertySettersMap &getExportedPropertySettersMap() {
    static const JsiPropertySettersMap empty;
    return empty;
  }

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
   * Installs a property with only getter
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
   * Installs a property which points to a given host object
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

  /**
   @Returns a reference to the argument at the given position in the arguments
   array. Raises an error if the index is above the number of arguments.
   @param runtime jsi::Runtime
   @param arguments Arguments list
   @param count Number of arguments in arguments list
   @param index Index of parameter to return
   */
  static const jsi::Value &getArgument(jsi::Runtime &runtime,
                                       const jsi::Value *arguments,
                                       size_t count, size_t index) {
    if (index >= count) {
      throw jsi::JSError(runtime, "Argument index out of bounds.");
    }

    return arguments[index];
  }

  /**
   Returns argument as number or throws
   */
  static double getArgumentAsNumber(jsi::Runtime &runtime,
                                    const jsi::Value *arguments, size_t count,
                                    size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isNumber()) {
      throw jsi::JSError(runtime,
                         "Expected type number for parameter at index " +
                             std::to_string(index));
    }
    return value.asNumber();
  }

  /**
   Returns argument as bool or throws
   */
  static bool getArgumentAsBool(jsi::Runtime &runtime,
                                const jsi::Value *arguments, size_t count,
                                size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isBool()) {
      throw jsi::JSError(runtime,
                         "Expected type boolean for parameter at index " +
                             std::to_string(index));
    }
    return value.getBool();
  }

  /**
   Returns argument as string or throws
   */
  static jsi::String getArgumentAsString(jsi::Runtime &runtime,
                                         const jsi::Value *arguments,
                                         size_t count, size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isString()) {
      throw jsi::JSError(runtime,
                         "Expected type string for parameter at index " +
                             std::to_string(index));
    }
    return value.asString(runtime);
  }

  /**
   Returns argument as object or throws
   */
  static jsi::Object getArgumentAsObject(jsi::Runtime &runtime,
                                         const jsi::Value *arguments,
                                         size_t count, size_t index) {
    const jsi::Value &value = getArgument(runtime, arguments, count, index);
    if (!value.isObject()) {
      throw jsi::JSError(runtime,
                         "Expected type object for parameter at index " +
                             std::to_string(index));
    }
    return value.asObject(runtime);
  }

  /**
   Returns argument as host object or throws
   */
  template <typename T = HostObject>
  static std::shared_ptr<T>
  getArgumentAsHostObject(jsi::Runtime &runtime, const jsi::Value *arguments,
                          size_t count, size_t index) {
    auto value = getArgumentAsObject(runtime, arguments, count, index);
    if (!value.isHostObject(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected type host object for parameter at index " +
                             std::to_string(index));
    }
    return value.asHostObject<T>(runtime);
  }

  /**
   Returns argument as array or throws
   */
  static jsi::Array getArgumentAsArray(jsi::Runtime &runtime,
                                       const jsi::Value *arguments,
                                       size_t count, size_t index) {
    auto value = getArgumentAsObject(runtime, arguments, count, index);
    if (!value.isArray(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected type array for parameter at index " +
                             std::to_string(index));
    }
    return value.asArray(runtime);
  }

  /**
   Returns argument as function or throws
   */
  static jsi::Object getArgumentAsFunction(jsi::Runtime &runtime,
                                           const jsi::Value *arguments,
                                           size_t count, size_t index) {
    auto value = getArgumentAsObject(runtime, arguments, count, index);
    if (!value.isFunction(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected type function for parameter at index " +
                             std::to_string(index));
    }
    return value.asFunction(runtime);
  }

private:
  std::unordered_map<std::string, jsi::HostFunctionType> _funcMap;
  std::unordered_map<std::string, JsPropertyType> _propMap;

  JsiRuntimeAwareStore<std::map<std::string, jsi::Function>> _hostFunctionCache;
};
} // namespace RNJsi
