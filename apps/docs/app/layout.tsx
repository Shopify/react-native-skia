import "./global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import DocsSearchDialog from "@/components/search";
import { basePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: {
    template: "%s | React Native Skia",
    default: "React Native Skia",
  },
  description: "High Performance 2D Graphics for React Native",
  icons: `${basePath}/img/favicon.ico`,
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider search={{ SearchDialog: DocsSearchDialog }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
