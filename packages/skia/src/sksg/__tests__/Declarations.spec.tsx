/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";

enum DeclarationType {
  ColorFilter,
  ImageFilter,
}

interface SkImageFilter {
  type: DeclarationType.ImageFilter;
  tag: string;
}

interface SkColorFilter {
  type: DeclarationType.ColorFilter;
  tag: string;
}

interface DeclarationContext {
  colorFilter: SkColorFilter | null;
  imageFilter: SkImageFilter | null;
}

// const makeContext = (): DeclarationContext => ({
//   colorFilter: null,
//   imageFilter: null,
// });

function createSRGBToLinearGammaFilter(): DeclarationContext {
  return {
    colorFilter: {
      type: DeclarationType.ColorFilter,
      tag: "SRGBToLinearGamma",
    },
    imageFilter: null,
  };
}

function createBlendFilter(opts: {
  color: string;
  mode: string;
}): DeclarationContext {
  return {
    colorFilter: {
      type: DeclarationType.ColorFilter,
      tag: `Blend(${opts.color}, ${opts.mode})`,
    },
    imageFilter: null,
  };
}

function createMatrixFilter(_values: number[]): DeclarationContext {
  return {
    colorFilter: { type: DeclarationType.ColorFilter, tag: "Matrix()" },
    imageFilter: null,
  };
}

function createLerpFilter(
  t: number,
  c1: DeclarationContext,
  c2: DeclarationContext
): DeclarationContext {
  if (!c1.colorFilter || !c2.colorFilter) {
    throw new Error("LerpFilter requires valid color filters");
  }

  return {
    colorFilter: {
      type: DeclarationType.ColorFilter,
      tag: `Lerp(${t}, ${c1.colorFilter.tag}, ${c2.colorFilter.tag})`,
    },
    imageFilter: null,
  };
}

function compose(
  a: DeclarationContext,
  b: DeclarationContext
): DeclarationContext {
  if (!a.colorFilter || !b.colorFilter) {
    throw new Error("Cannot compose contexts without color filters");
  }

  return {
    colorFilter: {
      type: DeclarationType.ColorFilter,
      tag: `Compose(${a.colorFilter.tag}, ${b.colorFilter.tag})`,
    },
    imageFilter: null,
  };
}

const composeFilter = (node: Node<any>, base: DeclarationContext) => {
  const childContexts = node.children
    .map((child) => createFilterFromTree(child))
    .filter((ctx): ctx is DeclarationContext => ctx !== null);

  if (childContexts.length === 0) {
    return base;
  } else {
    return childContexts.reduce((acc, cur) => compose(acc, cur), base);
  }
};

export function createFilterFromTree(
  node: Node<any>
): DeclarationContext | null {
  if (!node.isDeclaration) {
    const childContexts = node.children
      .map((child) => createFilterFromTree(child))
      .filter((ctx): ctx is DeclarationContext => ctx !== null);

    if (childContexts.length === 0) {
      return null;
    }

    return childContexts.reduce((acc, cur) => compose(acc, cur));
  } else {
    switch (node.type) {
      case NodeType.SRGBToLinearGammaColorFilter: {
        const base = createSRGBToLinearGammaFilter();
        return composeFilter(node, base);
      }

      case NodeType.BlendColorFilter: {
        const { color, mode } = node.props;
        const base = createBlendFilter({ color, mode });
        return composeFilter(node, base);
      }

      case NodeType.MatrixColorFilter: {
        const { values } = node.props;
        const base = createMatrixFilter(values);
        return composeFilter(node, base);
      }

      case NodeType.LerpColorFilter: {
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
    expect(filter?.colorFilter).toEqual({
      tag: "Compose(SRGBToLinearGamma, Blend(lightblue, srcIn))",
      type: DeclarationType.ColorFilter,
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
    expect(filter?.colorFilter).toEqual({
      tag: "Lerp(0.5, Matrix(), Matrix())",
      type: DeclarationType.ColorFilter,
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
    expect(filter?.colorFilter).toEqual({
      tag: "Compose(Matrix(), Compose(SRGBToLinearGamma, Lerp(0.5, Matrix(), Matrix())))",
      type: DeclarationType.ColorFilter,
    });
  });

  it("should create a filter from a tree 4", () => {
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
          children: [
            {
              type: NodeType.MatrixColorFilter,
              isDeclaration: true,
              props: {
                value: [],
              },
              children: [],
            },
          ],
        },
      ],
    };
    const filter = createFilterFromTree(tree);
    expect(filter?.colorFilter).toEqual({
      tag: "Compose(Matrix(), Matrix())",
      type: DeclarationType.ColorFilter,
    });
  });
});
