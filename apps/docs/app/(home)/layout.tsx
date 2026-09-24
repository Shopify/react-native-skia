import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";

import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[{ text: "Docs", url: "/docs/getting-started/installation" }]}
    >
      {children}
    </HomeLayout>
  );
}
