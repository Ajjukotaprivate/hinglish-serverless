"use client";

import { useEditorStore } from "@/lib/store";

interface Preset {
  id: string;
  name: string;
}

interface StylePresetsProps {
  presets: Preset[];
}

const PRESET_STYLES: Record<
  string,
  Partial<import("@/lib/types").SubtitleStyle>
> = {
  mozi: { fontFamily: "Bebas Neue", fontSize: 120, outlineColor: "#facc15" },
  viral: {
    fontFamily: "Impact",
    fontSize: 140,
    textColor: "#ffffff",
    outlineColor: "#000000",
    outlineWidth: 6,
  },
  mrbeast: {
    fontFamily: "Arial Black",
    fontSize: 130,
    textColor: "#ffff00",
    outlineColor: "#000000",
    outlineWidth: 4,
  },
  cinema: {
    fontFamily: "Georgia",
    fontSize: 48,
    textColor: "#ffffff",
    outlineEnabled: false,
    allCaps: false,
  },
  chrissy: {
    fontFamily: "Comic Sans MS",
    fontSize: 100,
    textColor: "#ff69b4",
    outlineColor: "#ffffff",
    outlineWidth: 2,
  },
};

export function StylePresets({ presets }: StylePresetsProps) {
  const { setSubtitleStyle } = useEditorStore();

  const applyPreset = (presetId: string) => {
    const style = PRESET_STYLES[presetId];
    if (style) {
      setSubtitleStyle(style);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => applyPreset(preset.id)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
