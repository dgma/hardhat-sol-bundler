export type Change<T> = (prevState: T) => T;
export interface IState<T> {
  value: () => T;
  update: (change: Change<T>) => void;
}
export type Create = <T>(initState: T) => IState<T>;

export const create: Create = <T>(initState: T) => {
  let _state = initState;

  const value = () => _state;

  const update = (change: Change<T>) => {
    if (typeof change === "function") {
      _state = change(_state);
    } else {
      throw new Error("only functional state change supported");
    }
  };

  return { value, update };
};
