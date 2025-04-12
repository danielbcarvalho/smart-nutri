import { BodyDensityFormula } from "./types";
import { pollock3Formula } from "./pollock3";
import { pollock7Formula } from "./pollock7";
import { guedesFormula } from "./guedes";

export const bodyDensityFormulas: BodyDensityFormula[] = [
  pollock3Formula,
  pollock7Formula,
  guedesFormula,
];

export * from "./types";
export * from "./pollock3";
export * from "./pollock7";
export * from "./guedes";
