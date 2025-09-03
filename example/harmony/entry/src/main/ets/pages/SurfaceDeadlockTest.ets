/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import { RNInstance, JSBundleProvider, RNAbility, RNSurface } from '@rnoh/react-native-openharmony'
import { CustomComponentBuilder } from "@rnoh/react-native-openharmony/src/main/ets/RNOHCorePackage"
import { SurfaceConfig2 } from '@rnoh/react-native-openharmony/src/main/ets/RNSurface'


@Component
export struct SurfaceDeadlockTest {
  public jsBundleProvider: JSBundleProvider | undefined = undefined
  public appKeys: string[] = []
  public numberOfIterations: number = 1
  @BuilderParam public buildCustomComponent!: CustomComponentBuilder
  // -------------------------------------------------------------------------------------------------------------------
  @StorageLink('RNAbility') private rnAbility: RNAbility = {} as RNAbility
  private rnInstance!: RNInstance
  @State private shouldShow: boolean = false
  private shouldDestroyRNInstance: boolean = false
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.getOrCreateRNInstance().then(rnInstance => {
      this.rnInstance = rnInstance
      const jsBundleExecutionStatus = this.rnInstance.getBundleExecutionStatus(this.jsBundleProvider?.getURL())
      if (this.jsBundleProvider && jsBundleExecutionStatus === undefined) {
        this.rnInstance.runJSBundle(this.jsBundleProvider).then(() => {
          this.shouldShow = true
        })
        return;
      }
    }).catch((reason: string | Error) => {
      if (typeof reason === "string")
        this.rnAbility.getLogger().error(reason)
      else if (reason instanceof Error) {
        this.rnAbility.getLogger().error(reason.message)
      } else {
        this.rnAbility.getLogger().error("Fatal exception")
      }
    })
  }

  aboutToDisappear() {
    if (this.shouldDestroyRNInstance)
      this.rnAbility.destroyAndUnregisterRNInstance(this.rnInstance)
    this.cleanUpCallbacks.forEach(cleanUp => cleanUp())
  }

  private getOrCreateRNInstance(): Promise<RNInstance> {
    return this.rnAbility.createAndRegisterRNInstance({ createRNPackages: () => [] })
  }

  build() {
    Stack() {
      if (this.shouldShow) {
        ForEach(this.appKeys, (appKey: string, idx) => {
          Stack() {
            Blinker({
              minDelayInMs: 1000,
              maxDelayInMs: 2000,
              blinksCount: this.numberOfIterations,
              randomnessPrecisionInMs: 500
            }) {
              RNSurface({
                ctx: this.rnAbility.createRNOHContext({ rnInstance: this.rnInstance }),
                surfaceConfig: {
                  initialProps: {},
                  appKey: appKey,
                } as SurfaceConfig2,
                buildCustomComponent: this.buildCustomComponent,
              })
            }
          }.height(`${100 / this.appKeys.length}%`)
          .position({ x: 0, y: `${(idx / this.appKeys.length) * 100}%` })
        })
      }
    }.width("100%")
    .height("100%")
  }
}


@Component
struct Blinker {
  public minDelayInMs: number = 0
  public maxDelayInMs: number = 1000
  public blinksCount: number = 0
  public randomnessPrecisionInMs: number = 250
  @BuilderParam public renderChildren: () => void
  private currentBlinksCount = 0
  @State private isVisible: boolean = false
  private timeout: number = 0

  aboutToAppear() {
    this.blink(this.minDelayInMs)
  }

  aboutToDisappear() {
    clearTimeout(this.timeout)
  }

  private blink(ms: number) {
    this.isVisible = !this.isVisible
    this.currentBlinksCount += 1
    if (this.currentBlinksCount >= this.blinksCount) {
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.isVisible = true
      return;
    }
    this.timeout = setTimeout(() => {
      this.blink(this.getNextDelay())
    }, ms)
  }

  private getNextDelay(): number {
    return ((Math.floor(Math.random() * (Number.MAX_VALUE / this.randomnessPrecisionInMs)) * this.randomnessPrecisionInMs) % this.maxDelayInMs) + this.minDelayInMs
  }

  build() {
    Stack() {
      if (this.isVisible) {
        this.renderChildren()
      }
    }
  }
}





