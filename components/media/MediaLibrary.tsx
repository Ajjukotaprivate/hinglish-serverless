"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { formatMediaMeta } from "@/lib/mediaUpload";
import type { MediaItem } from "@/lib/types";

interface MediaLibraryProps {
  videos: MediaItem[];
  audio: MediaItem[];
  images: MediaItem[];
}

export function MediaLibrary({ videos, audio, images }: MediaLibraryProps) {
  const setMedia = useEditorStore((s) => s.setMedia);

  const handleVideoSelect = (item: MediaItem) => {
    setMedia({
      videoUrl: item.url,
      audioUrl: item.url,
    });
  };

  return (
    <div className="space-y-3">
      <CollapsibleSection
        title="VIDEOS"
        count={videos.length}
        icon={
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
        }
      >
        {videos.length === 0 ? (
          <p className="text-sm text-gray-500">No videos yet.</p>
        ) : (
          <ul className="space-y-2">
            {videos.map((item) => (
              <MediaRow
                key={item.id}
                item={item}
                type="video"
                onSelect={() => handleVideoSelect(item)}
              />
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="AUDIO"
        count={audio.length}
        icon={
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        }
      >
        {audio.length === 0 ? (
          <p className="text-sm text-gray-500">No audio files yet.</p>
        ) : (
          <ul className="space-y-2">
            {audio.map((item) => (
              <MediaRow key={item.id} item={item} type="audio" />
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="IMAGES"
        count={images.length}
        icon={
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        }
      >
        {images.length === 0 ? (
          <p className="text-sm text-gray-500">No images yet.</p>
        ) : (
          <ul className="space-y-2">
            {images.map((item) => (
              <MediaRow key={item.id} item={item} type="image" />
            ))}
          </ul>
        )}
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-2 flex w-full items-center gap-2 text-left"
      >
        <span
          className={`inline-block transition-transform ${open ? "rotate-90" : "rotate-0"}`}
          aria-hidden
        >
          <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </span>
        <span className="text-gray-500">{icon}</span>
        <h3 className="flex-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title} ({count})
        </h3>
      </button>
      {open && <div className="pl-1">{children}</div>}
    </div>
  );
}

function MediaRow({
  item,
  type,
  onSelect,
}: {
  item: MediaItem;
  type: "video" | "audio" | "image";
  onSelect?: () => void;
}) {
  const displayName = item.name.length > 20 ? item.name.slice(0, 17) + "…" : item.name;
  const meta = formatMediaMeta(item.size, item.createdAt);

  const thumb = (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-gray-200">
      {type === "video" && item.url ? (
        <video
          src={item.url}
          className="h-full w-full object-cover"
          muted
          preload="metadata"
        />
      ) : type === "image" && item.url ? (
        <img
          src={item.url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : type === "audio" ? (
        <span className="text-lg">🎵</span>
      ) : (
        <span className="text-lg">🎬</span>
      )}
    </div>
  );

  const content = (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
      <p className="text-xs text-gray-500">{meta}</p>
    </div>
  );

  if (onSelect) {
    return (
      <li>
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full gap-3 rounded-lg border border-gray-200 p-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {thumb}
          {content}
        </button>
      </li>
    );
  }

  return (
    <li className="flex gap-3 rounded-lg border border-gray-200 p-2">
      {thumb}
      {content}
    </li>
  );
}
