import type { ComponentType } from "react";

// Examples rendered live in the docs with <LiveExample name="..." />.
// Their source is shown next to them with
// <include cwd meta="twoslash">src/examples/File.tsx</include>
// so the code on the page is exactly the code that runs.
export const examples = {
  "hello-world": () => import("./HelloWorld"),
} satisfies Record<string, () => Promise<{ default: ComponentType }>>;

export type ExampleName = keyof typeof examples;
