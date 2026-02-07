"use client";

import { useEditorStore } from "@/lib/store";
import type { MediaItem } from "@/lib/types";

interface MediaLibraryProps {
  videos: MediaItem[];
  audio: MediaItem[];
  images: MediaItem[];
}

export function MediaLibrary({ videos, audio, images }: MediaLibraryProps) {
  const { setMedia, setSegments, setMediaItems } = useEditorStore();

  const handleVideoSelect = (item: MediaItem) => {
    setMedia({
      videoUrl: item.url,
      audioUrl: item.url,
    });
  };

  return (
    <div className="space-y-3">
      <CollapsibleSection title={`VIDEOS (${videos.length})`}>
        {videos.length === 0 ? (
          <p className="text-sm text-gray-500">No videos yet.</p>
        ) : (
          <ul className="space-y-2">
            {videos.map((item) => (
              <li
                key={item.id}
                className="cursor-pointer rounded border border-gray-200 p-2 text-sm hover:bg-gray-50"
                onClick={() => handleVideoSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleVideoSelect(item);
                }}
                role="button"
                tabIndex={0}
              >
                <span className="block truncate font-medium">{item.name}</span>
                {item.size && (
                  <span className="text-xs text-gray-500">
                    {(item.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection title={`AUDIO (${audio.length})`}>
        {audio.length === 0 ? (
          <p className="text-sm text-gray-500">No audio files yet.</p>
        ) : (
          <ul className="space-y-2">
            {audio.map((item) => (
              <li
                key={item.id}
                className="rounded border border-gray-200 p-2 text-sm"
              >
                <span className="block truncate">{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection title={`IMAGES (${images.length})`}>
        {images.length === 0 ? (
          <p className="text-sm text-gray-500">No images yet.</p>
        ) : (
          <ul className="space-y-2">
            {images.map((item) => (
              <li
                key={item.id}
                className="rounded border border-gray-200 p-2 text-sm"
              >
                <span className="block truncate">{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      {children}
    </div>
  );
}
