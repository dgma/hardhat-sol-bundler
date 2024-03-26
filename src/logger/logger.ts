import { type ILogger } from "./types";

export const simpleLogger: ILogger = {
  info: (data: string) => console.log(data),
};

export const defaultLogger = {
  info: () => {},
};
