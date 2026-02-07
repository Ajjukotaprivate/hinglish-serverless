"use client";

import type { SubtitleStyle } from "@/lib/types";

interface TypographyControlsProps {
  style: SubtitleStyle;
  onChange: (updates: Partial<SubtitleStyle>) => void;
}

const FONTS = ["Bebas Neue", "Impact", "Arial Black", "Roboto", "Georgia", "Comic Sans MS"];

export function TypographyControls({ style, onChange }: TypographyControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">TYPOGRAPHY</h3>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Font Family
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {FONTS.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Font Size
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="24"
            max="200"
            value={style.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value, 10) })}
            className="flex-1"
          />
          <span className="w-14 text-sm">{style.fontSize}px</span>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Alignment
        </label>
        <div className="flex gap-2">
          {(["left", "center", "right"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onChange({ alignment: align })}
              className={`flex-1 rounded border px-3 py-2 text-xs capitalize ${
                style.alignment === align
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-gray-300 bg-white text-gray-600"
              }`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500">All Caps</label>
        <button
          type="button"
          onClick={() => onChange({ allCaps: !style.allCaps })}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            style.allCaps ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
              style.allCaps ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
