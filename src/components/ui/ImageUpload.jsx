"use client";

import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { publicSiteOrigin, resolveMediaUrl } from "@/lib/mediaUrl";

export default function ImageUpload({
  value,
  onChange,
  folder = "me-hr",
  label = "Hero image",
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const displaySrc = resolveMediaUrl(value, publicSiteOrigin());

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange?.({ url: data.url, publicId: data.publicId });
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {displaySrc ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displaySrc} alt="" className="aspect-[21/9] w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange?.({ url: "", publicId: "" })}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-slate-700 shadow"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center transition hover:border-[#0b5f58] hover:bg-[#e6f7f4]/40">
          {uploading ? (
            <Loader2 className="animate-spin text-[#0b5f58]" size={22} />
          ) : (
            <ImagePlus className="text-slate-400" size={22} />
          )}
          <span className="text-sm font-medium text-slate-700">
            {uploading ? "Uploading to Cloudinary…" : "Upload image"}
          </span>
          <span className="text-xs text-slate-400">PNG, JPG, WebP · stored on Cloudinary</span>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
