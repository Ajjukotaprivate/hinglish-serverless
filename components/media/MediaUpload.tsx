"use client";

import { useRef, useState, useEffect } from "react";
import { useEditorStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { uploadVideoOnlyForPreview } from "@/lib/mediaUpload";

export function MediaUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("anonymous");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? "anonymous");
    });
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) return;
    setError(null);
    setUploading(true);
    try {
      const { error: err } = await uploadVideoOnlyForPreview(file, userId);
      if (err) setError(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const handleRefresh = () => {
    setError(null);
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*, audio/*, image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Uploading…
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Media
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={uploading}
          className="flex h-[46px] w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          title="Refresh / Upload"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-gray-500">Max 350MB</p>
      <p className="text-center text-xs text-gray-400">
        Or drag and drop anywhere on the screen
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
