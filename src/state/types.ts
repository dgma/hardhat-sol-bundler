export type Change<T> = (prevState: T) => T;
export interface IState<T> {
  value: () => T;
  update: (change: Change<T>) => void;
}
export type Create = <T>(initState: T) => IState<T>;
