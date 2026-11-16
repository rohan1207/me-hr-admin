import slugify from "slugify";

export function makeSlug(text) {
  return slugify(String(text || ""), {
    lower: true,
    strict: true,
    trim: true,
  });
}
