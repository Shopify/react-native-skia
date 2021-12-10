import { normalizer } from "../normalize";

describe("normalize", () => {
  describe("errors", () => {
    it("should throw an error if time is above the total duration", () => {
      expect(() => {
        normalizer(0, { total: 100, duration: 200 });
      }).toThrow();
    });
    it("should throw an error if duration is above total duration", () => {
      expect(() => {
        normalizer(0, { total: 100, duration: 102 });
      }).toThrow();
    });
    it("should throw an error if offset plus duration is more than totalt duration", () => {
      expect(() => {
        normalizer(0, { total: 100, offset: 90, duration: 30 });
      }).toThrow();
    });
    it("should throw an error if offset, duration and repeat is more than totalt duration", () => {
      expect(() => {
        normalizer(0, { total: 100, offset: 40, duration: 40, repeat: 2 });
      }).toThrow();
    });

    it("should throw an error if offset, duration, repeat and repeat delay is more than totalt duration", () => {
      expect(() => {
        normalizer(0, {
          total: 100,
          offset: 40,
          duration: 30,
          repeat: 2,
          repeatDelay: 20,
        });
      }).toThrow();
    });
  });
  describe("total equals duration and zero offset, repeat, repeatDelay", () => {
    it("should return 0 for input 0", () => {
      expect(normalizer(0, { duration: 100, total: 100 })).toBe(0);
    });
    it("should return 0.5 for input 0.5", () => {
      expect(normalizer(50, { duration: 100, total: 100 })).toBe(0.5);
    });
    it("should return 1 for input 1", () => {
      expect(normalizer(100, { duration: 100, total: 100 })).toBe(1);
    });
  });

  describe("offset", () => {
    it("should return less than 0 for input 0 with offset", () => {
      expect(
        normalizer(0, { duration: 50, total: 100, offset: 50 })
      ).toBeLessThan(0);
    });
    it("should return 0 for input 0.5 with offset", () => {
      expect(normalizer(50, { duration: 50, total: 100, offset: 50 })).toBe(0);
    });
    it("should return 1 for input 1 with offset", () => {
      expect(normalizer(100, { duration: 50, total: 100, offset: 50 })).toBe(1);
    });
  });

  describe("repeat, zero offset", () => {
    it("should return 0 for input 0 with repeat 2", () => {
      expect(normalizer(0, { duration: 50, total: 100, repeat: 2 })).toBe(0);
    });
    it("should return 0.998 for input 0.499 with repeat 2", () => {
      expect(normalizer(49.9, { duration: 50, total: 100, repeat: 2 })).toBe(
        0.998
      );
    });
    // it('should return 0 for input 0.5 with repeat 2', () => {
    //   expect(normalizer({duration: 50, total: 100, repeat: 2})(50)).toBe(0);
    // });
    it("should return 1 for input 1 with repeat 2", () => {
      expect(normalizer(100, { duration: 50, total: 100, repeat: 2 })).toBe(1);
    });
  });

  describe("repeat with duration including repeat less than total", () => {
    it("should return a value greater than 1 for input 0.6 when repeat * duration is 0.5", () => {
      expect(
        normalizer(60, { duration: 25, total: 100, repeat: 2 })
      ).toBeGreaterThan(1);
    });
  });

  describe("repeat with offset", () => {
    it("should return less than 1 with input 0 with repeat 2 and offset", () => {
      expect(
        normalizer(0, { duration: 10, total: 100, repeat: 2, offset: 80 })
      ).toBeLessThan(0);
    });
    it("should return 1 with input 1 with repeat 2 and offset", () => {
      expect(
        normalizer(100, { duration: 10, total: 100, repeat: 2, offset: 80 })
      ).toBe(1);
    });
    it("should return more than 1 for input 1 with repeat 2 and offset and duration below 1", () => {
      expect(
        normalizer(100, { duration: 10, total: 100, repeat: 2, offset: 10 })
      ).toBeGreaterThan(1);
    });
    it("should return 1 for input 0.3", () => {
      expect(
        normalizer(30, { duration: 10, total: 100, offset: 10, repeat: 2 })
      ).toBe(1);
    });
  });

  describe("repeat with repeat delay", () => {
    it("should return 1 for 0.1", () => {
      expect(
        normalizer(10, { duration: 10, total: 100, repeat: 2, repeatDelay: 10 })
      ).toBe(1);
    });
    it("should return greater than 1 for 0.15", () => {
      expect(
        normalizer(15, { duration: 10, total: 100, repeat: 2, repeatDelay: 10 })
      ).toBeGreaterThan(1);
    });
    // it('should return 0 for 0.2', () => {
    //   expect(
    //     normalizer({duration: 10, total: 100, repeat: 2, repeatDelay: 10})(20),
    //   ).toBe(0);
    // });
    it("should return greater than 1 for 0.5", () => {
      expect(
        normalizer(50, { duration: 10, total: 100, repeat: 2, repeatDelay: 10 })
      ).toBeGreaterThan(1);
    });
  });

  describe("repeat with offset and repeat delay", () => {
    it("should return 1 for 0.2", () => {
      expect(
        normalizer(20, {
          duration: 10,
          total: 100,
          repeat: 2,
          repeatDelay: 10,
          offset: 10,
        })
      ).toBe(1);
    });
  });

  describe("yoyo", () => {
    it("should return regular value if in even repeat cycle", () => {
      expect(
        normalizer(7.5, { duration: 10, total: 100, repeat: 2, yoyo: true })
      ).toBe(0.75);
    });
    it("should return reversed value if in odd repeat cycle", () => {
      expect(
        normalizer(17.5, { duration: 10, total: 100, repeat: 2, yoyo: true })
      ).toBe(0.25);
    });
    it("should return reversed value if in odd repeat cycle with offset", () => {
      expect(
        normalizer(27.5, {
          duration: 10,
          total: 100,
          repeat: 2,
          offset: 10,
          yoyo: true,
        })
      ).toBe(0.25);
    });
    it("should not return reversed value if in odd repeat cycle above duration", () => {
      expect(
        normalizer(27.5, { duration: 10, total: 100, repeat: 2, yoyo: true })
      ).toBeGreaterThan(1);
    });
  });

  it("should handle input that gives Infinity on native eval, BUG #1", () => {
    expect(
      normalizer(0.000066, {
        total: 252400.00002,
        duration: 0.0,
        offset: 0.0,
        repeat: 1.0,
        repeatDelay: 0.0,
        yoyo: false,
      })
    ).not.toBe(Infinity);
  });

  it("should not bounce in the middle of repeat with yoyo. BUG#2", () => {
    const n0 = normalizer(0, {
      total: 800,
      offset: 0,
      duration: 100,
      repeat: 2,
      repeatDelay: 0,
      yoyo: true,
    });
    const n1 = normalizer(99, {
      total: 800,
      offset: 0,
      duration: 100,
      repeat: 2,
      repeatDelay: 0,
      yoyo: true,
    });
    const n2 = normalizer(100, {
      total: 800,
      offset: 0,
      duration: 100,
      repeat: 2,
      repeatDelay: 0,
      yoyo: true,
    });
    expect(n0).not.toBe(1);
    expect(n1).toBe(0.99);
    expect(n2).not.toBe(0);
    const nLast = normalizer(800, {
      total: 800,
      offset: 600,
      duration: 100,
      repeat: 2,
      repeatDelay: 0,
      yoyo: true,
    });
    expect(nLast).not.toBe(1);
  });
});
