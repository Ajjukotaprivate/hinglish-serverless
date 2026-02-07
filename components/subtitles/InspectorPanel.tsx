"use client";

import { useEditorStore } from "@/lib/store";

export function InspectorPanel() {
  const { selectedSegmentId, segments, aspectRatio } = useEditorStore();

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Inspector</h3>
      {selectedSegment ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Start Time
            </label>
            <p className="text-sm">{selectedSegment.start.toFixed(2)}s</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              End Time
            </label>
            <p className="text-sm">{selectedSegment.end.toFixed(2)}s</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">
              Duration
            </label>
            <p className="text-sm">
              {(selectedSegment.end - selectedSegment.start).toFixed(2)}s
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Select a subtitle or element to view its properties.
        </p>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-500">
          Aspect Ratio
        </label>
        <p className="text-sm">{aspectRatio}</p>
      </div>
    </div>
  );
}
