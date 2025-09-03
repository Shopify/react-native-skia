/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */


@Component
export struct TouchDisplayer {
  @State currentTouches: TouchObject[] = []
  @State touchIndicatorOpacity: number = 0
  @BuilderParam buildChildren: () => void
  build() {
    Stack() {
      this.buildChildren()
      ForEach(this.currentTouches, (activeTouch: TouchObject) => {
        Stack() {
        }
        .width(64)
        .height(64)
        .backgroundColor("blue")
        .borderWidth(2)
        .borderColor("white")
        .opacity(this.touchIndicatorOpacity)
        .position({ x: activeTouch.x - 32, y: activeTouch.y - 32 })
        .borderRadius(1000)
        .hitTestBehavior(HitTestMode.Transparent)
      })
    }
    .width("100%")
    .height("100%")
    .hitTestBehavior(HitTestMode.Transparent)
    .onTouch(e => {
      this.currentTouches = e.touches
      this.touchIndicatorOpacity = 0.5
      animateTo({
        duration: 500,
        curve: Curve.Linear,
      }, () => {
        this.touchIndicatorOpacity = 0
      })
    })
  }
}