#include <JsiHostObject.h>

namespace RNJsi {
void JsiHostObject::set(jsi::Runtime &rt, const jsi::PropNameID &name,
                        const jsi::Value &value) {
  auto nameVal = name.utf8(rt);
  auto nameStr = nameVal.c_str();
  if (_propMap.count(nameStr) > 0) {
    auto prop = _propMap.at(nameStr);
    (prop.set)(rt, value);
  }
}

jsi::Value JsiHostObject::get(jsi::Runtime &runtime,
                              const jsi::PropNameID &name) {
  auto nameVal = name.utf8(runtime);
  auto nameStr = nameVal.c_str();

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
  std::vector<jsi::PropNameID> retVal;
  // functions
  for (auto it = _funcMap.begin(); it != _funcMap.end(); ++it) {
    retVal.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }
  // props
  for (auto it = _propMap.begin(); it != _propMap.end(); ++it) {
    retVal.push_back(jsi::PropNameID::forAscii(runtime, it->first));
  }
  return retVal;
}
} // namespace RNJsi
