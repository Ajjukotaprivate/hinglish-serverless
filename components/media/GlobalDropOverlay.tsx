"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import {
  uploadVideoOnlyForPreview,
  isVideoFile,
  isAudioFile,
  isImageFile,
  getMaxFileSize,
} from "@/lib/mediaUpload";
import type { MediaItem } from "@/lib/types";

export function GlobalDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  const [userId, setUserId] = useState<string>("anonymous");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const addMediaItem = useEditorStore((s) => s.addMediaItem);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? "anonymous");
    });
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setUploadError(null);

      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length === 0) return;

      const maxSize = getMaxFileSize();
      for (const file of files) {
        if (file.size > maxSize) {
          setUploadError(`"${file.name}" is too large. Max 350MB.`);
          continue;
        }

        if (isVideoFile(file)) {
          const { error } = await uploadVideoOnlyForPreview(file, userId);
          if (error) setUploadError(error);
        } else if (isAudioFile(file)) {
          const url = URL.createObjectURL(file);
          const item: MediaItem = {
            id: uuidv4(),
            name: file.name,
            url,
            type: "audio",
            size: file.size,
            createdAt: new Date().toISOString(),
          };
          addMediaItem(item);
        } else if (isImageFile(file)) {
          const url = URL.createObjectURL(file);
          const item: MediaItem = {
            id: uuidv4(),
            name: file.name,
            url,
            type: "image",
            size: file.size,
            createdAt: new Date().toISOString(),
          };
          addMediaItem(item);
        }
      }
    },
    [userId, addMediaItem]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if we're leaving the window (relatedTarget null) or document body
    if (!e.relatedTarget || (e.relatedTarget as Node) === document.body) {
      setIsDragging(false);
    }
  }, []);

  useEffect(() => {
    document.body.addEventListener("dragenter", handleDragOver);
    document.body.addEventListener("dragover", handleDragOver);
    document.body.addEventListener("dragleave", handleDragLeave);
    document.body.addEventListener("drop", handleDrop);
    return () => {
      document.body.removeEventListener("dragenter", handleDragOver);
      document.body.removeEventListener("dragover", handleDragOver);
      document.body.removeEventListener("dragleave", handleDragLeave);
      document.body.removeEventListener("drop", handleDrop);
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

  if (!isDragging) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-500/20 backdrop-blur-sm"
      onDragLeave={() => setIsDragging(false)}
    >
      <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-white/95 px-12 py-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">📁</span>
          <p className="text-lg font-semibold text-gray-800">
            Drop files anywhere
          </p>
          <p className="text-sm text-gray-500">
            Videos, audio, or images — they’ll appear in Media
          </p>
          <p className="text-xs text-gray-400">Max 350MB per file</p>
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
