import { describe, expect, it } from "vitest";
import {
  blocksRunningRecommendation,
  canCompleteAssessment,
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

describe("validações de entradas e cenários combinados", () => {
  it("rejeita valores não numéricos, infinitos e fora dos limites", () => {
    expect(isValidMeasurement(Number.NaN, 170)).toBe(false);
    expect(isValidMeasurement(90, Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidMeasurement(0.9, 170)).toBe(false);
    expect(isValidMeasurement(90, 250.1)).toBe(false);
    expect(isValidMeasurement(500, 250)).toBe(true);
    expect(isValidMeasurement(1, 80)).toBe(true);
  });

  it("não considera a opção Nenhuma suficiente quando outra condição também foi marcada", () => {
    expect(requiresMedicalReview(["Nenhuma", "Diabetes"])).toBe(true);
    expect(requiresPainReview(["Nenhuma", "Joelho"])).toBe(true);
  });

  it("não libera a avaliação se a autodeclaração de maioridade ou os dados forem inválidos", () => {
    const valid = {
      adult: true, understood: true, weight: 90, heightCm: 170,
      medicalReviewNeeded: false, medicalClearanceDeclared: false, runningBlocked: false,
    };
    expect(canCompleteAssessment({ ...valid, adult: false })).toBe(false);
    expect(canCompleteAssessment({ ...valid, weight: Number.NaN })).toBe(false);
    expect(canCompleteAssessment({ ...valid, heightCm: 0 })).toBe(false);
  });

  it("aplica o bloqueio de corrida somente ao objetivo de corrida no limiar definido", () => {
    expect(blocksRunningRecommendation(35, "Começar a correr")).toBe(true);
    expect(blocksRunningRecommendation(34.999, "Começar a correr")).toBe(false);
    expect(blocksRunningRecommendation(40, "Mobilidade e bem-estar")).toBe(false);
  });
});

