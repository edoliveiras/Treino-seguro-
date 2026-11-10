// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import AdminPanel from "./AdminPanel";

const state = vi.hoisted(() => ({
  accounts: [
    { id: "admin-1", full_name: "Admin", email: "admin@example.test", phone_e164: "+5511999990001", account_status: "active", email_verified_at: "2026-11-01T00:00:00Z", created_at: "2026-11-01T00:00:00Z" },
    { id: "user-2", full_name: "Pessoa Usuária", email: "user@example.test", phone_e164: "+5511999990002", account_status: "suspended", email_verified_at: "2026-11-02T00:00:00Z", created_at: "2026-11-02T00:00:00Z" },
  ],
  invoke: vi.fn(async () => ({ data: { success: true }, error: null })),
}));

vi.mock("./lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      const query: any = {
        select: () => query,
        order: () => query,
        eq: () => query,
        then: (resolve: (value: any) => unknown) => Promise.resolve({ data: table === "admin_account_directory" ? state.accounts : [], error: null }).then(resolve),
      };
      return query;
    },
    functions: { invoke: state.invoke },
  },
}));

describe("painel administrativo", () => {
  beforeEach(() => state.invoke.mockClear());
  afterEach(() => cleanup());

  it("lista somente dados cadastrais e não oferece excluir a própria conta", async () => {
    render(<AdminPanel currentUserId="admin-1" />);
    await waitFor(() => expect(screen.getAllByText("Pessoa Usuária").length).toBeGreaterThan(0));
    const accountCard = screen.getByText("Pessoa Usuária").closest("article");
    expect(accountCard).not.toBeNull();
    expect(within(accountCard as HTMLElement).getByText("user@example.test")).toBeTruthy();
    expect(within(accountCard as HTMLElement).getByText("Suspensa")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Excluir" })).toHaveLength(1);
    expect(screen.getByText("Sua conta de administrador")).toBeTruthy();
    expect(screen.getByText(/Avaliações e informações de saúde não aparecem/)).toBeTruthy();
  });
});
