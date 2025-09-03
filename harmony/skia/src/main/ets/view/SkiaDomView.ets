/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import XComponentContext from '../XComponentContext';
import { display } from '@kit.ArkUI';
import Logger from '../Logger';

const TAG: string = 'SkiaDomView'
const X_COMPONENT_ID = 'SkiaDomView';

@Component
export struct SkiaDomView {
  private xComponentController: XComponentController = new XComponentController();
  private xComponentContext: XComponentContext | undefined = undefined;
  viewWidth: number = 0;
  viewHeight: number = 0;
  nativeID: number = 0;
  xComponentId: string = '';
  mode: string = 'default';
  debug: boolean = true;

  aboutToAppear(): void {
    this.xComponentId = X_COMPONENT_ID + '_' + this.nativeID;
    display.getAllDisplays((error, display) => {
      Logger.debug(TAG, 'aboutToAppear getAllDisplays' + JSON.stringify(display));
    });
  }

  aboutToDisappear(): void {
    Logger.debug(TAG, 'aboutToDisappear nativeID: ' + this.nativeID);
    this.xComponentContext?.unregisterView(X_COMPONENT_ID + "_" + this.nativeID, this.nativeID);
  }

  build() {
    XComponent({
      id: X_COMPONENT_ID + "_" + this.nativeID,
      type: XComponentType.SURFACE,
      libraryname: "rnoh_skia",
      controller: this.xComponentController
    })
      .onLoad((xComponentContext) => {
        this.xComponentContext = xComponentContext as XComponentContext;
        Logger.debug(TAG, 'XComponent onLoad nativeID=' + this.nativeID);
        this.xComponentContext?.registerView(X_COMPONENT_ID + "_" + this.nativeID, this.nativeID);
        this.xComponentContext?.setModeAndDebug(this.xComponentId, this.mode, this.debug);
      })
      .onSizeChange((oldValue: SizeOptions, newValue: SizeOptions) => {
        Logger.debug(TAG,
          'XComponent onSizeChange oldValue=' + JSON.stringify(oldValue) + ", newValue=" + JSON.stringify(newValue));
        let width = newValue.width?.valueOf() as number;
        let height = newValue.height?.valueOf() as number;
        this.xComponentContext?.onSurfaceSizeChanged(X_COMPONENT_ID + "_" + this.nativeID, this.nativeID, width, height);
      })
      .backgroundColor(Color.Transparent)
      .width(this.viewWidth)
      .height(this.viewHeight);
  }
}