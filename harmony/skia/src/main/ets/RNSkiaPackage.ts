/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import {
  RNPackage, TurboModulesFactory } from '@rnoh/react-native-openharmony/ts';
import type { TurboModule, TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { RNSkiaModule } from './RNSkiaModule';

class RNSkiaTurboModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === 'RNSkiaModule') {
      return new RNSkiaModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === "RNSkiaModule"
  }
}

export class RNSkiaPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new RNSkiaTurboModulesFactory(ctx);
  }
}