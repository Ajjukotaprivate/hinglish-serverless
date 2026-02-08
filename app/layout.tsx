import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { EditorProvider } from "@/components/providers/EditorProvider";

export const metadata: Metadata = {
  title: "Hinglish Subtitle Editor",
  description: "Viral Subtitle Editor / Hinglish Caption Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Suspense fallback={null}>
          <EditorProvider>{children}</EditorProvider>
        </Suspense>
      </body>
    </html>
  );
}
