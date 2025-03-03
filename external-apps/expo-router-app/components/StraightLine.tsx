import React, { useCallback, useMemo, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { View, StyleSheet } from 'react-native'
import Reanimated, { useDerivedValue } from 'react-native-reanimated'
import {  Canvas, Path, Skia } from '@shopify/react-native-skia/src'

export function StraightLine(): React.ReactElement {
    const [width, setWidth] = useState(0)
    const height = 200
    const lineThickness = useDerivedValue(() =>4)
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
    return (
        <View>
            <Reanimated.View style={[styles.container]}>
                <View style={styles.container} onLayout={onLayout}>
                    <Canvas style={styles.svg}>
                        <Path
                            path={straightLine}
                            strokeWidth={lineThickness}
                            style='stroke'
                            strokeJoin='round'
                            strokeCap='round'
                            color={'red'}
                        />
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
})