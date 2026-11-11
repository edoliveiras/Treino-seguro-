import { describe, expect, it } from "vitest";
import { FOOD_PHOTO_MAX_BYTES, FOOD_PHOTO_MAX_DIMENSION, validateFoodPhoto } from "./foodPhotoStorage";

describe("food photo validation", () => {
  it("accepts only JPEG, PNG and WebP up to 5 MB", () => {
    expect(() => validateFoodPhoto({ type: "image/jpeg", size: FOOD_PHOTO_MAX_BYTES })).not.toThrow();
    expect(() => validateFoodPhoto({ type: "image/png", size: 1024 })).not.toThrow();
    expect(() => validateFoodPhoto({ type: "image/webp", size: 1024 })).not.toThrow();
  });

  it("rejects unsupported formats and files over 5 MB", () => {
    expect(() => validateFoodPhoto({ type: "image/svg+xml", size: 100 })).toThrow(/JPEG, PNG ou WebP/);
    expect(() => validateFoodPhoto({ type: "image/jpeg", size: FOOD_PHOTO_MAX_BYTES + 1 })).toThrow(/5 MB/);
  });

  it("uses a maximum processing dimension of 1600 pixels", () => {
    expect(FOOD_PHOTO_MAX_DIMENSION).toBe(1600);
  });
});
