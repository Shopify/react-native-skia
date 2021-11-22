#include <JsiHostObject.h>
#include <set>

namespace RNJsi {
void JsiHostObject::set(jsi::Runtime &rt, const jsi::PropNameID &name,
                        const jsi::Value &value) {
  auto nameVal = name.utf8(rt);
  auto nameStr = nameVal.c_str();

  /** Check the static setters map */
  auto setters = getExportedPropertySettersMap();
  auto setter = setters.find(nameStr);
  if (setter != setters.end()) {
    auto dispatcher = std::bind(setter->second, this, std::placeholders::_1,
                                std::placeholders::_2);
    return dispatcher(rt, value);
  }

  if (_propMap.count(nameStr) > 0) {
    auto prop = _propMap.at(nameStr);
    (prop.set)(rt, value);
  }
}

jsi::Value JsiHostObject::get(jsi::Runtime &runtime,
                              const jsi::PropNameID &name) {
  auto nameVal = name.utf8(runtime);
  auto nameStr = nameVal.c_str();

  /** Start by checking the cache for functions */
  auto runtimeCache = _cache.find(&runtime);
  std::unordered_map<std::string, std::shared_ptr<jsi::Function>> *currentCache;
  if (runtimeCache != _cache.end()) {
    currentCache = &runtimeCache->second;
    // Check if the runtime cache as a cache of the host function
    auto cachedFunc = runtimeCache->second.find(nameStr);
    if (cachedFunc != runtimeCache->second.end()) {
      return cachedFunc->second->asFunction(runtime);
    }
  } else {
    // Create cache for this runtime
    std::unordered_map<std::string, std::shared_ptr<jsi::Function>>
        runtimeCache;
    _cache.emplace(&runtime, runtimeCache);
    currentCache = &runtimeCache;
  }

  /* Check the static function map */
  auto funcs = getExportedFunctionMap();
  auto func = funcs.find(nameStr);
  if (func != funcs.end()) {
    auto retVal =
        std::make_shared<jsi::Function>(jsi::Function::createFromHostFunction(
            runtime, name, 0,
            std::bind(func->second, this, std::placeholders::_1,
                      std::placeholders::_2, std::placeholders::_3,
                      std::placeholders::_4)));

    // Add to cache
    currentCache->emplace(nameStr, retVal);

    // return retVal;
    return retVal->asFunction(runtime);
  }

  /** Check the static getters map */
  auto getters = getExportedPropertyGettersMap();
  auto getter = getters.find(nameStr);
  if (getter != getters.end()) {
    auto dispatcher = std::bind(getter->second, this, std::placeholders::_1);
    return dispatcher(runtime);
  }

  if (_funcMap.count(nameStr) > 0) {
    return jsi::Function::createFromHostFunction(runtime, name, 0,
                                                 _funcMap.at(nameStr));
  }

  if (_propMap.count(nameStr) > 0) {
    auto prop = _propMap.at(nameStr);
    return (prop.get)(runtime);
  }

  return jsi::Value::undefined();
}

std::vector<jsi::PropNameID>
JsiHostObject::getPropertyNames(jsi::Runtime &runtime) {
  std::vector<jsi::PropNameID> propNames;
  // statically exported functions
  auto funcs = getExportedFunctionMap();
  for (auto it = funcs.begin(); it != funcs.end(); ++it) {
    propNames.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }

  // Statically exported property getters
  auto getters = getExportedPropertyGettersMap();
  for (auto it = getters.begin(); it != getters.end(); ++it) {
    propNames.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }

  // Statically exported property setters
  auto setters = getExportedPropertySettersMap();
  for (auto it = getters.begin(); it != getters.end(); ++it) {
    if (getters.count(it->first) == 0) {
      propNames.push_back(jsi::PropNameID::forAscii(runtime, it->first));
    }
  }

  // functions
  for (auto it = _funcMap.begin(); it != _funcMap.end(); ++it) {
    propNames.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }
  // props
  for (auto it = _propMap.begin(); it != _propMap.end(); ++it) {
    propNames.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }
  return propNames;
}

} // namespace RNJsi
