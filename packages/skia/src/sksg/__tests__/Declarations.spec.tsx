/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";

import type { SkColorFilter } from "./MockDeclaration";
import {
  compose,
  DeclarationContext,
  DeclarationType,
} from "./MockDeclaration";

const makeSRGBToLinearGammaColorFilter = () => ({
  type: DeclarationType.ColorFilter as const,
  tag: "SRGBToLinearGamma",
});

const makeBlendColorFilter = () => ({
  type: DeclarationType.ColorFilter as const,
  tag: "Blend",
});

const makeMatrixColorFilter = () => ({
  type: DeclarationType.ColorFilter as const,
  tag: "Matrix",
});

const makeLerpColorFilter = (children: SkColorFilter[]) => ({
  type: DeclarationType.ColorFilter as const,
  tag: `Lerp(0.5, ${children[0].tag}, ${children[1].tag})`,
});

const composeColorFilters = (
  ctx: DeclarationContext,
  node: Node<any>,
  cf: SkColorFilter
) => {
  ctx.save();
  node.children.forEach((child) => processContext(ctx, child));
  const cf1 = ctx.colorFilters.popAllAsOne();
  ctx.restore();
  ctx.colorFilters.push(cf1 ? compose(cf, cf1) : cf);
};

const processContext = (ctx: DeclarationContext, node: Node<any>) => {
  switch (node.type) {
    case NodeType.Group:
      node.children.forEach((child) => processContext(ctx, child));
      break;
    case NodeType.SRGBToLinearGammaColorFilter: {
      const cf = makeSRGBToLinearGammaColorFilter();
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.BlendColorFilter: {
      const cf = makeBlendColorFilter();
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.MatrixColorFilter: {
      const cf = makeMatrixColorFilter();
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.LerpColorFilter: {
      node.children.forEach((child) => processContext(ctx, child));
      const cf = makeLerpColorFilter(ctx.colorFilters.popAll());
      ctx.colorFilters.push(cf);
      break;
    }
  }
};

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
    const ctx = new DeclarationContext();
    processContext(ctx, tree);
    const cf = ctx.colorFilters.popAllAsOne();
    expect(cf).toBeDefined();
    expect(cf!.tag).toBe("Compose(SRGBToLinearGamma, Blend)");
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

    const ctx = new DeclarationContext();
    processContext(ctx, tree);
    const cf = ctx.colorFilters.popAllAsOne();
    expect(cf).toBeDefined();
    expect(cf!.tag).toBe("Lerp(0.5, Matrix, Matrix)");
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

    const ctx = new DeclarationContext();
    processContext(ctx, tree);
    const cf = ctx.colorFilters.popAllAsOne();
    expect(cf).toBeDefined();
    expect(cf!.tag).toBe(
      "Compose(Matrix, Compose(SRGBToLinearGamma, Lerp(0.5, Matrix, Matrix)))"
    );
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
    const ctx = new DeclarationContext();
    processContext(ctx, tree);
    const cf = ctx.colorFilters.popAllAsOne();
    expect(cf).toBeDefined();
    expect(cf!.tag).toBe("Compose(Matrix, Matrix)");
  });
});
