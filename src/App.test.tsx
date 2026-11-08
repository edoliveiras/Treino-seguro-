// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function completeBasicAssessment() {
  fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "90" } });
  fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "170" } });
  fireEvent.click(screen.getByLabelText("Confirmo que tenho 18 anos ou mais."));
  fireEvent.click(screen.getByLabelText(/Compreendo que o app é educativo/));
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
    expect(screen.getByText("Avaliação concluída nesta sessão.")).toBeTruthy();

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

  it("reinicia a autodeclaração médica quando uma condição de saúde muda", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "90" } });
    fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "170" } });
    fireEvent.click(screen.getByLabelText("Pressão alta"));
    expect(screen.getByText("Atenção: avaliação médica necessária")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Recebi orientação/liberação médica."));
    expect((screen.getByLabelText("Recebi orientação/liberação médica.") as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByLabelText("Diabetes"));
    expect((screen.getByLabelText("Recebi orientação/liberação médica.") as HTMLInputElement).checked).toBe(false);
    expect(screen.getByRole("button", { name: /Concluir avaliação/ })).toHaveProperty("disabled", true);
  });

  it("bloqueia concluir a avaliação com objetivo de corrida e IMC estimado igual ou maior que 35", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "165" } });
    fireEvent.change(screen.getByLabelText("Objetivo"), { target: { value: "Começar a correr" } });
    fireEvent.click(screen.getByText("Confirmo que tenho 18 anos ou mais.").previousElementSibling as HTMLInputElement);
    fireEvent.click(screen.getByText(/Compreendo que o app é educativo/).previousElementSibling as HTMLInputElement);
    expect(screen.getByText("Corrida não liberada nesta etapa")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Concluir avaliação/ })).toHaveProperty("disabled", true);
  });

  it("mantém Nenhuma exclusiva no formulário de limitações", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    fireEvent.click(screen.getByLabelText("Joelho"));
    const noPainOption = screen.getAllByLabelText("Nenhuma")[0];
    fireEvent.click(noPainOption);
    expect((screen.getByLabelText("Joelho") as HTMLInputElement).checked).toBe(false);
    expect((screen.getAllByLabelText("Nenhuma")[0] as HTMLInputElement).checked).toBe(true);
  });

  it("invalida o treino quando peso, altura, dias, local, nível ou confirmações mudam", () => {
    const changes = [
      () => fireEvent.change(screen.getByLabelText("Peso atual (kg)"), { target: { value: "91" } }),
      () => fireEvent.change(screen.getByLabelText("Altura (cm)"), { target: { value: "171" } }),
      () => fireEvent.change(screen.getByLabelText("Dias disponíveis"), { target: { value: "4" } }),
      () => fireEvent.change(screen.getByLabelText("Local"), { target: { value: "Academia" } }),
      () => fireEvent.change(screen.getByLabelText("Nível"), { target: { value: "Intermediário" } }),
      () => fireEvent.click(screen.getByText("Confirmo que tenho 18 anos ou mais.").previousElementSibling as HTMLInputElement),
      () => fireEvent.click(screen.getByText(/Compreendo que o app é educativo/).previousElementSibling as HTMLInputElement),
    ];
    for (const change of changes) {
      cleanup();
      render(<App />);
      fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
      completeBasicAssessment();
      fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
      change();
      fireEvent.click(screen.getByRole("button", { name: "Treino" }));
      expect(screen.getByText("Comece com segurança")).toBeTruthy();
    }
  });

  it("oferece navegação móvel para todas as áreas do aplicativo", () => {
    render(<App />);
    const mobileNavigation = screen.getByRole("navigation", { name: "Navegação móvel" });
    ["Início", "Avaliação", "Treino", "Montar treino", "Exercícios", "Nutrição", "Evolução", "Ciência", "Privacidade"].forEach((name) => {
      expect(mobileNavigation.querySelector('button[aria-label="Abrir ' + name + '"]')).toBeTruthy();
    });
  });

  it("permite apagar todos os dados mantidos apenas na sessão", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Avaliação" }));
    completeBasicAssessment();
    fireEvent.click(screen.getByRole("button", { name: "Privacidade" }));
    expect(screen.getByText("Proteção e controle dos seus dados pessoais")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Apagar dados desta sessão" }));
    expect(screen.getByRole("status").textContent).toContain("apagados");
    fireEvent.click(screen.getByRole("button", { name: "Treino" }));
    expect(screen.getByText("Comece com segurança")).toBeTruthy();
  });

  it("identifica cada exercício pelo nome para leitores de tela e expõe estado marcado", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Exercícios" }));
    const markButton = screen.getByRole("button", { name: "Marcar Caminhada confortável" });
    expect(markButton.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(markButton);
    expect(screen.getByRole("button", { name: "Desmarcar Caminhada confortável" }).getAttribute("aria-pressed")).toBe("true");
  });



describe("acessibilidade de navegação", () => {
  it("oferece atalho de teclado e informa a seção ativa", () => {
    render(<App />);
    const skipLink = screen.getByRole("link", { name: "Pular para o conteúdo principal" });
    expect(skipLink.getAttribute("href")).toBe("#main-content");
    expect(screen.getByRole("main").getAttribute("tabindex")).toBe("-1");

    const homeButton = screen.getByRole("button", { name: "Abrir Início" });
    expect(homeButton.getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Abrir Ciência" }));
    expect(screen.getByRole("button", { name: "Abrir Ciência" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "Abrir Início" }).getAttribute("aria-current")).toBeNull();
  });
});
