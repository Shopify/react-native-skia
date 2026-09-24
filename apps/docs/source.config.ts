import { resolve } from "node:path";

import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { pageSchema } from "fumadocs-core/source/schema";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import { createFileSystemTypesCache } from "fumadocs-twoslash/cache-fs";
import { z } from "zod";

// Snippets marked with `twoslash` are type-checked against the sources of
// @shopify/react-native-skia at build time: a type error fails the build.
const skiaSrc = resolve("../../packages/skia/src");

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      // Shorter label for the sidebar when the page title is too long.
      sidebarLabel: z.string().optional(),
    }),
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          typesCache: createFileSystemTypesCache(),
          twoslashOptions: {
            compilerOptions: {
              target: 99 /* ESNext */,
              module: 99 /* ESNext */,
              moduleResolution: 100 /* Bundler */,
              jsx: 4 /* react-jsx */,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
              resolveJsonModule: true,
              skipLibCheck: true,
              strict: true,
              // Passed programmatically, `lib` needs full file names.
              lib: ["lib.dom.d.ts", "lib.esnext.d.ts"],
              customConditions: ["react-native"],
              baseUrl: resolve("."),
              paths: {
                "@shopify/react-native-skia": [`${skiaSrc}/index.ts`],
                "@shopify/react-native-skia/lib/module/*": [`${skiaSrc}/*`],
                "@shopify/react-native-skia/lib/commonjs/*": [`${skiaSrc}/*`],
              },
            },
          },
        }),
      ],
    },
  },
});
