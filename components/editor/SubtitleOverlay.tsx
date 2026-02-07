"use client";

import { useEditorStore } from "@/lib/store";

export function SubtitleOverlay() {
  const { segments, playhead, subtitleStyle } = useEditorStore();

  const currentSegment = segments.find(
    (s) => playhead >= s.start && playhead <= s.end
  );

  if (!currentSegment) return null;

  const text = subtitleStyle.allCaps
    ? currentSegment.text.toUpperCase()
    : currentSegment.text;

  const alignment =
    subtitleStyle.alignment === "left"
      ? "text-left"
      : subtitleStyle.alignment === "right"
      ? "text-right"
      : "text-center";

  return (
    <div
      className={`pointer-events-none absolute bottom-20 left-1/2 z-10 w-[85%] -translate-x-1/2 px-6 py-3 ${alignment}`}
      style={{
        fontFamily: subtitleStyle.fontFamily,
        fontSize: Math.min(subtitleStyle.fontSize, 72),
        color: subtitleStyle.textColor,
        opacity: subtitleStyle.textOpacity / 100,
        textShadow: subtitleStyle.outlineEnabled
          ? `-${subtitleStyle.outlineWidth}px -${subtitleStyle.outlineWidth}px 0 ${subtitleStyle.outlineColor},
           ${subtitleStyle.outlineWidth}px -${subtitleStyle.outlineWidth}px 0 ${subtitleStyle.outlineColor},
           -${subtitleStyle.outlineWidth}px ${subtitleStyle.outlineWidth}px 0 ${subtitleStyle.outlineColor},
           ${subtitleStyle.outlineWidth}px ${subtitleStyle.outlineWidth}px 0 ${subtitleStyle.outlineColor}`
          : "none",
        backgroundColor:
          subtitleStyle.backgroundOpacity > 0
            ? `${subtitleStyle.backgroundColor}${Math.round(
                (subtitleStyle.backgroundOpacity / 100) * 255
              )
                .toString(16)
                .padStart(2, "0")}`
            : "transparent",
      }}
    >
      <span className="font-bold leading-relaxed">{text}</span>
    </div>
  );
}
