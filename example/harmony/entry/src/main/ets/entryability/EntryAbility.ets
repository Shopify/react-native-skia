/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import {RNAbility} from '@rnoh/react-native-openharmony';
import { AbilityConstant, Want } from '@kit.AbilityKit';

export default class EntryAbility extends RNAbility {

  onCreate(want: Want) {
    super.onCreate(want)
    this.handleWeChatCallIfNeed(want)
  }

  getPagePath() {
    return 'pages/Index';
  }

  onNewWant(want: Want, _launchParam: AbilityConstant.LaunchParam): void {
    this.handleWeChatCallIfNeed(want)
  }

  private handleWeChatCallIfNeed(want: Want) {
  }
}
