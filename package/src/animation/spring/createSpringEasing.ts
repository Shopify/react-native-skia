import { ValueApi } from "../../values";
import { SpringConfig } from "../types";

export const createSpringEasing = (config: SpringConfig) => {
  return ValueApi.createSpringEasing(config);
};
