import { describe, expect, it } from "vitest";
import { getSimpleExerciseName, getWorkoutCatalog } from "./ExerciseLibrary";

describe("nomes simples da biblioteca de exercícios", () => {
  it("mantém os 398 nomes técnicos únicos e os nomes populares curtos", () => {
    const catalog = getWorkoutCatalog();
    expect(catalog.length).toBe(443);
    expect(new Set(catalog.map(exercise => exercise.technicalName)).size).toBe(398);
    expect(new Set(catalog.map(exercise => exercise.name)).size).toBe(399);
    for (const exercise of catalog) {
      expect(exercise.name.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
      expect(exercise.technicalName.length).toBeGreaterThan(0);
      expect(exercise.explanation).toContain("você sente");
    }
  });

  it("traduz os principais nomes técnicos para português simples", () => {
    expect(getSimpleExerciseName("leg press 45", "Quadríceps")).toBe("Empurrar plataforma");
    expect(getSimpleExerciseName("agachamento livre", "Quadríceps")).toBe("Agachar peso nas costas");
    expect(getSimpleExerciseName("agachamento sumô", "Quadríceps")).toBe("Agachar com pernas abertas");
    expect(getSimpleExerciseName("stiff", "Posterior de coxa")).toBe("Descer peso pernas retas");
    expect(getSimpleExerciseName("dead bug", "Abdômen")).toBe("Estender braço deitado");
  });

  it("diferencia o coice para braço do coice para glúteos", () => {
    expect(getSimpleExerciseName("coice na polia", "Tríceps")).toBe("Esticar braço com cabo");
    expect(getSimpleExerciseName("coice na polia", "Glúteos")).toBe("Levar perna para trás");
  });
});
