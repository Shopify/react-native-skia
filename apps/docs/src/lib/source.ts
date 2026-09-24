import { loader } from "fumadocs-core/source";

import { docs } from "collections/server";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  pageTree: {
    transformers: [
      {
        // Use the (shorter) `sidebarLabel` frontmatter in the sidebar.
        file(node, filePath) {
          const file = filePath ? this.storage.read(filePath) : undefined;
          if (file?.format === "page") {
            const { sidebarLabel } = file.data as { sidebarLabel?: string };
            if (sidebarLabel) {
              return { ...node, name: sidebarLabel };
            }
          }
          return node;
        },
      },
    ],
  },
});
