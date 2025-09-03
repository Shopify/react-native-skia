/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#ifndef VAP_ROSEN_VAL
#define VAP_ROSEN_VAL

#include <GLES3/gl3.h>
#include <js_native_api.h>
#include <js_native_api_types.h>
// #pragma once

#include <memory>

class NVal final {
public:
    NVal() = default;

    NVal(napi_env nEnv, napi_value nVal);

    NVal &operator=(const NVal &) = default;

    virtual ~NVal() = default;

    // NOTE! env_ and val_ is LIKELY to be null
    napi_env env_ = nullptr;
    napi_value val_ = nullptr;

    explicit operator bool() const;

    bool TypeIs(napi_valuetype expType) const;

    bool IsNull() const;

    bool IsUndefined() const;

    bool IsBufferArray() const;

    /* SHOULD ONLY BE USED FOR EXPECTED TYPE */
    std::tuple<bool, std::unique_ptr<char[]>, size_t> ToUTF8String() const;

    std::tuple<bool, std::unique_ptr<char[]>, size_t> ToUTF16String() const;

    std::tuple<bool, void *> ToPointer() const;

    std::tuple<bool, bool> ToBool() const;

    std::tuple<bool, double> ToDouble() const;

    std::tuple<bool, GLfloat> ToFloat() const;

    std::tuple<bool, int32_t> ToInt32() const;

    std::tuple<bool, uint32_t> ToUint32() const;

    std::tuple<bool, int64_t> ToInt64() const;

    std::tuple<bool, GLenum> ToGLenum() const;

    std::tuple<bool, GLsizei> ToGLsizei() const;

    std::tuple<bool, void *, size_t> ToArraybuffer() const;

    std::tuple<bool, float *, size_t> ToFloatBuffer() const;

    std::tuple<bool, napi_typedarray_type, void *, size_t> ToTypedArray() const;

    std::tuple<bool, bool> IsTypeArray() const;

    std::tuple<bool, void *, size_t> ToDataview() const;

    std::tuple<bool, bool> IsArray() const;

    bool IsDataView() const;

    std::tuple<bool, void *, size_t, size_t, napi_typedarray_type> ToTypedArrayInfo() const;

    /* Static helpers to create js objects */
    static NVal CreateUndefined(napi_env env);

    static NVal CreateNull(napi_env env);

    static NVal CreateInt64(napi_env env, int64_t val);

    static NVal CreateObject(napi_env env);

    static NVal CreateBool(napi_env env, bool val);

    static NVal CreateUTF8String(napi_env env, std::string str);

    static NVal CreateUint8Array(napi_env env, void *buf, size_t bufLen);

    static NVal CreateDouble(napi_env env, double val);

    /* SHOULD ONLY BE USED FOR OBJECT */
    bool HasProp(std::string propName) const;

    NVal GetProp(std::string propName) const;

    bool AddProp(std::vector<napi_property_descriptor> &&propVec) const;

    bool AddProp(std::string propName, napi_value val) const;

    /* Static helpers to create prop of js objects */
    static napi_property_descriptor DeclareNapiProperty(const char *name, napi_value val);

    static napi_property_descriptor DeclareNapiStaticProperty(const char *name, napi_value val);

    static napi_property_descriptor DeclareNapiFunction(const char *name, napi_callback func);

    static napi_property_descriptor DeclareNapiStaticFunction(const char *name, napi_callback func);

    static napi_property_descriptor DeclareNapiGetter(const char *name, napi_callback getter);

    static napi_property_descriptor DeclareNapiSetter(const char *name, napi_callback setter);

    static inline napi_property_descriptor DeclareNapiGetterSetter(const char *name, napi_callback getter,
                                                                   napi_callback setter);
};
#endif // VAP_ROSEN_VAL
