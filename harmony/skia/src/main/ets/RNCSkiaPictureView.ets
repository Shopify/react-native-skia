/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import {
  Descriptor,
  RNOHContext,
  ViewBaseProps,
  RNViewBase,
  ViewRawProps
} from '@rnoh/react-native-openharmony'
import { SkiaDomView } from './view/SkiaDomView';
import Logger from './Logger';

export interface SkiaPictureViewState {}

export interface SkiaPictureViewProps extends ViewRawProps {
  mode: string
  debug: boolean
}

export const SKIA_PICTURE_VIEW_TYPE: string = "SkiaPictureView";

export type SkiaPictureViewDescriptor = Descriptor<"SkiaPictureView", ViewBaseProps, SkiaPictureViewState, SkiaPictureViewProps>

const TAG: string = 'RNOH in SkiaPictureView'

@Component
export struct RNCSkiaPictureView {
  ctx!: RNOHContext;
  tag: number = -1;
  @State descriptor: SkiaPictureViewDescriptor = {} as SkiaPictureViewDescriptor;
  private callbackList: Array<() => void> = []
  @Provide('mode') mode: string = "";
  @Provide('debug') debug: boolean = false;
  @State nativeID: number = 0;
  @State viewWidth: number = 0;
  @State viewHeight: number = 0;

  aboutToAppear(): void {
    this.descriptor = this.ctx.descriptorRegistry.getDescriptor<SkiaPictureViewDescriptor>(this.tag);
    Logger.debug(TAG, `descriptor rawProps, ${JSON.stringify(this.descriptor.rawProps)}`);
    Logger.debug(TAG, `descriptor layoutMetrics, ${JSON.stringify(this.descriptor.layoutMetrics)}`);
    this.callbackList.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (newDescriptor) => {
        this.descriptor = (newDescriptor as SkiaPictureViewDescriptor);

        /*------ 当RN侧属性有更改 -------*/
        Logger.debug(TAG, `newDescriptor rawProps, ${JSON.stringify(this.descriptor.rawProps)}`);
        this.updatePropFromDesc();

      }
    ));

    /*------ 初始化 -------*/
    this.updatePropFromDesc();
    this.registerCommandCallback();
  }

  aboutToDisappear(): void {
    this.cancellationCallback()
  }

  registerCommandCallback(): void {
    if (this.ctx) {
      this.callbackList.push(this.ctx.componentCommandReceiver.registerCommandCallback(
        this.tag,
        (command, args: (string | number)[]) => {
          Logger.debug(TAG, `registerCommandCallback,  ${JSON.stringify(args)}`);
        }))
    }
  }

  /* 更新属性变更  */
  updatePropFromDesc(): void {
    this.mode = this.descriptor.rawProps.mode
    this.debug = this.descriptor.rawProps.debug
    this.nativeID = Number.parseInt(this.descriptor.rawProps.nativeID ? this.descriptor.rawProps.nativeID : '0');
    this.viewWidth = this.descriptor.layoutMetrics.frame.size.width
    this.viewHeight = this.descriptor.layoutMetrics.frame.size.height
  }

  cancellationCallback() {
    this.callbackList.forEach(
      callback => {
        callback?.()
      }
    )
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      SkiaDomView({ nativeID: this.nativeID, viewWidth: this.viewWidth, viewHeight: this.viewHeight })
        .align(Alignment.Center)
        .height(this.viewHeight)
        .width(this.viewWidth)
    }
  }
}