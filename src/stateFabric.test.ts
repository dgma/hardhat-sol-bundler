import * as stateFabric from "./stateFabric";

describe("stateFabric", () => {
  it("should create state", () => {
    const state = stateFabric.create({ x: "y" });
    expect(state.value()).toEqual({ x: "y" });
  });
  it("should update deployment state", () => {
    const state = stateFabric.create({ x: "y" });
    state.update(() => ({
      x: "z",
    }));
    expect(state.value()).toEqual({ x: "z" });
  });
});
