import { checkImage, docPath } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";

const legoLoaderJSON = require("./setup/skottie/lego_loader.json");
const drinksJSON = require("./setup/skottie/drinks.json");
const confettiJSON = require("./setup/skottie/confetti.json");
const onboardingJSON = require("./setup/skottie/onboarding.json");

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
        legoAnimation.seekFrame(10);
        legoAnimation.render(canvas);
        sur.flush();
        return sur.makeImageSnapshot().makeNonTextureImage().encodeToBase64();
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
});
