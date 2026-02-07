"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { burnSubtitles } from "@/lib/api";
import { ExportSettings } from "./ExportSettings";

type ExportStatus = "idle" | "queued" | "rendering" | "ready" | "error";

export function ExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    videoUrl,
    segments,
    subtitleStyle,
    aspectRatio,
  } = useEditorStore();
  const [quality, setQuality] = useState<"fast" | "balanced" | "high">("balanced");
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canExport = videoUrl && segments.length > 0;

  const handleExport = async () => {
    if (!videoUrl || segments.length === 0) return;

    setStatus("rendering");
    setError(null);

    try {
      const result = await burnSubtitles(
        videoUrl,
        segments.map((s) => ({ start: s.start, end: s.end, text: s.text })),
        quality,
        "anonymous",
        {
          fontFamily: subtitleStyle.fontFamily,
          fontSize: subtitleStyle.fontSize,
          alignment: subtitleStyle.alignment,
          allCaps: subtitleStyle.allCaps,
          textColor: subtitleStyle.textColor,
          outlineEnabled: subtitleStyle.outlineEnabled,
          outlineColor: subtitleStyle.outlineColor,
          outlineWidth: subtitleStyle.outlineWidth,
        },
        aspectRatio
      );

      if (result.success && result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setStatus("ready");
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">Export Video</h2>

        {status === "idle" && (
          <>
            <ExportSettings quality={quality} onQualityChange={setQuality} />
            {!canExport && (
              <p className="mb-4 text-sm text-amber-600">
                Add video and subtitles to export.
              </p>
            )}
          </>
        )}

        {status === "rendering" && (
          <div className="py-8 text-center">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-gray-600">Rendering video with subtitles...</p>
            <p className="mt-2 text-sm text-gray-500">
              This may take 1-2 minutes.
            </p>
          </div>
        )}

        {status === "ready" && downloadUrl && (
          <div className="space-y-4">
            <p className="text-green-600">Export complete!</p>
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded bg-primary px-4 py-2 text-center text-white hover:bg-primary-hover"
            >
              Download MP4
            </a>
          </div>
        )}

        {status === "error" && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {status === "idle" && (
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport}
              className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover disabled:opacity-50"
            >
              Export
            </button>
          )}
          {status === "ready" && (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2"
            >
              Close
            </button>
          )}
          {(status === "idle" || status === "error") && (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
