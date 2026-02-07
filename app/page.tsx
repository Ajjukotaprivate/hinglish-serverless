"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightPanel } from "@/components/layout/RightPanel";
import { Timeline } from "@/components/layout/Timeline";
import { VideoCanvas } from "@/components/editor/VideoCanvas";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden bg-gray-100">
          <div className="flex flex-1 items-center justify-center p-4">
            <VideoCanvas />
          </div>
          <Timeline />
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
