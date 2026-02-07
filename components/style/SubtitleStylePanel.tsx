"use client";

import { useEditorStore } from "@/lib/store";
import { StylePresets } from "./StylePresets";
import { TypographyControls } from "./TypographyControls";
import { ColorControls } from "./ColorControls";

const STYLE_PRESETS = [
  { id: "mozi", name: "MOZI STYLE" },
  { id: "viral", name: "VIRAL" },
  { id: "mrbeast", name: "MR.BE@ST" },
  { id: "cinema", name: "CINEMA" },
  { id: "chrissy", name: "Chrissy" },
];

export function SubtitleStylePanel() {
  const { subtitleStyle, setSubtitleStyle } = useEditorStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          STYLE PRESETS
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          Choose from our curated collection.
        </p>
        <StylePresets presets={STYLE_PRESETS} />
      </div>
      <TypographyControls style={subtitleStyle} onChange={setSubtitleStyle} />
      <ColorControls style={subtitleStyle} onChange={setSubtitleStyle} />
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-500">
          Animation Type
        </label>
        <select
          value={subtitleStyle.animation}
          onChange={(e) =>
            setSubtitleStyle({
              animation: e.target.value as typeof subtitleStyle.animation,
            })
          }
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="none">No Animation</option>
          <option value="pop">Pop</option>
          <option value="bounce">Bounce</option>
          <option value="slide">Slide</option>
          <option value="fade">Fade</option>
        </select>
      </div>
    </div>
  );
}
