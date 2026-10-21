import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import ReactReconciler from "react-reconciler";

import type { SkCanvas, Skia } from "../skia/types";
import { NodeType } from "../dom/types";

import { debug, sksgHostConfig } from "./HostConfig";
import type { Container } from "./StaticContainer";
import { createContainer } from "./Container";

import "./Elements";

const skiaReconciler = ReactReconciler(sksgHostConfig);

// @ts-expect-error DefinitelyTyped is not up to date
skiaReconciler.injectIntoDevTools();

type ErrorCallback = (error: unknown) => void;

// @types/react-reconciler 0.31 still declares React 18's createContainer.
// The 0.31 runtime takes onUncaughtError, onCaughtError and onRecoverableError.
const createRoot = skiaReconciler.createContainer as unknown as (
  containerInfo: Container,
  tag: number,
  hydrationCallbacks: null,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null,
  identifierPrefix: string,
  onUncaughtError: ErrorCallback,
  onCaughtError: ErrorCallback,
  onRecoverableError: ErrorCallback,
  transitionCallbacks: null
) => OpaqueRoot;

export class SkiaSGRoot {
  private root: OpaqueRoot;
  private container: Container;

  constructor(
    public Skia: Skia,
    nativeId = -1
  ) {
    const strictMode = false;
    this.container = createContainer(Skia, nativeId);
    this.root = createRoot(
      this.container,
      0,
      null,
      strictMode,
      null,
      "",
      console.error,
      console.error,
      console.error,
      null
    );
  }

  get sg() {
    const children = this.container.root;
    return { type: NodeType.Group, props: {}, children };
  }

  private updateContainer(element: ReactNode) {
    return new Promise((resolve) => {
      skiaReconciler.updateContainer(element, this.root, null, () => {
        resolve(true);
      });
    });
  }

  /**
   * Commits the element. The container records the scene graph at the end
   * of every commit (resetAfterCommit), this one included: React runs the
   * commit effects whenever the root carries one, and the completion
   * callback updateContainer() is given is one, so an element React bails
   * out on (the same one again) is recorded too.
   */
  async render(element: ReactNode) {
    this.container.mount();
    await this.updateContainer(element);
  }

  drawOnCanvas(canvas: SkCanvas) {
    this.container.drawOnCanvas(canvas);
  }

  /** See Container.readSharedValues(). */
  readSharedValues() {
    this.container.readSharedValues();
  }

  getPicture() {
    const recorder = this.Skia.PictureRecorder();
    const canvas = recorder.beginRecording();
    this.drawOnCanvas(canvas);
    const picture = recorder.finishRecordingAsPicture();
    recorder.dispose();
    return picture;
  }

  unmount() {
    this.container.unmount();
    return new Promise((resolve) => {
      skiaReconciler.updateContainer(null, this.root, null, () => {
        debug("unmountContainer");
        resolve(true);
      });
    });
  }
}
