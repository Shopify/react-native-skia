import { wait, timing, waitUntil, makeAnimation } from "./Animations";

describe("Animations", () => {
  test("hello world", () => {
    const state = makeAnimation(
      function* scene({ progress }) {
        yield (progress.value = 1);
        yield (progress.value = 2);
        yield (progress.value = 3);
      },
      { progress: 0 }
    );
    expect(state.at(0).progress).toBe(1);
    expect(state.at(1).progress).toBe(2);
    expect(state.at(2).progress).toBe(3);
    expect(state.duration).toBe(4);
  });
  test("wait (1)", () => {
    const state = makeAnimation(function* scene({}) {
      yield* wait(10);
    }, {});
    expect(state.duration).toBe(11);
  });
  test("wait (2)", () => {
    const state = makeAnimation(function* scene({}) {
      yield* wait();
      yield* wait();
      yield* wait();
    }, {});
    expect(state.duration).toBe(91);
  });
  test("timing (1)", () => {
    const state = makeAnimation(
      function* scene({ progress }) {
        yield* timing(progress);
      },
      { progress: 0, done: false }
    );
    expect(state.duration).toBe(31);
  });
  test("timing (2)", () => {
    const state = makeAnimation(
      function* scene({ progress, done }) {
        yield* timing(progress);
        done.value = true;
        yield* wait();
        yield* wait();
      },
      { progress: 0, done: false }
    );
    expect(state.duration).toBe(91);
    expect(state.at(0).progress).toBe(0);
    expect(state.at(0).done).toBe(false);
  });

  test("waitUntil (1)", () => {
    const state = makeAnimation(
      function* scene({ progress }) {
        yield* waitUntil(200);
        progress.value = 1;
        yield* waitUntil(300);
        progress.value = 2;
      },
      {
        progress: 0,
      }
    );
    expect(state.at(299).progress).toBe(1);
    expect(state.at(301).progress).toBe(2);
    expect(state.duration).toBe(301);
  });

  // test("waitUntil", () => {
  //   const progress = new Value(0);

  //   function* scene() {
  //     yield* waitUntil(10);
  //     progress.value = 1;
  //   }
  //   const it = scene();
  //   for (let i = 0; i <= 20; i++) {
  //     it.next(i);
  //     const p = i >= 10 ? 1 : 0;
  //     expect(progress.value).toBe(p);
  //   }
  // });

  // test("parallel (1)", () => {
  //   const p1 = new Value(0);
  //   const p2 = new Value(0);
  //   const done = new Value(false);
  //   function* scene() {
  //     yield* parallel(
  //       timing(p1, { easing: Easing.linear }),
  //       timing(p2, { easing: Easing.linear })
  //     );
  //     done.value = true;
  //   }
  //   const it = scene();
  //   for (let i = 0; i < 30; i++) {
  //     it.next(i);
  //     const p = (i * 1) / 29;
  //     expect(p1.value).toBe(p);
  //     expect(p2.value).toBe(p);
  //   }
  //   it.next(31);
  //   it.next(32);
  //   expect(p1.value).toBe(1);
  //   expect(p2.value).toBe(1);
  //   expect(done.value).toBe(true);
  // });

  // test("parallel (2)", () => {
  //   const p1 = new Value(0);
  //   const p2 = new Value(0);
  //   const done = new Value(false);
  //   function* subscene1() {
  //     yield* timing(p1, { easing: Easing.linear });
  //     yield* wait();
  //   }

  //   function* subscene2() {
  //     yield* timing(p2, { easing: Easing.linear });
  //   }

  //   function* scene() {
  //     yield* parallel(subscene1, subscene2);
  //     done.value = true;
  //   }
  //   const it = scene();
  //   for (let i = 0; i < 90; i++) {
  //     it.next(i);
  //     const j = Math.min(i, 29);
  //     const p = (j * 1) / 29;
  //     expect(p1.value).toBe(p);
  //     expect(p2.value).toBe(p);
  //   }
  //   expect(p1.value).toBe(1);
  //   expect(p2.value).toBe(1);
  //   const val = it.next(91);
  //   expect(val.done).toBe(true);
  // });

  // test("mutations (1)", () => {
  //   const val = new Value({ text: "" });
  //   function* scene() {
  //     yield* wait(1);
  //     val.value.text = "Hello";
  //     yield* waitUntil(10);
  //     val.value.text += " World";
  //     yield* waitUntil(10);
  //   }
  //   const it = scene();
  //   for (let i = 0; i < 20; i++) {
  //     it.next(i);
  //     if (i === 0) {
  //       expect(val.value.text).toBe("");
  //     } else if (i < 10) {
  //       expect(val.value.text).toBe("Hello");
  //     } else {
  //       expect(val.value.text).toBe("Hello World");
  //     }
  //   }
  // });

  test("mutations (2)", () => {
    const state = makeAnimation(
      function* scene({ tab }) {
        yield* wait(1);
        tab.value.text = "Hello";
        yield* wait(10);
        tab.value.text += " World";
        yield* wait(10);
      },
      { tab: { text: "" } }
    );
    expect(state.duration).toBe(22);
    expect(state.at(0).tab.text).toBe("");
    expect(state.at(1).tab.text).toBe("Hello");
    expect(state.at(11).tab.text).toBe("Hello World");
  });
});
