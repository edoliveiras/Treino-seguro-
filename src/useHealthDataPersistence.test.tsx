// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useHealthDataPersistence } from "./useHealthDataPersistence";

const state = vi.hoisted(() => ({
  consent: [] as Array<{ action: string }>,
  cloudPayload: null as Record<string, unknown> | null,
  consentWrites: [] as Array<Record<string, unknown>>,
  upserts: [] as Array<Record<string, unknown>>,
  deletes: 0,
}));

vi.mock("./lib/supabase", () => ({
  supabase: {
    from(table: string) {
      if (table === "account_consent_events") {
        return {
          select() {
            return {
              eq() {
                return {
                  eq() {
                    return {
                      order() {
                        return {
                          limit: async () => ({ data: state.consent, error: null }),
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          insert: async (row: Record<string, unknown>) => {
            state.consentWrites.push(row);
            state.consent.push({ action: String(row.action) });
            return { error: null };
          },
        };
      }
      return {
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({
                  data: state.cloudPayload ? { payload: state.cloudPayload } : null,
                  error: null,
                }),
              };
            },
          };
        },
        upsert: async (row: Record<string, unknown>) => {
          state.upserts.push(row);
          return { error: null };
        },
        delete() {
          return {
            eq: async () => {
              state.deletes += 1;
              state.cloudPayload = null;
              return { error: null };
            },
          };
        },
      };
    },
  },
}));

function Harness() {
  const [payload, setPayload] = useState<Record<string, unknown>>({ weight: "80" });
  const cloud = useHealthDataPersistence("user-1", payload, setPayload);
  return (
    <div>
      <span data-testid="consent">{cloud.consent ? "ativo" : "inativo"}</span>
      <span data-testid="weight">{String(payload.weight ?? "")}</span>
      <span role="status">{cloud.status}</span>
      <button onClick={() => void cloud.grantConsent()}>Autorizar</button>
      <button onClick={() => void cloud.revokeConsent()}>Revogar</button>
      <button onClick={() => void cloud.deleteCloudData()}>Apagar</button>
    </div>
  );
}

describe("persistência de dados pessoais de saúde", () => {
  beforeEach(() => {
    state.consent = [];
    state.cloudPayload = null;
    state.consentWrites = [];
    state.upserts = [];
    state.deletes = 0;
  });
  afterEach(() => cleanup());

  it("carrega dados anteriores antes de habilitar a sincronização após consentimento", async () => {
    state.cloudPayload = { weight: "67" };
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId("consent").textContent).toBe("inativo"));
    fireEvent.click(screen.getByRole("button", { name: "Autorizar" }));
    await waitFor(() => expect(screen.getByTestId("weight").textContent).toBe("67"));
    await waitFor(() => expect(state.upserts.some((row) =>
      (row.payload as Record<string, unknown>).weight === "67"
    )).toBe(true));
    expect(state.consentWrites[0].action).toBe("granted");
  });

  it("registra a retirada do consentimento e interrompe a sincronização", async () => {
    state.consent = [{ action: "granted" }];
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId("consent").textContent).toBe("ativo"));
    fireEvent.click(screen.getByRole("button", { name: "Revogar" }));
    await waitFor(() => expect(screen.getByTestId("consent").textContent).toBe("inativo"));
    expect(state.consentWrites[state.consentWrites.length - 1]?.action).toBe("withdrawn");
  });

  it("retira o consentimento antes de apagar os registros armazenados", async () => {
    state.consent = [{ action: "granted" }];
    state.cloudPayload = { weight: "72" };
    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId("consent").textContent).toBe("ativo"));
    fireEvent.click(screen.getByRole("button", { name: "Apagar" }));
    await waitFor(() => expect(state.deletes).toBe(1));
    expect(state.consentWrites[state.consentWrites.length - 1]?.action).toBe("withdrawn");
    await waitFor(() => expect(screen.getByTestId("consent").textContent).toBe("inativo"));
  });
});
