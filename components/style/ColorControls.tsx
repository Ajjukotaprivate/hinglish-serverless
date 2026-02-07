"use client";

import type { SubtitleStyle } from "@/lib/types";

interface ColorControlsProps {
  style: SubtitleStyle;
  onChange: (updates: Partial<SubtitleStyle>) => void;
}

export function ColorControls({ style, onChange }: ColorControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">COLORS</h3>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="h-8 w-12 cursor-pointer rounded border border-gray-300"
          />
          <span className="text-sm text-gray-600">{style.textColor}</span>
        </div>
        <div className="mt-2">
          <label className="text-xs text-gray-500">Opacity: {style.textOpacity}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={style.textOpacity}
            onChange={(e) =>
              onChange({ textOpacity: parseInt(e.target.value, 10) })
            }
            className="w-full"
          />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Background Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="h-8 w-12 cursor-pointer rounded border border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Opacity: {style.backgroundOpacity}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={style.backgroundOpacity}
          onChange={(e) =>
            onChange({ backgroundOpacity: parseInt(e.target.value, 10) })
          }
          className="mt-2 w-full"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-gray-500">
            Enable Outline
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({ outlineEnabled: !style.outlineEnabled })
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              style.outlineEnabled ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                style.outlineEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
        {style.outlineEnabled && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.outlineColor}
                onChange={(e) => onChange({ outlineColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border border-gray-300"
              />
              <span className="text-sm">{style.outlineColor}</span>
            </div>
            <div>
              <label className="text-xs">Thickness: {style.outlineWidth}px</label>
              <input
                type="range"
                min="1"
                max="12"
                value={style.outlineWidth}
                onChange={(e) =>
                  onChange({ outlineWidth: parseInt(e.target.value, 10) })
                }
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
