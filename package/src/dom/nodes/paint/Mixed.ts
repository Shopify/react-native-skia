import type { BlendProps } from "../../types/ImageFilters";
import type { SkShader, SkImageFilter, Skia } from "../../../skia/types";
import { BlendMode } from "../../../skia/types";
import { DeclarationType, NodeType } from "../../types/NodeType";
import { JsiDeclarationNode } from "../Node";
import type { Node } from "../../types";
import { enumKey } from "../datatypes";

import { ImageFilterDeclaration } from "./ImageFilters";
import { ShaderDeclaration } from "./Shaders";

export class BlendNode extends JsiDeclarationNode<
  BlendProps,
  SkShader | SkImageFilter
> {
  constructor(Skia: Skia, props: BlendProps) {
    super(Skia, DeclarationType.ImageFilter, NodeType.Blend, props);
  }

  private checkChild(
    child: ImageFilterDeclaration<unknown> | ShaderDeclaration<unknown>
  ) {
    if (this._children.length > 0) {
      if (child.declarationType === DeclarationType.ImageFilter) {
        this.declarationType = DeclarationType.ImageFilter;
      } else {
        this.declarationType = DeclarationType.Shader;
      }
    }
  }

  addChild(child: Node<unknown>) {
    if (
      !(child instanceof JsiDeclarationNode) ||
      (child.declarationType !== DeclarationType.Shader &&
        child.declarationType !== DeclarationType.ImageFilter)
    ) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    this.checkChild(child);
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (
      !(child instanceof ImageFilterDeclaration) ||
      !(child instanceof ShaderDeclaration)
    ) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    this.checkChild(child);
    super.insertChildBefore(child, before);
  }

  get() {
    const { Skia } = this;
    const blend = BlendMode[enumKey(this.props.mode)];
    if (this.declarationType === DeclarationType.ImageFilter) {
      return (
        this._children as ImageFilterDeclaration<unknown>[]
      ).reduce<SkImageFilter | null>((inner, outer) => {
        if (inner === null) {
          return outer.get();
        }
        return Skia.ImageFilter.MakeBlend(blend, outer.get(), inner);
      }, null) as SkImageFilter;
    } else {
      return (
        this._children as ShaderDeclaration<unknown>[]
      ).reduce<SkShader | null>((inner, outer) => {
        if (inner === null) {
          return outer.get();
        }
        return Skia.Shader.MakeBlend(blend, outer.get(), inner);
      }, null) as SkShader;
    }
  }
}
