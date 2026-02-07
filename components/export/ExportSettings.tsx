"use client";

interface ExportSettingsProps {
  quality: "fast" | "balanced" | "high";
  onQualityChange: (q: "fast" | "balanced" | "high") => void;
}

const OPTIONS = [
  {
    id: "fast" as const,
    label: "Fast",
    desc: "Lower bitrate, smaller file, faster",
  },
  {
    id: "balanced" as const,
    label: "Balanced",
    desc: "Good quality/file size balance.",
  },
  {
    id: "high" as const,
    label: "High Quality",
    desc: "Higher bitrate, larger file, best quality, slowest.",
  },
];

export function ExportSettings({ quality, onQualityChange }: ExportSettingsProps) {
  return (
    <div className="mb-4 space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Compression Quality
      </h3>
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onQualityChange(opt.id)}
          className={`flex w-full flex-col rounded-lg border p-3 text-left ${
            quality === opt.id
              ? "border-primary bg-blue-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span className="font-medium">{opt.label}</span>
          <span className="text-sm text-gray-500">{opt.desc}</span>
        </button>
      ))}
    </div>
  );
}
