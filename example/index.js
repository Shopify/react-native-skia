/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import {AppRegistry, View, Text} from 'react-native';
import {name as appName} from './app.json';
import App from './src/index';

AppRegistry.registerComponent(appName, () => App);