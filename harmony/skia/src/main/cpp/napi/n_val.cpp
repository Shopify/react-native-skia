/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#include "n_val.h"
// #include <memory>
#include <string>

using namespace std;

NVal::NVal(napi_env nEnv, napi_value nVal = nullptr) : env_(nEnv), val_(nVal) {}

NVal::operator bool() const { return env_ && val_; }

bool NVal::TypeIs(napi_valuetype expType) const {
    if (!*this) {
        return false;
    }

    napi_valuetype valueType;
    napi_typeof(env_, val_, &valueType);

    if (expType != valueType) {
        return false;
    }
    return true;
}

bool NVal::IsNull() const {
    if (val_ == nullptr) {
        return true;
    }
    napi_valuetype valueType;
    napi_typeof(env_, val_, &valueType);
    if (valueType == napi_null) {
        return true;
    }
    if (valueType == napi_undefined) {
        return true;
    }
    return false;
}

bool NVal::IsUndefined() const {
    if (val_ == nullptr) {
        return false;
    }
    napi_valuetype valueType;
    napi_typeof(env_, val_, &valueType);
    if (valueType == napi_undefined) {
        return true;
    }
    return false;
}

bool NVal::IsBufferArray() const {
    if (val_ == nullptr) {
        return false;
    }
    bool type = false;
    napi_is_dataview(env_, val_, &type);
    if (type) {
        return true;
    }
    napi_is_arraybuffer(env_, val_, &type);
    if (type) {
        return true;
    }
    napi_is_typedarray(env_, val_, &type);
    if (type) {
        return true;
    }
    return false;
}

tuple<bool, bool> NVal::IsArray() const {
    bool res = false;
    napi_status status = napi_is_array(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, unique_ptr<char[]>, size_t> NVal::ToUTF8String() const {
    napi_valuetype valueType;
    napi_typeof(env_, val_, &valueType);
    if (valueType == napi_null) {
        unique_ptr<char[]> str = make_unique<char[]>(1);
        str[0] = '\0';
        return {true, move(str), 0};
    } else if (valueType != napi_string) {
        return {false, nullptr, 0};
    }
    size_t strLen = 0;
    napi_status status = napi_get_value_string_utf8(env_, val_, nullptr, -1, &strLen);
    if (status != napi_ok) {
        return {false, nullptr, 0};
    }

    size_t bufLen = strLen + 1;
    unique_ptr<char[]> str = make_unique<char[]>(bufLen);
    status = napi_get_value_string_utf8(env_, val_, str.get(), bufLen, &strLen);
    return make_tuple(status == napi_ok, move(str), strLen);
}

tuple<bool, unique_ptr<char[]>, size_t> NVal::ToUTF16String() const {
#ifdef FILE_SUBSYSTEM_DEV_ON_PC
    size_t strLen = 0;
    napi_status status = napi_get_value_string_utf16(env_, val_, nullptr, -1, &strLen);
    if (status != napi_ok) {
        return {false, nullptr, 0};
    }

    auto str = make_unique<char16_t[]>(++strLen);
    status = napi_get_value_string_utf16(env_, val_, str.get(), strLen, nullptr);
    if (status != napi_ok) {
        return {false, nullptr, 0};
    }

    strLen = reinterpret_cast<char *>(str.get() + strLen) - reinterpret_cast<char *>(str.get());
    auto strRet = unique_ptr<char[]>(reinterpret_cast<char *>(str.release()));
    return {true, move(strRet), strLen};
#else
    // Note that quickjs doesn't support utf16
    return ToUTF8String();
#endif
}

tuple<bool, void *> NVal::ToPointer() const {
    void *res = nullptr;
    napi_status status = napi_get_value_external(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, bool> NVal::IsTypeArray() const {
    bool res = false;
    napi_status status = napi_is_typedarray(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

bool NVal::IsDataView() const {
    bool res = false;
    napi_status status = napi_is_dataview(env_, val_, &res);
    return ((status == napi_ok) && res);
}

tuple<bool, bool> NVal::ToBool() const {
    bool flag = false;
    if (IsNull()) {
        return make_tuple(true, flag);
    }
    napi_status status = napi_get_value_bool(env_, val_, &flag);
    return make_tuple(status == napi_ok, flag);
}

tuple<bool, double> NVal::ToDouble() const {
    double res = 0.0;
    napi_status status = napi_get_value_double(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, GLfloat> NVal::ToFloat() const {
    if (IsUndefined()) {
        float f = 0;
        //         memset_s(&f, sizeof(f), 0xff, sizeof(f));
        return make_tuple(true, f);
    }
    if (IsNull()) {
        return make_tuple(true, 0);
    }
    double res = 0.0;
    napi_status status = napi_get_value_double(env_, val_, &res);
    return make_tuple(status == napi_ok, static_cast<GLfloat>(res));
}

tuple<bool, int32_t> NVal::ToInt32() const {
    int32_t res = 0;
    if (IsNull()) {
        return make_tuple(true, res);
    }
    napi_status status = napi_get_value_int32(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, uint32_t> NVal::ToUint32() const {
    uint32_t res = 0;
    if (IsNull()) {
        return make_tuple(true, res);
    }
    napi_status status = napi_get_value_uint32(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, int64_t> NVal::ToInt64() const {
    int64_t res = 0;
    if (IsNull()) {
        return make_tuple(true, res);
    }
    napi_status status = napi_get_value_int64(env_, val_, &res);
    return make_tuple(status == napi_ok, res);
}

tuple<bool, GLsizei> NVal::ToGLsizei() const {
    int64_t res = 0;
    if (IsNull()) {
        return make_tuple(true, res);
    }
    napi_status status = napi_get_value_int64(env_, val_, &res);
    return make_tuple(status == napi_ok, static_cast<GLsizei>(res));
}

tuple<bool, GLenum> NVal::ToGLenum() const {
    int64_t res = 0;
    napi_valuetype valueType;
    napi_typeof(env_, val_, &valueType);
    if (valueType == napi_null) {
        return make_tuple(true, static_cast<GLenum>(res));
    }
    napi_status status = napi_get_value_int64(env_, val_, &res);
    return make_tuple(status == napi_ok, static_cast<GLenum>(res));
}

tuple<bool, void *, size_t> NVal::ToArraybuffer() const {
    void *buf = nullptr;
    size_t bufLen = 0;
    bool status = napi_get_arraybuffer_info(env_, val_, &buf, &bufLen);
    return make_tuple(status == napi_ok, buf, bufLen);
}

tuple<bool, napi_typedarray_type, void *, size_t> NVal::ToTypedArray() const {
    napi_typedarray_type type;
    napi_value in_array_buffer = nullptr;
    size_t byte_offset;
    size_t length;
    void *data = nullptr;
    napi_status status =
        napi_get_typedarray_info(env_, val_, &type, &length, (void **)&data, &in_array_buffer, &byte_offset);
    return make_tuple(status == napi_ok, type, data, length);
}

tuple<bool, void *, size_t> NVal::ToDataview() const {
    size_t bufLen = 0;
    void *buf = nullptr;
    napi_value arraybuffer = nullptr;
    size_t byteoff = 0;
    bool status = napi_get_dataview_info(env_, val_, &bufLen, &buf, &arraybuffer, &byteoff);
    return make_tuple(status == napi_ok, buf, bufLen);
}

tuple<bool, void *, size_t, size_t, napi_typedarray_type> NVal::ToTypedArrayInfo() const {
    napi_typedarray_type type;
    napi_value in_array_buffer = nullptr;
    size_t byte_offset;
    size_t length;
    void *data = nullptr;
    napi_status status =
        napi_get_typedarray_info(env_, val_, &type, &length, (void **)&data, &in_array_buffer, &byte_offset);
    return make_tuple(status == napi_ok, data, length, byte_offset, type);
}

bool NVal::HasProp(string propName) const {
    bool res = false;

    if (!env_ || !val_ || !TypeIs(napi_object)) {
        return false;
    }

    napi_status status = napi_has_named_property(env_, val_, propName.c_str(), &res);
    return (status == napi_ok) && res;
}

NVal NVal::GetProp(string propName) const {
    if (!HasProp(propName)) {
        return {env_, nullptr};
    }
    napi_value prop = nullptr;
    napi_status status = napi_get_named_property(env_, val_, propName.c_str(), &prop);
    if (status != napi_ok) {
        return {env_, nullptr};
    }
    return NVal(env_, prop);
}

bool NVal::AddProp(vector<napi_property_descriptor> &&propVec) const {
    if (!TypeIs(napi_valuetype::napi_object)) {
        return false;
    }
    napi_status status = napi_define_properties(env_, val_, propVec.size(), propVec.data());
    if (status != napi_ok) {
        return false;
    }
    return true;
}

bool NVal::AddProp(string propName, napi_value val) const {
    if (!TypeIs(napi_valuetype::napi_object) || HasProp(propName)) {
        return false;
    }

    napi_status status = napi_set_named_property(env_, val_, propName.c_str(), val);
    if (status != napi_ok) {
        return false;
    }
    return true;
}

NVal NVal::CreateUndefined(napi_env env) {
    napi_value res = nullptr;
    napi_get_undefined(env, &res);
    return {env, res};
}

NVal NVal::CreateNull(napi_env env) {
    napi_value res = nullptr;
    napi_get_null(env, &res);
    return {env, res};
}

NVal NVal::CreateInt64(napi_env env, int64_t val) {
    napi_value res = nullptr;
    napi_create_int64(env, val, &res);
    return {env, res};
}

NVal NVal::CreateObject(napi_env env) {
    napi_value res = nullptr;
    napi_create_object(env, &res);
    return {env, res};
}

NVal NVal::CreateBool(napi_env env, bool val) {
    napi_value res = nullptr;
    napi_get_boolean(env, val, &res);
    return {env, res};
}

NVal NVal::CreateUTF8String(napi_env env, std::string str) {
    napi_value res = nullptr;
    napi_create_string_utf8(env, str.c_str(), str.length(), &res);
    return {env, res};
}

NVal NVal::CreateUint8Array(napi_env env, void *buf, size_t bufLen) {
    napi_value output_buffer = nullptr;
    napi_create_external_arraybuffer(
        env, buf, bufLen, [](napi_env env, void *finalize_data, void *finalize_hint) { free(finalize_data); }, NULL,
        &output_buffer);
    napi_value output_array = nullptr;
    napi_create_typedarray(env, napi_uint8_array, bufLen, output_buffer, 0, &output_array);
    return {env, output_array};
}

NVal NVal::CreateDouble(napi_env env, double val) {
    napi_value res = nullptr;
    napi_create_double(env, val, &res);
    return {env, res};
}

napi_property_descriptor NVal::DeclareNapiProperty(const char *name, napi_value val) {
    return {(name), nullptr, nullptr, nullptr, nullptr, val, napi_default, nullptr};
}

napi_property_descriptor NVal::DeclareNapiStaticProperty(const char *name, napi_value val) {
    return {(name), nullptr, nullptr, nullptr, nullptr, val, napi_static, nullptr};
}

napi_property_descriptor NVal::DeclareNapiFunction(const char *name, napi_callback func) {
    return {(name), nullptr, (func), nullptr, nullptr, nullptr, napi_default, nullptr};
}

napi_property_descriptor NVal::DeclareNapiStaticFunction(const char *name, napi_callback func) {
    return {(name), nullptr, (func), nullptr, nullptr, nullptr, napi_static, nullptr};
}

napi_property_descriptor NVal::DeclareNapiGetter(const char *name, napi_callback getter) {
    return {(name), nullptr, nullptr, (getter), nullptr, nullptr, napi_default, nullptr};
}

napi_property_descriptor NVal::DeclareNapiSetter(const char *name, napi_callback setter) {
    return {(name), nullptr, nullptr, nullptr, (setter), nullptr, napi_default, nullptr};
}

napi_property_descriptor NVal::DeclareNapiGetterSetter(const char *name, napi_callback getter, napi_callback setter) {
    return {(name), nullptr, nullptr, (getter), (setter), nullptr, napi_default, nullptr};
}
