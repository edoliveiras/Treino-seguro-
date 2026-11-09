import { describe, expect, it } from "vitest";
import { getSimpleExerciseName, getWorkoutCatalog } from "./ExerciseLibrary";

describe("nomenclatura normal dos exercícios", () => {
  it("mantém a biblioteca completa e nomes técnicos identificáveis", () => {
    const catalog = getWorkoutCatalog();
    expect(catalog.length).toBe(443);
    expect(new Set(catalog.map(exercise => exercise.technicalName)).size).toBe(398);
    expect(catalog.every(exercise => exercise.name.trim().length > 0)).toBe(true);
    expect(catalog.every(exercise => exercise.technicalName.length > 0)).toBe(true);
  });

  it("usa nomes conhecidos de musculação em vez de descrições inventadas", () => {
    expect(getSimpleExerciseName("leg press 45", "Quadríceps")).toBe("Leg press");
    expect(getSimpleExerciseName("supino reto com barra", "Peito")).toBe("Supino reto");
    expect(getSimpleExerciseName("agachamento livre", "Quadríceps")).toBe("agachamento livre");
    expect(getSimpleExerciseName("agachamento sumô", "Quadríceps")).toBe("Agachamento sumô");
    expect(getSimpleExerciseName("stiff", "Posterior de coxa")).toBe("Stiff");
    expect(getSimpleExerciseName("rosca direta com barra", "Bíceps")).toBe("Rosca direta");
    expect(getSimpleExerciseName("dead bug", "Abdômen")).toBe("Abdominal alternado");
    expect(getSimpleExerciseName("bird dog", "Lombar e core profundo")).toBe("Extensão alternada no solo");
  });

  it("não transforma exercícios em comandos genéricos como empurrar ou puxar peso", () => {
    for (const exercise of getWorkoutCatalog()) {
      expect(exercise.name).not.toMatch(/^(Empurrar peso|Puxar peso|Dobrar braços|Mover o corpo|Agachar com controle)/i);
    }
  });
});
