import { checkImage, docPath } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";

const legoLoaderJSON = require("./setup/skottie/lego_loader.json");
const drinksJSON = require("./setup/skottie/drinks.json");
const confettiJSON = require("./setup/skottie/confetti.json");
const onboardingJSON = require("./setup/skottie/onboarding.json");
const basicSlotsJSON = require("./setup/skottie/basic_slots.json");

describe("Skottie", () => {
  it("Get durations", async () => {
    const { lego, drinks, confetti, onboarding } = await surface.eval(
      (Skia, ctx) => {
        const legoAnimation = Skia.Skottie.Make(ctx.legoLoader);
        const drinksAnimation = Skia.Skottie.Make(ctx.drinks);
        const confettiAnimation = Skia.Skottie.Make(ctx.confetti);
        const onboardingAnimation = Skia.Skottie.Make(ctx.onboarding);
        return {
          lego: {
            duration: Math.round(legoAnimation.duration() * 1000),
            fps: Math.round(legoAnimation.fps()),
            version: legoAnimation.version(),
            size: legoAnimation.size(),
          },
          drinks: {
            duration: Math.round(drinksAnimation.duration() * 1000),
            fps: Math.round(drinksAnimation.fps()),
            version: drinksAnimation.version(),
            size: drinksAnimation.size(),
          },
          confetti: {
            duration: Math.round(confettiAnimation.duration() * 1000),
            fps: Math.round(confettiAnimation.fps()),
            version: confettiAnimation.version(),
            size: confettiAnimation.size(),
          },
          onboarding: {
            duration: Math.round(onboardingAnimation.duration() * 1000),
            fps: Math.round(onboardingAnimation.fps()),
            version: onboardingAnimation.version(),
            size: onboardingAnimation.size(),
          },
        };
      },
      {
        legoLoader: JSON.stringify(legoLoaderJSON),
        drinks: JSON.stringify(drinksJSON),
        confetti: JSON.stringify(confettiJSON),
        onboarding: JSON.stringify(onboardingJSON),
      }
    );
    expect(lego.version).toEqual("4.7.0");
    expect(lego.duration).toEqual(5033);
    expect(lego.fps).toEqual(30);
    expect(lego.size).toEqual({ width: 800, height: 600 });
    expect(drinks.duration).toEqual(9160);
    expect(drinks.fps).toEqual(25);
    expect(drinks.version).toEqual("4.5.9");
    expect(lego.size).toEqual({ width: 800, height: 600 });
    expect(confetti.duration).toEqual(1969);
    expect(confetti.fps).toEqual(30);
    expect(confetti.version).toEqual("4.12.0");
    expect(lego.size).toEqual({ width: 800, height: 600 });
    expect(onboarding.duration).toEqual(2636);
    expect(onboarding.fps).toEqual(30);
    expect(onboarding.version).toEqual("5.0.3");
    expect(lego.size).toEqual({ width: 800, height: 600 });
  });
  it("Get first frame", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const legoAnimation = Skia.Skottie.Make(ctx.legoLoader);
        const sur = Skia.Surface.MakeOffscreen(800, 600);
        if (!sur) {
          throw new Error("Failed to create surface");
        }
        const canvas = sur.getCanvas();
        legoAnimation.seekFrame(41);
        legoAnimation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      {
        legoLoader: JSON.stringify(legoLoaderJSON),
      }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("skottie/lego.png"));
  });
  it("Color slot information", async () => {
    const props = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          NotoSerif: Skia.Data.fromBytes(
            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
          ),
          "img_0.png": Skia.Data.fromBytes(
            new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
          ),
        };
        const animation = Skia.Skottie.Make(ctx.basicSlotsJSON, assets);
        const colorProps = animation.getColorProps();
        const opacityProps = animation.getOpacityProps();
        const textProps = animation.getTextProps();
        const transformProps = animation.getTransformProps();
        return {
          colorProps,
          opacityProps,
          textProps,
          transformProps,
        };
      },
      {
        basicSlotsJSON: JSON.stringify(basicSlotsJSON),
      }
    );
    expect(props.colorProps.length).toEqual(4);
    expect(props.colorProps[0].key).toEqual("Black Solid 1");
    expect(props.colorProps[1].key).toEqual("Turquoise Solid 1");
    expect(props.colorProps[2].key).toEqual("Fill 1");
    expect(props.colorProps[3].key).toEqual("Stroke 1");
    expect(
      props.colorProps.every((prop) => prop.value instanceof Float32Array)
    ).toBe(true);

    expect(props.opacityProps.length).toEqual(11);
    expect(props.opacityProps[0].key).toEqual("Black Solid 1");
    expect(props.opacityProps[0].value).toEqual(70);
    expect(props.opacityProps[1].key).toEqual("Turquoise Solid 1");
    expect(props.opacityProps[1].value).toEqual(100);
    expect(
      props.opacityProps.slice(2).every((prop) => prop.value === 100)
    ).toBe(true);

    expect(props.textProps.length).toEqual(1);
    expect(props.textProps[0].key).toEqual("text slots");
    expect(typeof props.textProps[0].value).toEqual("object");

    expect(props.transformProps.length).toEqual(11);
    expect(props.transformProps[0].key).toEqual("Transform");
    expect(props.transformProps[1].key).toEqual("Shape Layer 2");
    expect(props.transformProps[2].key).toEqual("Shape Layer 1");
    expect(
      props.transformProps.every((prop) => typeof prop.value === "object")
    ).toBe(true);
  });
  /*

  it("Color slot information", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const animation = Skia.Skottie.Make(ctx.basicSlotsJSON);
        const size = animation.size();
        const sur = Skia.Surface.MakeOffscreen(size.width, size.height);
        if (!sur) {
          throw new Error("Failed to create surface");
        }
        const canvas = sur.getCanvas();
        animation.seekFrame(0);
        animation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      {
        basicSlotsJSON: JSON.stringify(basicSlotsJSON),
      }
    );
    const { Skia } = importSkia();
    const data = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(data)!;
    expect(data).toBeDefined();
    checkImage(image, docPath("skottie/basic_slots.png"));
  });
  */
});
