import { describe, expect, it } from "vitest";
import { EXAMPLE_PROGRAMS, getExampleProgram, getWeekPrescription } from "./trainingPrograms";

describe("modelos de treino baseados em nível",()=>{
 it("oferece os três níveis com 5 a 7 exercícios por sessão",()=>{
  expect(EXAMPLE_PROGRAMS.map(p=>p.level)).toEqual(["Iniciante","Intermediário","Avançado"]);
  for(const p of EXAMPLE_PROGRAMS) for(const day of p.days) {
   expect(day.exercises.length).toBeGreaterThanOrEqual(5);
   expect(day.exercises.length).toBeLessThanOrEqual(7);
   for(const e of day.exercises) {
    expect(e.name.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
    expect(e.name.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
    expect(e.name).not.toMatch(/\b(leg press|stiff|sum[oô]|goblet|hip thrust|box jump|dead bug|mountain climber|smith|hack)\b/i);
    expect(e.gym.length).toBeGreaterThan(0);
    expect(e.home.length).toBeGreaterThan(0);
    expect(e.knee.length).toBeGreaterThan(0);
    expect(e.back.length).toBeGreaterThan(0);
   }
  }
 });
 it("mantém a frequência e a divisão coerentes com cada nível",()=>{
  expect(getExampleProgram("Iniciante").frequency).toContain("2 a 3");
  expect(getExampleProgram("Intermediário").split).toBe("Superior e inferior");
  expect(getExampleProgram("Avançado").split).toBe("Empurrar, puxar e pernas");
 });
 it("organiza sete semanas com adaptação, progressão e recuperação",()=>{
  expect(getWeekPrescription(1,3,"8–12",90).sets).toBe(2);
  expect(getWeekPrescription(3,2,"8–12",90).sets).toBe(3);
  expect(getWeekPrescription(6,2,"8–12",90).phase).toBe("Consolidação");
  expect(getWeekPrescription(7,3,"8–12",90).phase).toBe("Recuperação e reavaliação");
 });
});
