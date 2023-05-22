#pragma once

#include "SkCanvas.h"
#include "SkMesh.h"
#include "include/gpu/GrDirectContext.h"

enum class DrawResult {
    kOk,   // Test drew successfully.
    kFail, // Test failed to draw.
    kSkip  // Test is not applicable in this context and should be skipped.
};


namespace TimeUtils {
    // Returns 0 if the timer is stopped. Behavior is undefined if the timer
    // has been running longer than SK_MSecMax.
    static inline SkMSec NanosToMSec(double nanos) {
        const double msec = nanos * 1e-6;
        SkASSERT(SK_MSecMax >= msec);
        return static_cast<SkMSec>(msec);
    }

    static inline double NanosToSeconds(double nanos) {
        return nanos * 1e-9;
    }

    // Return the time scaled by "speed" and (if not zero) mod by period.
    static inline float Scaled(float time, float speed, float period = 0) {
        double value = time * speed;
        if (period) {
            value = ::fmod(value, (double)(period));
        }
        return (float)value;
    }

    // Transitions from ends->mid->ends linearly over period time. The phase
    // specifies a phase shift in time units.
    static inline float PingPong(double time,
                                 float period,
                                 float phase,
                                 float ends,
                                 float mid) {
        double value = ::fmod(time + phase, period);
        double half  = period / 2.0;
        double diff  = ::fabs(value - half);
        return (float)(ends + (1.0 - diff / half) * (mid - ends));
    }

    static inline float SineWave(double time,
                                 float periodInSecs,
                                 float phaseInSecs,
                                 float min,
                                 float max) {
        if (periodInSecs < 0.f) {
            return (min + max) / 2.f;
        }
        double t = NanosToSeconds(time) + phaseInSecs;
        t *= 2 * SK_FloatPI / periodInSecs;
        float halfAmplitude = (max - min) / 2.f;
        return halfAmplitude * std::sin(t) + halfAmplitude + min;
    }
}  // namespace TimeUtils

class MeshGM {
public:
    MeshGM() { this->onAnimate(0); }

public:
    using Attribute = SkMeshSpecification::Attribute;
    using Varying   = SkMeshSpecification::Varying;

    SkISize onISize() { return {140, 250}; }

    void onOnceBeforeDraw() {
        static const Attribute kAttributes[]{
                {Attribute::Type::kFloat2, 0, SkString{"pos"}  },
                {Attribute::Type::kFloat2, 8, SkString{"coords"}},
        };
        static const Varying kVaryings[]{
                {Varying::Type::kFloat2, SkString{"coords"}},
        };
        // To exercise shared VS/FS uniforms we have a matrix that is applied twice, once in each
        // stage.
        static constexpr char kVS[] = R"(
                uniform float t[2];
                uniform half3x3 m;
                Varyings main(in const Attributes attributes) {
                    Varyings varyings;
                    varyings.coords   = (m*float3(attributes.coords + float2(t[0], t[1]), 1)).xy;
                    varyings.position = attributes.pos;
                    return varyings;
                }
        )";
        static constexpr char kFS[] = R"(
                uniform half3x3 m;
                layout(color) uniform half4 color;
                float2 main(const Varyings varyings, out half4 c) {
                    c = color;
                    return (m*float3(varyings.coords, 1)).xy;
                }
        )";
        auto [spec, error] =
                SkMeshSpecification::Make(kAttributes,
                                          sizeof(Vertex),
                                          kVaryings,
                                          SkString(kVS),
                                          SkString(kFS),
                                          SkColorSpace::MakeSRGB(),
                                          kPremul_SkAlphaType);
        if (!spec) {
            SkDebugf("%s\n", error.c_str());
        }
        fSpec = std::move(spec);

        SkColor colors[] = {SK_ColorWHITE, SK_ColorBLACK};
        fShader = SkGradientShader::MakeRadial(kGradCenter,
                                               .4f,
                                               colors,
                                               nullptr,
                                               2,
                                               SkTileMode::kMirror);

        fVB = SkMesh::MakeVertexBuffer(nullptr, kQuad, sizeof(kQuad));
    }

    SkString onShortName() { return SkString("custommesh_uniforms"); }

    DrawResult onDraw(SkCanvas* canvas) {
        SkMatrix matrices[] {
                SkMatrix::MakeAll(-1,  0, 0, // self inverse so no effect.
                                   0, -1, 0,
                                   0,  0, 1),
                SkMatrix::RotateDeg(fDegrees/2.f, {0.5f, 0.5f}),
        };
        for (const auto& m : matrices) {
            auto unis = SkData::MakeUninitialized(fSpec->uniformSize());

            SkPoint trans = -kCoordTrans;
            static_assert(sizeof(SkPoint) == 2*sizeof(float));

            const SkMeshSpecification::Uniform* u = fSpec->findUniform("t");
            SkASSERT(u);
            std::memcpy(SkTAddOffset<void>(unis->writable_data(), u->offset),
                        (void*)&trans,
                        2*sizeof(float));

            u = fSpec->findUniform("m");
            SkASSERT(u);
            for (size_t offset = u->offset, col = 0; col < 3; ++col) {
                for (size_t row = 0; row < 3; ++row, offset += sizeof(float)) {
                    *SkTAddOffset<float>(unis->writable_data(), offset) = m.rc(row, col);
                }
            }

            u = fSpec->findUniform("color");
            SkASSERT(u);
            std::memcpy(SkTAddOffset<void>(unis->writable_data(), u->offset),
                        fColor.vec(),
                        4*sizeof(float));

            auto result = SkMesh::Make(fSpec,
                                       SkMesh::Mode::kTriangleStrip,
                                       fVB,
                                       /*vertexCount= */4,
                                       /*vertexOffset=*/0,
                                       /*uniforms=    */std::move(unis),
                                       kRect);

            if (!result.mesh.isValid()) {
                SkDebugf("Mesh creation failed: %s\n", result.error.c_str());
                return DrawResult::kFail;
            }

            SkPaint paint;
            paint.setShader(fShader);
            canvas->drawMesh(result.mesh, SkBlender::Mode(SkBlendMode::kModulate), paint);

            canvas->translate(0, kRect.height() + 10);
        }
        return DrawResult::kOk;
    }

    bool onAnimate(double nanos) {
        fDegrees = TimeUtils::NanosToSeconds(nanos) * 360.f/10.f + 45.f;
        // prime number periods, like locusts.
        fColor.fR = TimeUtils::SineWave(nanos, 13.f, 0.f, 0.f, 1.f);
        fColor.fG = TimeUtils::SineWave(nanos, 23.f, 5.f, 0.f, 1.f);
        fColor.fB = TimeUtils::SineWave(nanos, 11.f, 0.f, 0.f, 1.f);
        fColor.fA = 1.f;
        return true;
    }

private:
    struct Vertex {
        SkPoint pos;
        SkPoint tex;
    };

    static constexpr auto kRect = SkRect::MakeLTRB(20, 20, 120, 120);

    // Our logical tex coords are [0..1] but we insert an arbitrary translation that gets undone
    // with a uniform.
    static constexpr SkPoint kCoordTrans = {75, -37};
    static constexpr auto    kCoordRect  = SkRect::MakeXYWH(kCoordTrans.x(), kCoordTrans.y(), 1, 1);

    static constexpr SkPoint kGradCenter = {0.3f, 0.2f};

    static constexpr Vertex kQuad[] {
            {{kRect.left() , kRect.top()   }, {kCoordRect.left() , kCoordRect.top()}   },
            {{kRect.right(), kRect.top()   }, {kCoordRect.right(), kCoordRect.top()}   },
            {{kRect.left() , kRect.bottom()}, {kCoordRect.left() , kCoordRect.bottom()}},
            {{kRect.right(), kRect.bottom()}, {kCoordRect.right(), kCoordRect.bottom()}},
    };

    float fDegrees;

    SkColor4f fColor;

    sk_sp<SkMesh::VertexBuffer> fVB;

    sk_sp<SkMeshSpecification> fSpec;

    sk_sp<SkShader> fShader;
};
