import defaultComponents from "fumadocs-ui/mdx";
import { Callout } from "fumadocs-ui/components/callout";
import * as Twoslash from "fumadocs-twoslash/ui";
import type { MDXComponents } from "mdx/types";

import { Img } from "@/components/Img";
import { LiveExample } from "@/components/live/LiveExample";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultComponents,
    ...Twoslash,
    Callout,
    Img,
    LiveExample,
    ...components,
  };
}
