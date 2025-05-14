import { surface } from "../setup";

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
          },
          drinks: {
            duration: Math.round(drinksAnimation.duration() * 1000),
            fps: Math.round(drinksAnimation.fps()),
          },
          confetti: {
            duration: Math.round(confettiAnimation.duration() * 1000),
            fps: Math.round(confettiAnimation.fps()),
          },
          onboarding: {
            duration: Math.round(onboardingAnimation.duration() * 1000),
            fps: Math.round(onboardingAnimation.fps()),
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
    expect(lego.duration).toEqual(5033);
    expect(lego.fps).toEqual(30);
    expect(drinks.duration).toEqual(9160);
    expect(drinks.fps).toEqual(25);
    expect(confetti.duration).toEqual(1969);
    expect(confetti.fps).toEqual(30);
    expect(onboarding.duration).toEqual(2636);
    expect(onboarding.fps).toEqual(30);
  });
});
