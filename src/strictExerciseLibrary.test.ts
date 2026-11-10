import { describe, expect, it } from "vitest";
import { getStrictExercises, expandStrictGroups, STRICT_EXERCISES } from "./strictExerciseLibrary";

describe("biblioteca oficial de exercícios", () => {
 it("carrega a biblioteca enviada com 149 exercícios em grupos únicos", () => {
  expect(STRICT_EXERCISES).toHaveLength(154);
  expect(STRICT_EXERCISES.every(e => typeof e.group === "string" && e.group.length > 0)).toBe(true);
  expect(STRICT_EXERCISES.find(e => e.name === "Rosca direta com halteres leves")?.group).toBe("Bíceps");
  expect(STRICT_EXERCISES.find(e => e.name === "Tríceps na polia com corda")?.group).toBe("Tríceps");
  expect(STRICT_EXERCISES.find(e => e.name === "Supino na máquina (peito na máquina)")?.group).toBe("Peito");
 });
 it("não oferece exercícios de nível acima do aluno e prioriza o nível atual", () => {
  const items=getStrictExercises(["Costas","Bíceps"],"Iniciante","Academia",[]);
  expect(items.every(e=>e.level==="Iniciante")).toBe(true);
  const intermediate=getStrictExercises(["Peito"],"Intermediário","Academia",[]);
  expect(intermediate.some(e=>e.level==="Iniciante")).toBe(true);
  expect(intermediate.every(e=>e.level!=="Avançado")).toBe(true);
  expect(intermediate[0].level).toBe("Iniciante");
 });
 it("em casa usa somente exercícios marcados C", () => {
  const items=getStrictExercises(["Costas"],"Avançado","Casa",[]);
  expect(items.length).toBeGreaterThan(0);
  expect(items.every(e=>e.home)).toBe(true);
  expect(items.some(e=>e.name==="Puxada na frente (puxador alto)")).toBe(false);
 });
 it("retira exercícios com alertas de joelho, lombar e ombro", () => {
  const shoulder=getStrictExercises(["Peito"],"Avançado","Academia",["Ombro"]);
  expect(shoulder.some(e=>e.name==="Supino reto com barra")).toBe(false);
  const knee=getStrictExercises(["Quadríceps"],"Avançado","Academia",["Joelho"]);
  expect(knee.some(e=>e.name==="Agachamento com barra")).toBe(false);
  const back=getStrictExercises(["Costas"],"Avançado","Academia",["Lombar"]);
  expect(back.some(e=>e.name==="Remada curvada com barra")).toBe(false);
 });
 it("expande pernas e corpo inteiro sem misturar os grupos", () => {
  expect(expandStrictGroups(["Pernas"])).toEqual(expect.arrayContaining(["Quadríceps","Posterior de coxa","Glúteos","Panturrilha"]));
  expect(expandStrictGroups(["Corpo inteiro"])).toContain("Bíceps");
  expect(expandStrictGroups(["Corpo inteiro"])).not.toContain("Alongamento");
 });
});