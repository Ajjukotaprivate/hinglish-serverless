"use client";

import { useEditorStore } from "@/lib/store";
import { PlaybackControls } from "@/components/timeline/PlaybackControls";
import { VideoTrack } from "@/components/timeline/VideoTrack";
import { SubtitleTrack } from "@/components/timeline/SubtitleTrack";
import { TimeRuler } from "@/components/timeline/TimeRuler";

export function Timeline() {
  const { videoDuration, segments } = useEditorStore();

  return (
    <div className="flex h-48 flex-col border-t border-gray-200 bg-white">
      <TimeRuler duration={videoDuration} />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <VideoTrack />
        <SubtitleTrack segments={segments} />
      </div>
      <PlaybackControls />
    </div>
  );
}
