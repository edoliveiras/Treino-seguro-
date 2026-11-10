import { describe, expect, it } from "vitest";
import { getStrictExercises, expandStrictGroups, STRICT_EXERCISES } from "./strictExerciseLibrary";

describe("strict exercise library", () => {
 it("keeps every exercise in exactly one primary muscle group", () => {
  expect(STRICT_EXERCISES.every(e => typeof e.group === "string" && e.group.length > 0)).toBe(true);
  expect(STRICT_EXERCISES.find(e => e.name === "Rosca direta leve")?.group).toBe("Bíceps");
  expect(STRICT_EXERCISES.find(e => e.name === "Tríceps na polia com corda")?.group).toBe("Tríceps");
  expect(STRICT_EXERCISES.find(e => e.name === "Supino na máquina")?.group).toBe("Peito");
 });
 it("never gives a beginner an intermediate or advanced exercise", () => {
  const items=getStrictExercises(["Costas","Bíceps"],"Iniciante","Academia",[]);
  expect(items.every(e=>e.level==="Iniciante")).toBe(true);
 });
 it("allows higher levels to use lower-level exercises, never higher-level exercises", () => {
  const items=getStrictExercises(["Peito"],"Intermediário","Academia",[]);
  expect(items.some(e=>e.level==="Iniciante")).toBe(true);
  expect(items.every(e=>e.level!=="Avançado")).toBe(true);
 });
 it("uses only home-marked exercises at home", () => {
  const items=getStrictExercises(["Costas"],"Avançado","Casa",[]);
  expect(items.length).toBeGreaterThan(0);
  expect(items.every(e=>e.home)).toBe(true);
  expect(items.some(e=>e.name==="Puxada na frente")).toBe(false);
 });
 it("removes exercises carrying the student's pain flags", () => {
  const shoulder=getStrictExercises(["Peito"],"Avançado","Academia",["Ombro"]);
  expect(shoulder.some(e=>e.name==="Supino reto com barra")).toBe(false);
  const knee=getStrictExercises(["Quadríceps"],"Avançado","Academia",["Joelho"]);
  expect(knee.some(e=>e.name==="Agachamento com barra")).toBe(false);
  const back=getStrictExercises(["Costas"],"Avançado","Academia",["Lombar"]);
  expect(back.some(e=>e.name==="Remada curvada com barra")).toBe(false);
 });
 it("expands the whole-body and legs selections without cross-tagging exercises", () => {
  expect(expandStrictGroups(["Pernas"])).toEqual(expect.arrayContaining(["Quadríceps","Posterior de coxa","Glúteos","Panturrilha"]));
  expect(expandStrictGroups(["Corpo inteiro"])).toContain("Bíceps");
 });
});
