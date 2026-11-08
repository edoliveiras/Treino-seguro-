// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => cleanup());

function completeBasicAssessment() {
  fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "90" } });
  fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "170" } });
  fireEvent.click(screen.getByText("Confirmo que tenho 18 anos ou mais."));
  fireEvent.click(screen.getByText(/Compreendo que o app é educativo/));
  fireEvent.click(screen.getByRole("button", { name: /Concluir avaliação/ }));
}

describe("fluxos de segurança da interface", () => {
  it("bloqueia acesso direto ao treino sem avaliação concluída", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Treino" }));
    expect(screen.getByText("Comece com segurança")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Ir para avaliação/ })).toBeTruthy();
  });

  it("exige nova conclusão se os parâmetros mudarem após a avaliação", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    completeBasicAssessment();
    expect(screen.getByText("Movimento da semana")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    fireEvent.change(screen.getByLabelText("Objetivo"), { target: { value: "Força" } });
    fireEvent.click(screen.getByRole("button", { name: "Treino" }));
    expect(screen.getByText("Comece com segurança")).toBeTruthy();
  });

  it("não mostra exercícios quando a pessoa relata dor ou limitação", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "90" } });
    fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "170" } });
    fireEvent.click(screen.getByLabelText("Joelho"));
    fireEvent.click(screen.getByText("Confirmo que tenho 18 anos ou mais."));
    fireEvent.click(screen.getByText(/Compreendo que o app é educativo/));
    fireEvent.click(screen.getByRole("button", { name: /Concluir avaliação/ }));
    fireEvent.click(screen.getByRole("button", { name: "Exercícios" }));
    expect(screen.getByText("Biblioteca temporariamente ocultada")).toBeTruthy();
    expect(screen.queryByText("Caminhada confortável")).toBeNull();
  });
});
