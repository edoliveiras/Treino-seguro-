import { assertEquals, assertRejects } from "jsr:@std/assert@1";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { deleteUserFoodPhotos } from "./photoCleanup.ts";

Deno.test("revocation removes every batch from only the caller's folder", async () => {
  const userId = "user-a";
  let calls = 0;
  const removed: string[][] = [];
  const storage = {
    from: (bucket: string) => ({
      list: async (prefix: string, options: { limit: number; offset: number }) => {
        assertEquals(bucket, "food-photos");
        assertEquals(prefix, userId);
        assertEquals(options.offset, 0);
        calls += 1;
        if (calls === 1) return { data: Array.from({ length: 1000 }, (_, i) => ({ id: String(i), name: `a-${i}.jpg` })), error: null };
        if (calls === 2) return { data: [{ id: "last", name: "last.webp" }], error: null };
        return { data: [], error: null };
      },
      remove: async (paths: string[]) => { removed.push(paths); return { data: [], error: null }; },
    }),
  } as unknown as SupabaseClient["storage"];
  const count = await deleteUserFoodPhotos(storage, userId);
  assertEquals(count, 1001);
  assertEquals(calls, 2);
  assertEquals(removed.flat().length, 1001);
  if (removed.flat().some((path) => !path.startsWith("user-a/"))) throw new Error("cleanup_crossed_user_folder");
});

Deno.test("does not report success when storage deletion fails", async () => {
  const storage = {
    from: () => ({
      list: async () => ({ data: [{ id: "x", name: "x.jpg" }], error: null }),
      remove: async () => ({ data: null, error: new Error("storage unavailable") }),
    }),
  } as unknown as SupabaseClient["storage"];
  await assertRejects(() => deleteUserFoodPhotos(storage, "user-a"), Error, "photo_remove_failed");
});

Deno.test("returns zero when the user has no photos", async () => {
  const storage = {
    from: () => ({
      list: async () => ({ data: [], error: null }),
      remove: async () => ({ data: [], error: null }),
    }),
  } as unknown as SupabaseClient["storage"];
  assertEquals(await deleteUserFoodPhotos(storage, "user-a"), 0);
});
