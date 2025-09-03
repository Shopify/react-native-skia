/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

export default interface XComponentContext {
  registerView(xComponentId: string, nativeId: number): void;
  setModeAndDebug(xComponentId: string, mode: string, show: boolean): void;
  onSurfaceSizeChanged(xComponentId: string, nativeId: number, width: number, height: number): void;
  unregisterView(xComponentId: string, nativeId: number): void;
};
