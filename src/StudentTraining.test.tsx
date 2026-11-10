// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import StudentTraining from "./StudentTraining";

afterEach(()=>{cleanup();vi.restoreAllMocks();});

describe("treino apresentado ao aluno",()=>{
 it("mostra o modelo de iniciante com adaptações e marcação",async()=>{
  render(<StudentTraining level="Iniciante" place="Casa" days="3"/>);
  await waitFor(()=>expect(screen.getByRole("heading",{name:"Iniciante — Corpo inteiro"})).toBeTruthy());
  expect(screen.getByRole("button",{name:"Marcar Sentar e levantar da cadeira"})).toBeTruthy();
  expect(screen.getAllByText(/Adaptação para joelho/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/Adaptação para lombar/).length).toBeGreaterThan(0);
  expect(screen.getByText(/Aviso importante/)).toBeTruthy();
  expect(screen.getAllByRole("link",{name:/Buscar vídeo no YouTube/}).length).toBe(6);
 });
 it("seleciona o modelo correspondente ao nível informado",async()=>{
  render(<StudentTraining level="Intermediário" place="Academia" days="4"/>);
  await waitFor(()=>expect(screen.getByRole("heading",{name:"Intermediário — Superior e inferior"})).toBeTruthy());
  expect(screen.getByRole("button",{name:"Superior"})).toBeTruthy();
  fireEvent.click(screen.getByRole("button",{name:"Inferior"}));
  expect(screen.getByRole("button",{name:"Marcar Leg press"})).toBeTruthy();
 });
});
