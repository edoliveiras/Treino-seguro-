import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export async function deleteUserFoodPhotos(
  storage: SupabaseClient["storage"],
  userId: string,
): Promise<number> {
  let deleted = 0;
  for (;;) {
    const { data: objects, error: listError } = await storage
      .from("food-photos")
      .list(userId, { limit: 1000, offset: 0 });
    if (listError) throw new Error("photo_list_failed");
    if (!objects?.length) return deleted;
    const paths = objects.filter((item) => item.id).map((item) => `${userId}/${item.name}`);
    if (paths.length) {
      const { error: removeError } = await storage.from("food-photos").remove(paths);
      if (removeError) throw new Error("photo_remove_failed");
      deleted += paths.length;
    }
    if (objects.length < 1000) return deleted;
    if (paths.length === 0) throw new Error("photo_cleanup_stalled");
  }
}
