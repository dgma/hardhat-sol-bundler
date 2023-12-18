import * as fabric from "./fabric";

describe("stateFabric", () => {
  it("should create state", () => {
    const state = fabric.create({ x: "y" });
    expect(state.value()).toEqual({ x: "y" });
  });
  it("should update deployment state", () => {
    const state = fabric.create({ x: "y" });
    state.update(() => ({
      x: "z",
    }));
    expect(state.value()).toEqual({ x: "z" });
  });
});
