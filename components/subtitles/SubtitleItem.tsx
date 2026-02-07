"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/store";
import type { SubtitleSegment } from "@/lib/types";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}

interface SubtitleItemProps {
  segment: SubtitleSegment;
  index: number;
}

export function SubtitleItem({ segment, index }: SubtitleItemProps) {
  const { selectedSegmentId, setSelectedSegment, updateSegment, deleteSegment, setPlayhead } =
    useEditorStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(segment.text);

  const isSelected = selectedSegmentId === segment.id;

  const handleSave = () => {
    if (editText !== segment.text) {
      updateSegment(segment.id, { text: editText });
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-lg border p-3 ${
        isSelected ? "border-primary bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">#{index}</span>
        <span className="text-xs text-gray-500">
          {formatTime(segment.start)} → {formatTime(segment.end)}
        </span>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-primary px-2 py-1 text-xs text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditText(segment.text);
                setIsEditing(false);
              }}
              className="rounded border border-gray-300 px-2 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p
          className="cursor-pointer text-sm"
          onClick={() => {
            setSelectedSegment(segment.id);
            setPlayhead(segment.start);
          }}
          onDoubleClick={() => setIsEditing(true)}
        >
          {segment.text}
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setPlayhead(segment.start)}
          className="text-xs text-primary hover:underline"
        >
          Go to
        </button>
        <button
          type="button"
          onClick={() => deleteSegment(segment.id)}
          className="text-xs text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
