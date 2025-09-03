/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import {
  ComponentBuilderContext,
  CustomRNComponentFrameNodeFactory,
  Descriptor,
  DisplayMode,
  RNComponentContext,
  RNOHContext,
  RNOHError,
  RNOHLogger,

  ViewBaseProps,
  ViewDescriptorWrapper,
  ViewDescriptorWrapperBase,
  ViewRawProps,

  SurfaceHandle,
  SurfaceProps,

} from '@rnoh/react-native-openharmony';

import { I18nManagerTurboModule } from '@rnoh/react-native-openharmony/src/main/ets/RNOHCorePackage/turboModules/I18nManagerTurboModule';

interface SkiaDomViewState {}

export type SkiaDomDescriptor = Descriptor<"SkiaDomView", ViewBaseProps, SkiaDomViewState, ViewRawProps>;

export interface SkiaSurfaceConfig {}

export interface SkiaSurfaceConfig1 extends SkiaSurfaceConfig {
  surfaceHandle: SurfaceHandle
}

export interface SkiaSurfaceConfig2 extends SkiaSurfaceConfig {
  appKey: string,
  initialProps: SurfaceProps,
}

/**
 * @api: RN_APP_DEVELOPER
 */
@Component
export struct SkiaDomSurface {
  public static readonly NAME = "SkiaDomView"
  /**
   * Required.
   */
  public ctx!: RNOHContext | RNComponentContext;
  /**
   * Required
   */
  public surfaceConfig!: SkiaSurfaceConfig;
  /**
   * Required if ctx isn't RNComponentContext
   * @deprecated: provide RNComponentContext to SkiaDomSurface::ctx instead
   */
  @BuilderParam buildCustomComponent: (ctx: ComponentBuilderContext) => void;
  // -------------------------------------------------------------------------------------------------------------------
  private surfaceWidth: number = 0;
  private surfaceHeight: number = 0;
  private surfaceOffsetX: number = 0;
  private surfaceOffsetY: number = 0;
  @State private descriptor: SkiaDomDescriptor = Object() as SkiaDomDescriptor;
  @State private descriptorWrapper: ViewDescriptorWrapperBase | undefined = undefined
  @State private shouldStartSurface: boolean = false;
  private surfaceHandle!: SurfaceHandle;
  private cleanUpCallbacks: (() => void)[] = [];
  private shouldStopSurface: boolean = false;
  private initialProps!: SurfaceProps;
  private logger!: RNOHLogger

  aboutToAppear() {
    this.logger = this.ctx.logger.clone("SkiaDomSurface")
    console.log('liwang------------------->SkiaDomSurface init')
    if (!(this.ctx instanceof RNComponentContext)) {
      this.logger.error(new RNOHError({
        whatHappened: "SkiaDomSurface received RNOHContext instead of RNComponentContext. Custom RN components won't be visible.",
        howCanItBeFixed: ["Provide RNComponentContext instead of RNOHContext"]
      }))
    }
    const stopTracing = this.logger.clone("aboutToAppear").startTracing()
    this.ctx.rnInstance.setFrameNodeFactory(new CustomRNComponentFrameNodeFactory(this.getUIContext(), this.ctx.logger,
      () => {
        return this.ctx as RNComponentContext
      }))
    if (Object.keys(this.surfaceConfig).includes("surfaceHandle")) {
      this.surfaceHandle = (this.surfaceConfig as SkiaSurfaceConfig1).surfaceHandle;
      this.surfaceHandle.setDisplayMode(DisplayMode.Visible);
    } else {
      this.surfaceHandle = this.ctx.rnInstance.createSurface((this.surfaceConfig as SkiaSurfaceConfig2).appKey);
      this.initialProps = (this.surfaceConfig as SkiaSurfaceConfig2).initialProps;
      this.shouldStartSurface = true;
      this.shouldStopSurface = true;
    }
    const tag = this.surfaceHandle.getTag();
    this.onUpdateComponent(this.ctx.rnInstance.descriptorRegistry.getDescriptor(tag))
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
      tag,
      (newDescriptor) => this.onUpdateComponent(newDescriptor)
    ))
    stopTracing()
  }

  aboutToDisappear() {
    const stopTracing = this.logger.clone("aboutToDisappear").startTracing()
    this.cleanUpCallbacks.forEach(cb => cb())
    if (this.shouldStopSurface) {
      if (!this.surfaceHandle.isDestroyed()) {
        // NOTE: when the app is stopping, it's possible the ability cleaned up the surface
        // before us. This is fine.
        this.surfaceHandle.stop();
        this.surfaceHandle.destroy();
      }
    } else if (this.surfaceHandle.getDisplayMode() === DisplayMode.Visible) {
      this.surfaceHandle.setDisplayMode(DisplayMode.Suspended);
    }
    stopTracing()
  }

  onUpdateComponent(newDescriptor: Descriptor) {
    this.descriptor = newDescriptor as SkiaDomDescriptor
    this.descriptorWrapper = new ViewDescriptorWrapper(newDescriptor)
  }

  handleAreaChange(_oldValue: Area, newValue: Area) {
    const stopTracing = this.logger.clone("handleAreaChange").startTracing()
    this.surfaceWidth = newValue.width as number
    this.surfaceHeight = newValue.height as number
    this.surfaceOffsetX = newValue.globalPosition.x as number
    this.surfaceOffsetY = newValue.globalPosition.y as number
    this.updateSurfaceConstraints()
    stopTracing()
  }

  updateSurfaceConstraints() {
    let isRTL = this.ctx.rnInstance.getTurboModule<I18nManagerTurboModule>('I18nManager').getConstants().isRTL;

    if (this.shouldStartSurface) {
      this.surfaceHandle.setDisplayMode(DisplayMode.Visible)
      this.surfaceHandle.start(
        {
          width: this.surfaceWidth,
          height: this.surfaceHeight,
          surfaceOffsetX: this.surfaceOffsetX,
          surfaceOffsetY: this.surfaceOffsetY,
          pixelRatio: vp2px(1),
          isRTL,
        },
        this.initialProps)
      this.shouldStartSurface = false
    } else {
      this.surfaceHandle.updateConstraints({
        width: this.surfaceWidth,
        height: this.surfaceHeight,
        surfaceOffsetX: this.surfaceOffsetX,
        surfaceOffsetY: this.surfaceOffsetY,
        pixelRatio: vp2px(1),
        isRTL,
      });
    }
  }

  handleTouch(event: TouchEvent) {
    if (this.ctx.rnInstance.getArchitecture() === "ARK_TS") {
      this.logger.clone("handleTouch").debug()
    }
  }

  build() {
    Stack() {
      XComponent({
        id: this.ctx.rnInstance.getId() + "_" + this.surfaceHandle.getTag(),
        type: "surface",
        libraryname: 'rnoh_skia'
      })
      .width("100%")
      .height("100%")
    }
    .width("100%")
    .height("100%")
    .onAreaChange((oldArea, newArea) => this.handleAreaChange(oldArea, newArea))
    .onTouch((e) => this.handleTouch(e))
  }
}
