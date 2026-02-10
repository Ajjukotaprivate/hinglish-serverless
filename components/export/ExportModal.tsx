"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import { burnSubtitles } from "@/lib/api";
import { ExportSettings } from "./ExportSettings";
import type { SubtitleSegment } from "@/lib/types";

type ExportStatus = "idle" | "queued" | "rendering" | "ready" | "error";

type ExportType = "video" | "srt" | "vtt";

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function segmentsToSRT(segments: Pick<SubtitleSegment, "start" | "end" | "text">[]): string {
  const lines: string[] = [];
  segments.forEach((seg, index) => {
    const start = formatSRTTime(seg.start);
    const end = formatSRTTime(seg.end);
    lines.push(`${index + 1}`);
    lines.push(`${start} --> ${end}`);
    lines.push(seg.text.trim());
    lines.push("");
  });
  return lines.join("\n");
}

function segmentsToVTT(segments: Pick<SubtitleSegment, "start" | "end" | "text">[]): string {
  const lines = ["WEBVTT", ""];
  segments.forEach((seg) => {
    const start = formatVTTTime(seg.start);
    const end = formatVTTTime(seg.end);
    lines.push(`${start} --> ${end}`);
    lines.push(seg.text.trim());
    lines.push("");
  });
  return lines.join("\n");
}

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
  const [exportType, setExportType] = useState<ExportType>("video");
  const canExport = segments.length > 0;

  const handleExport = async () => {
    if (!canExport) return;

    if (exportType === "srt") {
      const srtContent = segmentsToSRT(segments);
      const blob = new Blob([srtContent], { type: "text/srt" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subtitles.srt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    if (exportType === "vtt") {
      const vttContent = segmentsToVTT(segments);
      const blob = new Blob([vttContent], { type: "text/vtt" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "subtitles.vtt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    if (!videoUrl) return;

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
          {/* Export Type Tabs */}
          <div className="mb-4 flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setExportType("video")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                exportType === "video"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🎥 MP4 Video
            </button>
            <button
              onClick={() => setExportType("srt")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                exportType === "srt"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📄 SRT File
            </button>
            <button
              onClick={() => setExportType("vtt")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                exportType === "vtt"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📝 VTT File
            </button>
          </div>

          {exportType === "video" && (
            <ExportSettings quality={quality} onQualityChange={setQuality} />
          )}

          {exportType === "srt" && (
            <div className="mb-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                Download SRT subtitle file for YouTube, LinkedIn, or other platforms.
              </p>
            </div>
          )}

          {exportType === "vtt" && (
            <div className="mb-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                Download WebVTT subtitle file for web players.
              </p>
            </div>
          )}

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
