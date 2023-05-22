#pragma once

#include "SkCanvas.h"
#include "SkMesh.h"
#include "include/gpu/GrDirectContext.h"

enum class DrawResult {
    kOk,   // Test drew successfully.
    kFail, // Test failed to draw.
    kSkip  // Test is not applicable in this context and should be skipped.
};

class MeshGM {
public:
    MeshGM() {}

public:
    using Attribute = SkMeshSpecification::Attribute;
    using Varying   = SkMeshSpecification::Varying;

    SkISize onISize() { return {435, 1180}; }

    void onOnceBeforeDraw() {
        {
            static const Attribute kAttributes[]{
                    {Attribute::Type::kFloat4,       8, SkString{"xuyv"}},
                    {Attribute::Type::kUByte4_unorm, 4, SkString{"brag"}},
            };
            static const Varying kVaryings[]{
                    {Varying::Type::kHalf4,  SkString{"color"}},
                    {Varying::Type::kFloat2, SkString{"uv"}   },
            };
            static constexpr char kVS[] = R"(
                    half4 unswizzle_color(half4 color) { return color.garb; }

                    Varyings main(const in Attributes attributes) {
                        Varyings varyings;
                        varyings.color    = unswizzle_color(attributes.brag);
                        varyings.uv       = attributes.xuyv.yw;
                        varyings.position = attributes.xuyv.xz;
                        return varyings;
                    }
            )";
            static constexpr char kFS[] = R"(
                    float2 main(const in Varyings varyings, out float4 color) {
                        color = varyings.color;
                        return varyings.uv;
                    }
            )";
            auto[spec, error] =
                    SkMeshSpecification::Make(kAttributes,
                                              sizeof(ColorVertex),
                                              kVaryings,
                                              SkString(kVS),
                                              SkString(kFS));
            if (!spec) {
                SkDebugf("%s\n", error.c_str());
            }
            fSpecWithColor = std::move(spec);
        }
        {
            static const Attribute kAttributes[]{
                    {Attribute::Type::kFloat4, 0, SkString{"xuyv"}},
            };
            static const Varying kVaryings[]{
                    {Varying::Type::kFloat2, SkString{"vux2"}},
            };
            static constexpr char kVS[] = R"(
                    Varyings main(const in Attributes a) {
                        Varyings v;
                        v.vux2     = 2*a.xuyv.wy;
                        v.position = a.xuyv.xz;
                        return v;
                    }
            )";
            static constexpr char kFS[] = R"(
                    float2 helper(in float2 vux2) { return vux2.yx/2; }
                    float2 main(const in Varyings varyings) {
                        return helper(varyings.vux2);
                    }
            )";
            auto[spec, error] =
                    SkMeshSpecification::Make(kAttributes,
                                              sizeof(NoColorVertex),
                                              kVaryings,
                                              SkString(kVS),
                                              SkString(kFS));
            if (!spec) {
                SkDebugf("%s\n", error.c_str());
            }
            fSpecWithNoColor = std::move(spec);
        }

        static constexpr SkColor kColors[] = {SK_ColorTRANSPARENT, SK_ColorWHITE};
        fShader = SkGradientShader::MakeRadial({10, 10},
                                               3,
                                               kColors,
                                               nullptr,
                                               2,
                                               SkTileMode::kMirror);
    }

    DrawResult onGpuSetup(SkCanvas* canvas) {
        auto dc = GrAsDirectContext(canvas->recordingContext());
        this->ensureBuffers();
        if (!dc || dc->abandoned()) {
            return DrawResult::kOk;
        }

        fColorVB        = SkMesh::CopyVertexBuffer(dc, fColorVB);
        fColorIndexedVB = SkMesh::CopyVertexBuffer(dc, fColorIndexedVB);
        fIB[1]          = SkMesh::CopyIndexBuffer (dc, fIB[0]);
        if (!fColorVB || !fColorIndexedVB || !fIB[1]) {
            return DrawResult::kFail;
        }
        return DrawResult::kOk;
    }

    void onGpuTeardown() {
        // Destroy the GPU buffers and recreate on CPU
        fColorVB        = nullptr;
        fColorIndexedVB = nullptr;
        fIB[1]          = nullptr;
        this->ensureBuffers();
    }

    SkString onShortName() { return SkString("custommesh"); }

    DrawResult onDraw(SkCanvas* canvas) {
        int i = 0;
        for (const sk_sp<SkBlender>& blender : {SkBlender::Mode(SkBlendMode::kDst),
                                                SkBlender::Mode(SkBlendMode::kSrc),
                                                SkBlender::Mode(SkBlendMode::kSaturation)}) {
            canvas->save();
            for (uint8_t alpha  : {0xFF , 0x40})
            for (bool    colors : {false, true})
            for (bool    shader : {false, true}) {
                SkMesh::Result result;
                // Rather than pile onto the combinatorics we draw every other test case indexed.
                if ((i & 1) == 0) {
                    if (colors) {
                        result = SkMesh::Make(fSpecWithColor,
                                            SkMesh::Mode::kTriangleStrip,
                                            fColorVB,
                                            /*vertexCount= */4,
                                            /*vertexOffset=*/0,
                                            /*uniforms=    */nullptr,
                                            kRect);
                    } else {
                        result = SkMesh::Make(fSpecWithNoColor,
                                            SkMesh::Mode::kTriangleStrip,
                                            fNoColorVB,
                                            /*vertexCount=*/4,
                                            kNoColorOffset,
                                            /*uniforms=*/nullptr,
                                            kRect);
                    }
                } else {
                    // Alternate between CPU and GPU-backend index buffers.
                    auto ib = (i%4 == 0) ? fIB[0] : fIB[1];
                    if (colors) {
                        result = SkMesh::MakeIndexed(fSpecWithColor,
                                                   SkMesh::Mode::kTriangles,
                                                   fColorIndexedVB,
                                                   /*vertexCount=*/6,
                                                   kColorIndexedOffset,
                                                   std::move(ib),
                                                   /*indexCount=*/6,
                                                   kIndexOffset,
                                                   /*uniforms=*/nullptr,
                                                   kRect);
                    } else {
                        result = SkMesh::MakeIndexed(fSpecWithNoColor,
                                                   SkMesh::Mode::kTriangles,
                                                   fNoColorIndexedVB,
                                                   /*vertexCount=*/6,
                                                   /*vertexOffset=*/0,
                                                   std::move(ib),
                                                   /*indexCount=*/6,
                                                   kIndexOffset,
                                                   /*uniforms=*/nullptr,
                                                   kRect);
                    }
                }
                if (!result.mesh.isValid()) {
                    SkDebugf("Mesh creation failed: %s\n", result.error.c_str());
                    return DrawResult::kFail;
                }

                SkPaint paint;
                paint.setColor(SK_ColorGREEN);
                paint.setShader(shader ? fShader : nullptr);
                paint.setAlpha(alpha);

                canvas->drawMesh(result.mesh, blender, paint);

                canvas->translate(0, 150);
                ++i;
            }
            canvas->restore();
            canvas->translate(150, 0);
        }
        return DrawResult::kOk;
    }

private:
    void ensureBuffers() {
        if (!fColorVB) {
            fColorVB = SkMesh::MakeVertexBuffer(/*GrDirectContext*=*/nullptr,
                                                kColorQuad,
                                                sizeof(kColorQuad));
        }

        if (!fNoColorVB) {
            // Make this one such that the data is offset into the buffer.
            auto data = SkData::MakeUninitialized(sizeof(kNoColorQuad) + kNoColorOffset);
            std::memcpy(SkTAddOffset<void>(data->writable_data(), kNoColorOffset),
                        kNoColorQuad,
                        sizeof(kNoColorQuad));
            fNoColorVB = SkMesh::MakeVertexBuffer(/*GrDirectContext*=*/nullptr,
                                                  data->data(),
                                                  data->size());
        }

        if (!fColorIndexedVB) {
            // This buffer also has an offset.
            auto data = SkData::MakeUninitialized(sizeof(kColorIndexedQuad) + kColorIndexedOffset);
            std::memcpy(SkTAddOffset<void>(data->writable_data(), kColorIndexedOffset),
                        kColorIndexedQuad,
                        sizeof(kColorIndexedQuad));
            fColorIndexedVB = SkMesh::MakeVertexBuffer(/*GrDirectContext*=*/nullptr,
                                                       data->data(),
                                                       data->size());
        }

        if (!fNoColorIndexedVB) {
            fNoColorIndexedVB = SkMesh::MakeVertexBuffer(/*GrDirectContext*=*/nullptr,
                                                         kNoColorIndexedQuad,
                                                         sizeof(kNoColorIndexedQuad));
        }

        if (!fIB[0]) {
            // The index buffer has an offset.
            auto data = SkData::MakeUninitialized(sizeof(kIndices) + kIndexOffset);
            std::memcpy(SkTAddOffset<void>(data->writable_data(), kIndexOffset),
                        kIndices,
                        sizeof(kIndices));
            fIB[0] = SkMesh::MakeIndexBuffer(/*GrDirectContext*=*/nullptr,
                                             data->data(),
                                             data->size());
        }

        if (!fIB[1]) {
            // On CPU we always use the same CPU-backed index buffer.
            fIB[1] = fIB[0];
        }
    }

    struct ColorVertex {
        uint32_t pad;
        uint32_t brag;
        float    xuyv[4];
    };

    struct NoColorVertex {
        float xuyv[4];
    };

    static constexpr auto kRect = SkRect::MakeLTRB(20, 20, 120, 120);
    static constexpr auto kUV   = SkRect::MakeLTRB( 0,  0,  20,  20);

    static constexpr ColorVertex kColorQuad[] {
            {0, 0x00FFFF00, {kRect.left(),  kUV.left(),  kRect.top(),    kUV.top()   }},
            {0, 0x00FFFFFF, {kRect.right(), kUV.right(), kRect.top(),    kUV.top()   }},
            {0, 0xFFFF00FF, {kRect.left(),  kUV.left(),  kRect.bottom(), kUV.bottom()}},
            {0, 0xFFFFFF00, {kRect.right(), kUV.right(), kRect.bottom(), kUV.bottom()}},
    };

    static constexpr NoColorVertex kNoColorQuad[]{
            {{kRect.left(),  kUV.left(),  kRect.top(),    kUV.top()   }},
            {{kRect.right(), kUV.right(), kRect.top(),    kUV.top()   }},
            {{kRect.left(),  kUV.left(),  kRect.bottom(), kUV.bottom()}},
            {{kRect.right(), kUV.right(), kRect.bottom(), kUV.bottom()}},
    };

    // The indexed quads draw the same as the non-indexed. They just have unused vertices that the
    // index buffer skips over draw with triangles instead of a triangle strip.
    static constexpr ColorVertex kColorIndexedQuad[] {
            {0, 0x00FFFF00, {kRect.left(),  kUV.left(),  kRect.top(),    kUV.top()   }},
            {0, 0x00000000, {        100.f,        0.f,        100.f,    5.f         }}, // unused
            {0, 0x00FFFFFF, {kRect.right(), kUV.right(), kRect.top(),    kUV.top()   }},
            {0, 0x00000000, {        200.f,        10.f,        200.f,   10.f        }}, // unused
            {0, 0xFFFF00FF, {kRect.left(),  kUV.left(),  kRect.bottom(), kUV.bottom()}},
            {0, 0xFFFFFF00, {kRect.right(), kUV.right(), kRect.bottom(), kUV.bottom()}},
    };

    static constexpr NoColorVertex kNoColorIndexedQuad[]{
            {{kRect.left(),  kUV.left(),  kRect.top(),    kUV.top()   }},
            {{        100.f,        0.f,        100.f,    5.f         }}, // unused
            {{kRect.right(), kUV.right(), kRect.top(),    kUV.top()   }},
            {{        200.f,        10.f,        200.f,   10.f        }}, // unused
            {{kRect.left(),  kUV.left(),  kRect.bottom(), kUV.bottom()}},
            {{kRect.right(), kUV.right(), kRect.bottom(), kUV.bottom()}},
    };

    static constexpr uint16_t kIndices[]{0, 2, 4, 2, 5, 4};

    // For some buffers we add an offset to ensure we're exercising drawing from mid-buffer.
    static constexpr size_t kNoColorOffset      = sizeof(NoColorVertex);
    static constexpr size_t kColorIndexedOffset = 2*sizeof(ColorVertex);
    static constexpr size_t kIndexOffset        = 6;

    sk_sp<SkShader> fShader;

    sk_sp<SkMeshSpecification> fSpecWithColor;
    sk_sp<SkMeshSpecification> fSpecWithNoColor;

    // On GPU the first IB is a CPU buffer and the second is a GPU buffer.
    sk_sp<SkMesh::IndexBuffer> fIB[2];

    sk_sp<SkMesh::VertexBuffer> fColorVB;
    sk_sp<SkMesh::VertexBuffer> fNoColorVB;
    sk_sp<SkMesh::VertexBuffer> fColorIndexedVB;
    sk_sp<SkMesh::VertexBuffer> fNoColorIndexedVB;
};
