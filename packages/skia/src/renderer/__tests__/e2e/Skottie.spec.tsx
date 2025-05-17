/* eslint-disable camelcase */
import { checkImage, docPath } from "../../../__tests__/setup";
import { dataAssets, importSkia, surface } from "../setup";

const legoLoaderJSON = require("./setup/skottie/lego_loader.json");
const drinksJSON = require("./setup/skottie/drinks.json");
const confettiJSON = require("./setup/skottie/confetti.json");
const onboardingJSON = require("./setup/skottie/onboarding.json");
const basicSlotsJSON = require("./setup/skottie/basic_slots.json");
const fingerprintJSON = require("./setup/skottie/fingerprint.json");
const textLayerJSON = require("./setup/skottie/text-layer.json");

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
    const rData = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(rData)!;
    expect(rData).toBeDefined();
    checkImage(image, docPath("skottie/lego.png"));
  });
  it("Get slot information", async () => {
    const slots = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          NotoSerif: Skia.Data.fromBytes(new Uint8Array(ctx.NotoSerif)),
          "img_0.png": Skia.Data.fromBytes(new Uint8Array(ctx.img_0)),
        };
        const animation = Skia.Skottie.Make(ctx.basicSlotsJSON, assets);
        return animation.getSlotInfo();
      },
      {
        basicSlotsJSON: JSON.stringify(basicSlotsJSON),
        NotoSerif: Array.from(dataAssets.NotoSansSCRegular),
        img_0: Array.from(dataAssets.img_0),
      }
    );
    expect(slots).toEqual({
      colorSlotIDs: ["FillsGroup", "StrokeGroup"],
      imageSlotIDs: ["ImageSource"],
      scalarSlotIDs: ["Opacity"],
      textSlotIDs: ["TextSource"],
      vec2SlotIDs: ["ScaleGroup"],
    });
  });
  it("load skottie with assets", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          NotoSerif: Skia.Data.fromBytes(new Uint8Array(ctx.NotoSerif)),
          "img_0.png": Skia.Data.fromBytes(new Uint8Array(ctx.img_0)),
        };
        const animation = Skia.Skottie.Make(ctx.basicSlotsJSON, assets);
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
        NotoSerif: Array.from(dataAssets.NotoSansSCRegular),
        img_0: Array.from(dataAssets.img_0),
      }
    );
    const { Skia } = importSkia();
    const rData = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(rData)!;
    expect(rData).toBeDefined();
    checkImage(image, docPath("skottie/basic_slots.png"));
  });
  it("load skottie with assets and set color slots", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          NotoSerif: Skia.Data.fromBytes(new Uint8Array(ctx.NotoSerif)),
          "img_0.png": Skia.Data.fromBytes(new Uint8Array(ctx.img_0)),
        };
        const animation = Skia.Skottie.Make(ctx.basicSlotsJSON, assets);
        const size = animation.size();
        const sur = Skia.Surface.MakeOffscreen(size.width, size.height);
        if (!sur) {
          throw new Error("Failed to create surface");
        }
        const canvas = sur.getCanvas();
        animation.setColorSlot("FillsGroup", Skia.Color("cyan"));
        animation.setColorSlot("StrokeGroup", Skia.Color("magenta"));
        animation.seekFrame(0);
        animation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      {
        basicSlotsJSON: JSON.stringify(basicSlotsJSON),
        NotoSerif: Array.from(dataAssets.NotoSansSCRegular),
        img_0: Array.from(dataAssets.img_0),
      }
    );
    const { Skia } = importSkia();
    const rData = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(rData)!;
    expect(rData).toBeDefined();
    checkImage(image, docPath("skottie/basic_slots-with-colors.png"));
  });
  it("has color props", async () => {
    const colorProps = await surface.eval(
      (Skia, ctx) => {
        const animation = Skia.Skottie.Make(ctx.fingerprint);
        const props = animation.getColorProps();
        return props.map(({ key, value }) => ({
          key,
          value: Array.from(value),
        }));
      },
      {
        fingerprint: JSON.stringify(fingerprintJSON),
      }
    );
    expect(colorProps.length).toBe(1);
  });
  it("fingerprint example (1)", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const animation = Skia.Skottie.Make(ctx.fingerprint);
        const size = animation.size();
        const sur = Skia.Surface.MakeOffscreen(size.width, size.height);
        if (!sur) {
          throw new Error("Failed to create surface");
        }
        const canvas = sur.getCanvas();
        const colorProp = animation.getColorProps()[0];
        animation.setColor(colorProp.key, Skia.Color("rgb(60, 120, 255)"));
        animation.seekFrame(120);
        animation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      {
        fingerprint: JSON.stringify(fingerprintJSON),
      }
    );
    const { Skia } = importSkia();
    const rData = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(rData)!;
    expect(rData).toBeDefined();
    checkImage(image, docPath("skottie/fingerprint-color1.png"));
  });
  it("has text props", async () => {
    const colorProps = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          "Avenir-Heavy": Skia.Data.fromBytes(new Uint8Array(ctx.AvenirHeavy)),
        };
        const animation = Skia.Skottie.Make(ctx.textLayerJSON, assets);
        const props = animation.getTextProps();
        return props.map(({ key, value }) => ({
          key,
          value,
        }));
      },
      {
        textLayerJSON: JSON.stringify(textLayerJSON),
        AvenirHeavy: Array.from(dataAssets.AvenirHeavy),
      }
    );
    expect(colorProps[0]).toEqual({
      key: "hello!",
      value: { text: "hello!", size: 164 },
    });
    expect(colorProps[1]).toEqual({
      key: "hello! 2",
      value: { text: "hello!", size: 164 },
    });
  });
  it("text prop", async () => {
    const raw = await surface.eval(
      (Skia, ctx) => {
        const assets = {
          "Avenir-Heavy": Skia.Data.fromBytes(new Uint8Array(ctx.AvenirHeavy)),
        };
        const animation = Skia.Skottie.Make(ctx.textLayer, assets);
        const size = animation.size();
        const sur = Skia.Surface.MakeOffscreen(size.width, size.height);
        if (!sur) {
          throw new Error("Failed to create surface");
        }
        const canvas = sur.getCanvas();

        animation.seekFrame(animation.duration() * 0.5);
        animation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().encodeToBase64();
      },
      {
        textLayer: JSON.stringify(textLayerJSON),
        AvenirHeavy: Array.from(dataAssets.AvenirHeavy),
      }
    );
    const { Skia } = importSkia();
    const rData = Skia.Data.fromBase64(raw);
    const image = Skia.Image.MakeImageFromEncoded(rData)!;
    expect(rData).toBeDefined();
    checkImage(image, docPath("skottie/text-prop.png"));
  });
});
