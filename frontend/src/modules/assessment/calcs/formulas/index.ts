import { BodyDensityFormula } from "./types";
import { pollock3Formula } from "./pollock3";
import { pollock7Formula } from "./pollock7";
import { guedesFormula } from "./guedes";
import { petroskiFormula } from "./petroski";

export const bodyDensityFormulas: BodyDensityFormula[] = [
  pollock3Formula,
  pollock7Formula,
  guedesFormula,
  petroskiFormula,
];

export * from "./types";
export * from "./pollock3";
export * from "./pollock7";
export * from "./guedes";
export * from "./petroski";
