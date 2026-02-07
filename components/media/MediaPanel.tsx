"use client";

import { MediaUpload } from "./MediaUpload";
import { MediaLibrary } from "./MediaLibrary";
import { useEditorStore } from "@/lib/store";

export function MediaPanel() {
  const { mediaItems } = useEditorStore();

  const videos = mediaItems.filter((m) => m.type === "video");
  const audio = mediaItems.filter((m) => m.type === "audio");
  const images = mediaItems.filter((m) => m.type === "image");

  return (
    <div className="space-y-4">
      <MediaUpload />
      <MediaLibrary
        videos={videos}
        audio={audio}
        images={images}
      />
    </div>
  );
}
