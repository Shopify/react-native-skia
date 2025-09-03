/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */


import type {RNPackageContext, RNPackage} from '@rnoh/react-native-openharmony/ts';
import {RNSkiaPackage} from '@react-native-ohos/react-native-skia/ts';
import { ReanimatedPackage } from '@react-native-ohos/react-native-reanimated/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new RNSkiaPackage(ctx),
    new ReanimatedPackage(ctx),
  ];
}
