import { describe, expect, it } from "vitest";
import {
  blocksRunningRecommendation,\n  canCompleteAssessment,
  isValidMeasurement,
  requiresMedicalReview,
  requiresPainReview,
  toggleExclusiveOption,
} from "./safety";

describe("regras de segurança da avaliação", () => {
  it("mantém Nenhuma exclusiva das demais opções", () => {
    expect(toggleExclusiveOption("Nenhuma", ["Joelho"])).toEqual(["Nenhuma"]);
    expect(toggleExclusiveOption("Diabetes", ["Nenhuma"])).toEqual(["Diabetes"]);
    expect(toggleExclusiveOption("Lombar", ["Joelho"])).toEqual(["Joelho", "Lombar"]);
  });

  it("valida faixas plausíveis de peso e altura", () => {
    expect(isValidMeasurement(90, 170)).toBe(true);
    expect(isValidMeasurement(0, 170)).toBe(false);
    expect(isValidMeasurement(90, 79)).toBe(false);
    expect(isValidMeasurement(501, 170)).toBe(false);
  });

  it("identifica condições de saúde que exigem revisão médica", () => {
    expect(requiresMedicalReview(["Nenhuma"])).toBe(false);
    expect(requiresMedicalReview(["Pressão alta"])).toBe(true);
  });

  it("identifica dor ou limitação que exige adaptação", () => {
    expect(requiresPainReview(["Nenhuma"])).toBe(false);
    expect(requiresPainReview(["Joelho"])).toBe(true);
  });

  it("bloqueia objetivo de corrida quando IMC estimado é igual ou maior que 35", () => {
    expect(blocksRunningRecommendation(35, "Começar a correr")).toBe(true);
    expect(blocksRunningRecommendation(34.9, "Começar a correr")).toBe(false);
    expect(blocksRunningRecommendation(38, "Condicionamento")).toBe(false);
  });
});

describe("liberação do fluxo de treino", () => {
  const valid = {
    adult: true, understood: true, weight: 90, heightCm: 170,
    medicalReviewNeeded: false, medicalClearanceDeclared: false, runningBlocked: false,
  };
  it("só libera a avaliação quando todos os requisitos estão atendidos", () => {
    expect(canCompleteAssessment(valid)).toBe(true);
    expect(canCompleteAssessment({ ...valid, adult: false })).toBe(false);
    expect(canCompleteAssessment({ ...valid, understood: false })).toBe(false);
    expect(canCompleteAssessment({ ...valid, medicalReviewNeeded: true })).toBe(false);
    expect(canCompleteAssessment({ ...valid, medicalReviewNeeded: true, medicalClearanceDeclared: true })).toBe(true);
    expect(canCompleteAssessment({ ...valid, runningBlocked: true })).toBe(false);
  });
});
