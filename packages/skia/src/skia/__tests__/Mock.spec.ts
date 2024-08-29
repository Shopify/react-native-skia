describe("Test the mock we provide to users", () => {
  it("Should load the mock successfully", () => {
    expect(() => {
      require("../../mock");
    }).not.toThrow();
  });
});
