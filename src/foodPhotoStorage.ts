import { supabase } from "./lib/supabase";

export const FOOD_PHOTO_BUCKET = "food-photos";
export const FOOD_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const FOOD_PHOTO_MAX_DIMENSION = 1600;
export const FOOD_PHOTO_SIGNED_URL_SECONDS = 60;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateFoodPhoto(file: Pick<File, "type" | "size">): void {
  if (!acceptedTypes.has(file.type)) {
    throw new Error("Use somente uma imagem JPEG, PNG ou WebP.");
  }
  if (file.size > FOOD_PHOTO_MAX_BYTES) {
    throw new Error("A foto deve ter no máximo 5 MB.");
  }
}

export async function prepareFoodPhoto(file: File): Promise<File> {
  validateFoodPhoto(file);
  if (typeof createImageBitmap !== "function") {
    throw new Error("Este navegador não consegue preparar a foto com segurança.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, FOOD_PHOTO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível preparar a foto.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Não foi possível processar a foto.")), file.type, 0.88);
    });
    if (!acceptedTypes.has(blob.type)) throw new Error("O navegador não conseguiu manter um formato de imagem permitido.");
    if (blob.size > FOOD_PHOTO_MAX_BYTES) throw new Error("A foto preparada ultrapassou 5 MB. Escolha uma imagem menor.");
    const extension = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/png" ? "png" : "webp";
    return new File([blob], `alimento-${crypto.randomUUID()}.${extension}`, { type: blob.type, lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

export async function uploadFoodPhoto(userId: string, originalFile: File): Promise<string> {
  if (!supabase) throw new Error("O armazenamento seguro não está disponível.");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || user?.id !== userId) throw new Error("Entre novamente para enviar sua foto.");
  const file = await prepareFoodPhoto(originalFile);
  const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(FOOD_PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: "60",
    upsert: false,
  });
  if (error) throw new Error("Não foi possível guardar a foto com segurança. Tente novamente.");
  return path;
}

export async function createFoodPhotoSignedUrl(userId: string, path: string): Promise<string | null> {
  if (!supabase || !path.startsWith(`${userId}/`)) return null;
  const { data, error } = await supabase.storage.from(FOOD_PHOTO_BUCKET)
    .createSignedUrl(path, FOOD_PHOTO_SIGNED_URL_SECONDS);
  return error ? null : data.signedUrl;
}

export async function deleteFoodPhoto(userId: string, path: string): Promise<boolean> {
  if (!supabase || !path.startsWith(`${userId}/`)) return false;
  const { error } = await supabase.storage.from(FOOD_PHOTO_BUCKET).remove([path]);
  return !error;
}
