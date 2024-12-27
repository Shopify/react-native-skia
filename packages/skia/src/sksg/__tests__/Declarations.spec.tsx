/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";

interface Filter {
  tag: string;
}

function createSRGBToLinearGammaFilter(): Filter {
  return { tag: "SRGBToLinearGamma" };
}

function createBlendFilter(opts: { color: string; mode: string }): Filter {
  return { tag: `Blend(${opts.color}, ${opts.mode})` };
}

function createMatrixFilter(_values: number[]): Filter {
  return { tag: "Matrix()" };
}

function createLerpFilter(t: number, c1: Filter, c2: Filter): Filter {
  return { tag: `Lerp(${t}, ${c1.tag}, ${c2.tag})` };
}

// The function that composes two filters into one.
function compose(a: Filter, b: Filter): Filter {
  return { tag: `Compose(${a.tag}, ${b.tag})` };
}

export function createFilterFromTree(node: Node<any>): Filter | null {
  if (!node.isDeclaration) {
    //
    // 1. GROUP node logic
    //
    //    Gather all child filters and compose them together into a single filter.
    //    If there are no children, we return null (meaning no filter).
    //
    const childFilters = node.children
      .map((child) => createFilterFromTree(child))
      .filter((f): f is Filter => f !== null);

    if (childFilters.length === 0) {
      return null;
    }

    // Compose them all in a left-to-right fold
    return childFilters.reduce((acc, cur) => compose(acc, cur));
  } else {
    //
    // 2. DECLARATION node logic
    //
    //    Depending on the node.type, we need to create the filter differently.
    //    Some declarations take multiple children (like LerpColorFilter),
    //    some take exactly one child, some don’t need a child at all.
    //

    switch (node.type) {
      case NodeType.SRGBToLinearGammaColorFilter: {
        // e.g. SRGB->Linear filter that might have 0 or 1 child
        // If it has exactly one child, we can compose them.
        const childFilters = node.children
          .map((child) => createFilterFromTree(child))
          .filter((f): f is Filter => f !== null);

        // Base filter
        const base = createSRGBToLinearGammaFilter();

        // Compose with children if any
        if (childFilters.length === 0) {
          return base;
        } else {
          // Compose them all with the base
          return childFilters.reduce((acc, cur) => compose(acc, cur), base);
        }
      }

      case NodeType.BlendColorFilter: {
        // In your example, BlendColorFilter might not require children,
        // but if it did, we’d handle them similarly.
        // Otherwise, just create it directly:
        const { color, mode } = node.props;
        return createBlendFilter({ color, mode });
      }

      case NodeType.MatrixColorFilter: {
        // No children needed, just create
        const { values } = node.props;
        return createMatrixFilter(values);
      }

      case NodeType.LerpColorFilter: {
        // Lerp needs exactly 2 child filters
        // child 1 => c1
        // child 2 => c2
        // then we create a LERP filter out of c1, c2 and t
        if (node.children.length < 2) {
          throw new Error("LerpColorFilter requires exactly 2 children");
        }
        const c1 = createFilterFromTree(node.children[0]);
        const c2 = createFilterFromTree(node.children[1]);
        if (!c1 || !c2) {
          throw new Error("LerpColorFilter child is missing or invalid");
        }

        const { t } = node.props;
        return createLerpFilter(t, c1, c2);
      }

      default: {
        throw new Error(`Unknown declaration node type: ${node.type}`);
      }
    }
  }
}

describe("Declarations", () => {
  it("should create a filter from a tree 1", () => {
    const tree: Node = {
      type: NodeType.Group,
      isDeclaration: false,
      props: {},
      children: [
        {
          type: NodeType.SRGBToLinearGammaColorFilter,
          isDeclaration: true,
          props: {},
          children: [
            {
              type: NodeType.BlendColorFilter,
              isDeclaration: true,
              props: {
                color: "lightblue",
                mode: "srcIn",
              },
              children: [],
            },
          ],
        },
      ],
    };
    const filter = createFilterFromTree(tree);
    expect(filter).toEqual({
      tag: "Compose(SRGBToLinearGamma, Blend(lightblue, srcIn))",
    });
  });
  it("should create a filter from a tree 2", () => {
    const tree: Node = {
      type: NodeType.Group,
      isDeclaration: false,
      props: {},
      children: [
        {
          type: NodeType.LerpColorFilter,
          isDeclaration: true,
          props: {
            t: 0.5,
          },
          children: [
            {
              type: NodeType.MatrixColorFilter,
              isDeclaration: true,
              props: {
                values: [],
              },
              children: [],
            },
            {
              type: NodeType.MatrixColorFilter,
              isDeclaration: true,
              props: {
                values: [],
              },
              children: [],
            },
          ],
        },
      ],
    };
    const filter = createFilterFromTree(tree);
    expect(filter).toEqual({
      tag: "Lerp(0.5, Matrix(), Matrix())",
    });
  });

  it("should create a filter from a tree 3", () => {
    const tree: Node = {
      type: NodeType.Group,
      isDeclaration: false,
      props: {},
      children: [
        {
          type: NodeType.MatrixColorFilter,
          isDeclaration: true,
          props: {
            value: [],
          },
          children: [],
        },
        {
          type: NodeType.SRGBToLinearGammaColorFilter,
          isDeclaration: true,
          props: {},
          children: [
            {
              type: NodeType.LerpColorFilter,
              isDeclaration: true,
              props: {
                t: 0.5,
              },
              children: [
                {
                  type: NodeType.MatrixColorFilter,
                  isDeclaration: true,
                  props: {
                    values: [],
                  },
                  children: [],
                },
                {
                  type: NodeType.MatrixColorFilter,
                  isDeclaration: true,
                  props: {
                    values: [],
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
    const filter = createFilterFromTree(tree);
    expect(filter).toEqual({
      tag: "Compose(Matrix(), Compose(SRGBToLinearGamma, Lerp(0.5, Matrix(), Matrix())))",
    });
  });
});
