import React, { useCallback, useMemo, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { View, StyleSheet } from 'react-native'
import {
  Canvas,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia/src'
import Reanimated, {
  useSharedValue,
} from 'react-native-reanimated'

const StraightLine= (): React.ReactElement =>{
  const [width, setWidth] = useState(0)
  const height = 200

  const onLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setWidth(Math.round(layout.width))
  }, [])

  const straightLine = useMemo(() => {
    const path = Skia.Path.Make()
    path.moveTo(0, height / 2)
    for (let i = 0; i < width - 1; i += 2) {
      const innerX = i
      const y = height / 2
      path.cubicTo(innerX, y, innerX, y, innerX, y)
    }

    return path
  }, [height, width])

  const path = useSharedValue(straightLine)

  return (
    <View>
        <Reanimated.View style={[styles.container]}>
          <View style={styles.container} onLayout={onLayout}>
            <Canvas style={styles.svg}>
                <Path
                  // @ts-ignore
                  path={path}
                  strokeWidth={2}
                  style='stroke'
                  strokeJoin='round'
                  strokeCap='round'
                  color={'#00FFFF'}
                >
                <LinearGradient
                    start={vec(0, 0)}
                    end={vec(width, 0)}
                    colors={['#00FFFF']}
                    positions={[]}
                  />
                </Path>
            </Canvas>
          </View>
        </Reanimated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  svg: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  axisRow: {
    height: 17,
  },
})

export default StraightLine
