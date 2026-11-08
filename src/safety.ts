export function toggleExclusiveOption(value: string, selected: string[]): string[] {
  if (selected.includes(value)) return selected.filter((item) => item !== value);
  if (value === "Nenhuma") return [value];
  return [...selected.filter((item) => item !== "Nenhuma"), value];
}

export function isValidMeasurement(weight: number, heightCm: number): boolean {
  return Number.isFinite(weight) && Number.isFinite(heightCm) &&
    weight >= 1 && weight <= 500 && heightCm >= 80 && heightCm <= 250;
}

export function requiresMedicalReview(conditions: string[]): boolean {
  return conditions.some((condition) => condition !== "Nenhuma");
}

export function requiresPainReview(pains: string[]): boolean {
  return pains.some((pain) => pain !== "Nenhuma");
}

export function blocksRunningRecommendation(bmi: number, goal: string): boolean {
  return bmi >= 35 && goal === "Começar a correr";
}
