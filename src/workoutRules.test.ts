import { describe, expect, it } from "vitest";
import { ensureFullBodyGroups, isSafeForRules, prescriptionForLevel, requiredExerciseCount, safetyNotice } from "./workoutRules";
const ex=(name:string,home=true,beginner=true)=>({name,focus:["Pernas"],home,gym:true,beginner,styles:["Full body"]});
describe("regras complementares do gerador de treinos",()=>{
 it("limita a quantidade de exercícios por nível e duração",()=>{
  expect(requiredExerciseCount("Iniciante",30)).toBe(5);
  expect(requiredExerciseCount("Iniciante",45)).toBe(7);
  expect(requiredExerciseCount("Avançado",60)).toBe(9);
 });
 it("não inclui equipamento inexistente no treino em casa",()=>{
  const rules={level:"Intermediário" as const,place:"Casa" as const,duration:45 as const,equipment:["Peso do corpo"] as const};
  expect(isSafeForRules(ex("Flexão na parede"),rules)).toBe(true);
  expect(isSafeForRules(ex("Rosca com halteres"),rules)).toBe(false);
  expect(isSafeForRules(ex("Remada com elástico"),rules)).toBe(false);
 });
 it("retira agachamento fundo, afundo e saltos quando há dor no joelho",()=>{
  const rules={level:"Iniciante" as const,place:"Casa" as const,duration:30 as const,equipment:["Peso do corpo"] as const,pains:["Joelho"] as const,overweight:true};
  expect(isSafeForRules(ex("Agachamento fundo"),rules)).toBe(false);
  expect(isSafeForRules(ex("Afundo"),rules)).toBe(false);
  expect(isSafeForRules(ex("Polichinelo com salto"),rules)).toBe(false);
  expect(isSafeForRules(ex("Elevação de quadril"),rules)).toBe(true);
 });
 it("impede barra livre e conjugados nas duas primeiras semanas do iniciante",()=>{
  const rules={level:"Iniciante" as const,place:"Academia" as const,duration:30 as const,week:1};
  expect(isSafeForRules(ex("Supino com barra livre",false,false),rules)).toBe(false);
  expect(prescriptionForLevel(ex("Leg press"),rules).conjugates).toBe(false);
  expect(prescriptionForLevel(ex("Leg press"),{...rules,week:3}).conjugates).toBe(true);
 });
 it("mantém vários grupos musculares em todas as sessões Full body",()=>{
  expect(ensureFullBodyGroups(["Bíceps"],"Full body").length).toBeGreaterThan(1);
 });
 it("usa o aviso de segurança solicitado",()=>expect(safetyNotice()).toContain("Interrompa se houver dor"));
});
