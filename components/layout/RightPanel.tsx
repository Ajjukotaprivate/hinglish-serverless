"use client";

import { useEditorStore } from "@/lib/store";
import { SubtitleList } from "@/components/subtitles/SubtitleList";
import { InspectorPanel } from "@/components/subtitles/InspectorPanel";
import { SubtitleStylePanel } from "@/components/style/SubtitleStylePanel";

export function RightPanel() {
  const { rightPanelTab, setRightPanelTab, leftNavActive } = useEditorStore();

  const mainTabLabel = leftNavActive === "style" ? "Subtitle Style" : "Subtitles";

  return (
    <aside className="flex w-80 flex-col border-l border-gray-200 bg-white">
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setRightPanelTab("subtitles")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            rightPanelTab === "subtitles"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {mainTabLabel}
        </button>
        <button
          type="button"
          onClick={() => setRightPanelTab("inspector")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            rightPanelTab === "inspector"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Inspector
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {rightPanelTab === "subtitles" && leftNavActive === "style" && (
          <SubtitleStylePanel />
        )}
        {rightPanelTab === "subtitles" && leftNavActive !== "style" && (
          <SubtitleList />
        )}
        {rightPanelTab === "inspector" && <InspectorPanel />}
      </div>
    </aside>
  );
}
