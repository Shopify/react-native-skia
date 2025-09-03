/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { BusinessError } from '@kit.BasicServicesKit';
import { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import fs from '@ohos.file.fs';
import { componentSnapshot } from '@kit.ArkUI';
import { image } from '@kit.ImageKit';
import testNapi from 'librnoh_skia.so';


type Options = {
  width?: number,
  height?: number,
  stride: number,
  pixelFormat: number,
  alphaType: number,
};

export class RNSkiaModule extends TurboModule {
  public static readonly NAME = 'RNSkiaModule';

  options: Options | null = null;

  public TagGetView(tag: number): void {
    try {
      let id = JSON.parse(JSON.stringify(this.ctx.rnInstance.getNativeNodeIdByTag(tag)));
      if (typeof id === "object") {
        id = id.ok
      }
      let pixelmap = componentSnapshot.getSync(id);
      let originImageInfo = pixelmap.getImageInfoSync();
      let dstX = originImageInfo.size.width;
      let dstY = originImageInfo.size.height;
      this.options = {
        width: dstX,
        height: dstY,
        stride: originImageInfo.stride,
        pixelFormat: originImageInfo.pixelFormat,
        alphaType: originImageInfo.alphaType,
      };
      testNapi.TagGetView_s(dstX,dstY,originImageInfo.stride,originImageInfo.pixelFormat,originImageInfo.alphaType,pixelmap);
    } catch (error) {
      console.error("Error occurred while calling getSync:", error);
      return;
    }
  }
}

