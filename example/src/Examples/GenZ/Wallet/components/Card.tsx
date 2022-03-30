/* eslint-disable max-len */
import {
  Group,
  LinearGradient,
  Paint,
  vec,
  Path,
  Circle,
  Skia,
  FillType,
  rrect,
  rect,
  ColorMatrix,
  useDerivedValue,
  OpacityMatrix,
} from "@shopify/react-native-skia";
import React from "react";

import { BaseCard } from "./BaseCard";
import type { ModeProps } from "./Canvas";
import { useGradientsColors } from "./Canvas";

//interface CardProps {}

const x = 16;
const y = 126;
const width = 342;
const height = 200;
const start = vec(x, height);
const end = vec(x + width, 0);
const path = Skia.Path.MakeFromSVGString(
  "M16 31.8C16 27.4922 19.4922 24 23.8 24H32.2C36.5078 24 40 27.4922 40 31.8V40.2C40 44.5078 36.5078 48 32.2 48H23.8C19.4922 48 16 44.5078 16 40.2V31.8ZM33.7518 27.9854C34.1491 27.8049 34.6 28.0953 34.6 28.5316V35.8875C34.6 36.1228 34.4624 36.3364 34.2482 36.4338L29.4482 38.6146C29.0509 38.7951 28.6 38.5047 28.6 38.0684V30.7125C28.6 30.4772 28.7376 30.2636 28.9518 30.1662L33.7518 27.9854ZM22.2559 28.0035C21.8579 27.8159 21.4 28.1062 21.4 28.5462V42.391C21.4 42.6232 21.5341 42.8346 21.7441 42.9337L26.5441 45.1965C26.9421 45.3842 27.4 45.0938 27.4 44.6538V30.809C27.4 30.5768 27.2659 30.3654 27.0559 30.2663L22.2559 28.0035Z"
)!;
path.setFillType(FillType.EvenOdd);

export const Card = ({ mode }: ModeProps) => {
  const colors = useGradientsColors(mode);
  const matrix = useDerivedValue(() => OpacityMatrix(1 - mode.current), [mode]);
  return (
    <Group x={x} y={y}>
      <Paint>
        <LinearGradient start={start} end={end} colors={colors} />
      </Paint>
      <BaseCard
        y={0}
        mode={mode}
        rect={rrect(rect(0, 0, width, height), 16, 16)}
      />
      <Path path={path} color="#FCFCFC" />

      <Group>
        <Paint>
          <ColorMatrix matrix={matrix} />
        </Paint>
        <Path
          path="M49.136 41V29.8H51.136L54.928 37.256L58.704 29.8H60.704V41H59.008V32.728L55.584 39.4H54.272L50.832 32.744V41H49.136ZM65.6038 41.192C64.9318 41.192 64.3771 41.08 63.9398 40.856C63.5024 40.632 63.1771 40.3387 62.9638 39.976C62.7504 39.6027 62.6438 39.1973 62.6438 38.76C62.6438 37.992 62.9424 37.384 63.5398 36.936C64.1371 36.488 64.9904 36.264 66.0998 36.264H68.1798V36.12C68.1798 35.5013 68.0091 35.0373 67.6678 34.728C67.3371 34.4187 66.9051 34.264 66.3718 34.264C65.9024 34.264 65.4918 34.3813 65.1398 34.616C64.7984 34.84 64.5904 35.176 64.5158 35.624H62.8198C62.8731 35.048 63.0651 34.5573 63.3958 34.152C63.7371 33.736 64.1638 33.4213 64.6758 33.208C65.1984 32.984 65.7691 32.872 66.3878 32.872C67.4971 32.872 68.3558 33.1653 68.9638 33.752C69.5718 34.328 69.8758 35.1173 69.8758 36.12V41H68.4038L68.2598 39.64C68.0358 40.0773 67.7104 40.4453 67.2838 40.744C66.8571 41.0427 66.2971 41.192 65.6038 41.192ZM65.9398 39.816C66.3984 39.816 66.7824 39.7093 67.0918 39.496C67.4118 39.272 67.6571 38.9787 67.8278 38.616C68.0091 38.2533 68.1211 37.8533 68.1638 37.416H66.2758C65.6038 37.416 65.1238 37.5333 64.8358 37.768C64.5584 38.0027 64.4198 38.296 64.4198 38.648C64.4198 39.0107 64.5531 39.2987 64.8198 39.512C65.0971 39.7147 65.4704 39.816 65.9398 39.816ZM75.0213 41.192C74.0186 41.192 73.1919 40.9467 72.5413 40.456C71.8906 39.9653 71.5173 39.3147 71.4213 38.504H73.1332C73.2186 38.8667 73.4213 39.1813 73.7413 39.448C74.0613 39.704 74.4826 39.832 75.0052 39.832C75.5173 39.832 75.8906 39.7253 76.1253 39.512C76.3599 39.2987 76.4773 39.0533 76.4773 38.776C76.4773 38.3707 76.3119 38.0987 75.9813 37.96C75.6613 37.8107 75.2133 37.6773 74.6373 37.56C74.1893 37.464 73.7413 37.336 73.2933 37.176C72.8559 37.016 72.4879 36.792 72.1893 36.504C71.9013 36.2053 71.7573 35.8053 71.7573 35.304C71.7573 34.6107 72.0239 34.0347 72.5573 33.576C73.0906 33.1067 73.8373 32.872 74.7973 32.872C75.6826 32.872 76.3973 33.0853 76.9413 33.512C77.4959 33.9387 77.8213 34.5413 77.9173 35.32H76.2853C76.2319 34.9787 76.0719 34.712 75.8053 34.52C75.5493 34.328 75.2026 34.232 74.7653 34.232C74.3386 34.232 74.0079 34.3227 73.7733 34.504C73.5386 34.6747 73.4213 34.8987 73.4213 35.176C73.4213 35.4533 73.5813 35.672 73.9013 35.832C74.2319 35.992 74.6639 36.136 75.1973 36.264C75.7306 36.3813 76.2213 36.52 76.6693 36.68C77.1279 36.8293 77.4959 37.0533 77.7733 37.352C78.0506 37.6507 78.1893 38.088 78.1893 38.664C78.1999 39.3893 77.9173 39.992 77.3413 40.472C76.7759 40.952 76.0026 41.192 75.0213 41.192ZM83.0719 41C82.2932 41 81.6745 40.8133 81.2159 40.44C80.7572 40.056 80.5279 39.3787 80.5279 38.408V34.488H79.1679V33.064H80.5279L80.7359 31.048H82.2239V33.064H84.4639V34.488H82.2239V38.408C82.2239 38.8453 82.3145 39.1493 82.4959 39.32C82.6879 39.48 83.0132 39.56 83.4719 39.56H84.3839V41H83.0719ZM89.7215 41.192C88.9428 41.192 88.2495 41.0213 87.6415 40.68C87.0442 40.328 86.5748 39.8427 86.2335 39.224C85.8922 38.6053 85.7215 37.8853 85.7215 37.064C85.7215 36.232 85.8868 35.5013 86.2175 34.872C86.5588 34.2427 87.0282 33.752 87.6255 33.4C88.2335 33.048 88.9375 32.872 89.7375 32.872C90.5162 32.872 91.1935 33.048 91.7695 33.4C92.3455 33.7413 92.7935 34.2 93.1135 34.776C93.4335 35.352 93.5935 35.9867 93.5935 36.68C93.5935 36.7867 93.5882 36.904 93.5775 37.032C93.5775 37.1493 93.5722 37.2827 93.5615 37.432H87.3855C87.4388 38.2 87.6895 38.7867 88.1375 39.192C88.5962 39.5867 89.1242 39.784 89.7215 39.784C90.2015 39.784 90.6015 39.6773 90.9215 39.464C91.2522 39.24 91.4975 38.9413 91.6575 38.568H93.3535C93.1402 39.3147 92.7135 39.9387 92.0735 40.44C91.4442 40.9413 90.6602 41.192 89.7215 41.192ZM89.7215 34.264C89.1562 34.264 88.6548 34.4347 88.2175 34.776C87.7802 35.1067 87.5135 35.608 87.4175 36.28H91.8975C91.8655 35.6613 91.6468 35.1707 91.2415 34.808C90.8362 34.4453 90.3295 34.264 89.7215 34.264ZM95.3533 41V33.064H96.8733L97.0173 34.568C97.2946 34.0453 97.6786 33.6347 98.1693 33.336C98.6706 33.0267 99.2733 32.872 99.9773 32.872V34.648H99.5133C99.0439 34.648 98.6226 34.728 98.2493 34.888C97.8866 35.0373 97.5933 35.2987 97.3693 35.672C97.1559 36.0347 97.0493 36.5413 97.0493 37.192V41H95.3533ZM104.973 41.192C104.194 41.192 103.495 41.016 102.877 40.664C102.269 40.312 101.789 39.8267 101.437 39.208C101.095 38.5787 100.925 37.8533 100.925 37.032C100.925 36.2107 101.095 35.4907 101.437 34.872C101.789 34.2427 102.269 33.752 102.877 33.4C103.495 33.048 104.194 32.872 104.973 32.872C105.954 32.872 106.775 33.128 107.437 33.64C108.109 34.152 108.541 34.8453 108.733 35.72H106.957C106.85 35.2827 106.615 34.9413 106.253 34.696C105.89 34.4507 105.463 34.328 104.973 34.328C104.557 34.328 104.173 34.4347 103.821 34.648C103.469 34.8507 103.186 35.1547 102.973 35.56C102.759 35.9547 102.653 36.4453 102.653 37.032C102.653 37.6187 102.759 38.1147 102.973 38.52C103.186 38.9147 103.469 39.2187 103.821 39.432C104.173 39.6453 104.557 39.752 104.973 39.752C105.463 39.752 105.89 39.6293 106.253 39.384C106.615 39.1387 106.85 38.792 106.957 38.344H108.733C108.551 39.1973 108.125 39.8853 107.453 40.408C106.781 40.9307 105.954 41.192 104.973 41.192ZM113.26 41.192C112.588 41.192 112.033 41.08 111.596 40.856C111.159 40.632 110.833 40.3387 110.62 39.976C110.407 39.6027 110.3 39.1973 110.3 38.76C110.3 37.992 110.599 37.384 111.196 36.936C111.793 36.488 112.647 36.264 113.756 36.264H115.836V36.12C115.836 35.5013 115.665 35.0373 115.324 34.728C114.993 34.4187 114.561 34.264 114.028 34.264C113.559 34.264 113.148 34.3813 112.796 34.616C112.455 34.84 112.247 35.176 112.172 35.624H110.476C110.529 35.048 110.721 34.5573 111.052 34.152C111.393 33.736 111.82 33.4213 112.332 33.208C112.855 32.984 113.425 32.872 114.044 32.872C115.153 32.872 116.012 33.1653 116.62 33.752C117.228 34.328 117.532 35.1173 117.532 36.12V41H116.06L115.916 39.64C115.692 40.0773 115.367 40.4453 114.94 40.744C114.513 41.0427 113.953 41.192 113.26 41.192ZM113.596 39.816C114.055 39.816 114.439 39.7093 114.748 39.496C115.068 39.272 115.313 38.9787 115.484 38.616C115.665 38.2533 115.777 37.8533 115.82 37.416H113.932C113.26 37.416 112.78 37.5333 112.492 37.768C112.215 38.0027 112.076 38.296 112.076 38.648C112.076 39.0107 112.209 39.2987 112.476 39.512C112.753 39.7147 113.127 39.816 113.596 39.816ZM119.51 41V33.064H121.03L121.174 34.568C121.451 34.0453 121.835 33.6347 122.326 33.336C122.827 33.0267 123.43 32.872 124.134 32.872V34.648H123.67C123.2 34.648 122.779 34.728 122.406 34.888C122.043 35.0373 121.75 35.2987 121.526 35.672C121.312 36.0347 121.206 36.5413 121.206 37.192V41H119.51ZM128.985 41.192C128.217 41.192 127.54 41.0107 126.953 40.648C126.366 40.2853 125.908 39.7893 125.577 39.16C125.246 38.5307 125.081 37.816 125.081 37.016C125.081 36.216 125.246 35.5067 125.577 34.888C125.908 34.2587 126.366 33.768 126.953 33.416C127.55 33.0533 128.233 32.872 129.001 32.872C129.63 32.872 130.18 32.9947 130.649 33.24C131.129 33.4853 131.502 33.832 131.769 34.28V29.48H133.465V41H131.945L131.769 39.768C131.513 40.1413 131.161 40.472 130.713 40.76C130.265 41.048 129.689 41.192 128.985 41.192ZM129.289 39.72C130.014 39.72 130.606 39.4693 131.065 38.968C131.534 38.4667 131.769 37.8213 131.769 37.032C131.769 36.232 131.534 35.5867 131.065 35.096C130.606 34.5947 130.014 34.344 129.289 34.344C128.564 34.344 127.966 34.5947 127.497 35.096C127.028 35.5867 126.793 36.232 126.793 37.032C126.793 37.5547 126.9 38.0187 127.113 38.424C127.326 38.8293 127.62 39.1493 127.993 39.384C128.377 39.608 128.809 39.72 129.289 39.72Z"
          color="#FCFCFC"
        />
        <Path
          path="M49.136 41V29.8H51.136L54.928 37.256L58.704 29.8H60.704V41H59.008V32.728L55.584 39.4H54.272L50.832 32.744V41H49.136ZM65.6038 41.192C64.9318 41.192 64.3771 41.08 63.9398 40.856C63.5024 40.632 63.1771 40.3387 62.9638 39.976C62.7504 39.6027 62.6438 39.1973 62.6438 38.76C62.6438 37.992 62.9424 37.384 63.5398 36.936C64.1371 36.488 64.9904 36.264 66.0998 36.264H68.1798V36.12C68.1798 35.5013 68.0091 35.0373 67.6678 34.728C67.3371 34.4187 66.9051 34.264 66.3718 34.264C65.9024 34.264 65.4918 34.3813 65.1398 34.616C64.7984 34.84 64.5904 35.176 64.5158 35.624H62.8198C62.8731 35.048 63.0651 34.5573 63.3958 34.152C63.7371 33.736 64.1638 33.4213 64.6758 33.208C65.1984 32.984 65.7691 32.872 66.3878 32.872C67.4971 32.872 68.3558 33.1653 68.9638 33.752C69.5718 34.328 69.8758 35.1173 69.8758 36.12V41H68.4038L68.2598 39.64C68.0358 40.0773 67.7104 40.4453 67.2838 40.744C66.8571 41.0427 66.2971 41.192 65.6038 41.192ZM65.9398 39.816C66.3984 39.816 66.7824 39.7093 67.0918 39.496C67.4118 39.272 67.6571 38.9787 67.8278 38.616C68.0091 38.2533 68.1211 37.8533 68.1638 37.416H66.2758C65.6038 37.416 65.1238 37.5333 64.8358 37.768C64.5584 38.0027 64.4198 38.296 64.4198 38.648C64.4198 39.0107 64.5531 39.2987 64.8198 39.512C65.0971 39.7147 65.4704 39.816 65.9398 39.816ZM75.0213 41.192C74.0186 41.192 73.1919 40.9467 72.5413 40.456C71.8906 39.9653 71.5173 39.3147 71.4213 38.504H73.1332C73.2186 38.8667 73.4213 39.1813 73.7413 39.448C74.0613 39.704 74.4826 39.832 75.0052 39.832C75.5173 39.832 75.8906 39.7253 76.1253 39.512C76.3599 39.2987 76.4773 39.0533 76.4773 38.776C76.4773 38.3707 76.3119 38.0987 75.9813 37.96C75.6613 37.8107 75.2133 37.6773 74.6373 37.56C74.1893 37.464 73.7413 37.336 73.2933 37.176C72.8559 37.016 72.4879 36.792 72.1893 36.504C71.9013 36.2053 71.7573 35.8053 71.7573 35.304C71.7573 34.6107 72.0239 34.0347 72.5573 33.576C73.0906 33.1067 73.8373 32.872 74.7973 32.872C75.6826 32.872 76.3973 33.0853 76.9413 33.512C77.4959 33.9387 77.8213 34.5413 77.9173 35.32H76.2853C76.2319 34.9787 76.0719 34.712 75.8053 34.52C75.5493 34.328 75.2026 34.232 74.7653 34.232C74.3386 34.232 74.0079 34.3227 73.7733 34.504C73.5386 34.6747 73.4213 34.8987 73.4213 35.176C73.4213 35.4533 73.5813 35.672 73.9013 35.832C74.2319 35.992 74.6639 36.136 75.1973 36.264C75.7306 36.3813 76.2213 36.52 76.6693 36.68C77.1279 36.8293 77.4959 37.0533 77.7733 37.352C78.0506 37.6507 78.1893 38.088 78.1893 38.664C78.1999 39.3893 77.9173 39.992 77.3413 40.472C76.7759 40.952 76.0026 41.192 75.0213 41.192ZM83.0719 41C82.2932 41 81.6745 40.8133 81.2159 40.44C80.7572 40.056 80.5279 39.3787 80.5279 38.408V34.488H79.1679V33.064H80.5279L80.7359 31.048H82.2239V33.064H84.4639V34.488H82.2239V38.408C82.2239 38.8453 82.3145 39.1493 82.4959 39.32C82.6879 39.48 83.0132 39.56 83.4719 39.56H84.3839V41H83.0719ZM89.7215 41.192C88.9428 41.192 88.2495 41.0213 87.6415 40.68C87.0442 40.328 86.5748 39.8427 86.2335 39.224C85.8922 38.6053 85.7215 37.8853 85.7215 37.064C85.7215 36.232 85.8868 35.5013 86.2175 34.872C86.5588 34.2427 87.0282 33.752 87.6255 33.4C88.2335 33.048 88.9375 32.872 89.7375 32.872C90.5162 32.872 91.1935 33.048 91.7695 33.4C92.3455 33.7413 92.7935 34.2 93.1135 34.776C93.4335 35.352 93.5935 35.9867 93.5935 36.68C93.5935 36.7867 93.5882 36.904 93.5775 37.032C93.5775 37.1493 93.5722 37.2827 93.5615 37.432H87.3855C87.4388 38.2 87.6895 38.7867 88.1375 39.192C88.5962 39.5867 89.1242 39.784 89.7215 39.784C90.2015 39.784 90.6015 39.6773 90.9215 39.464C91.2522 39.24 91.4975 38.9413 91.6575 38.568H93.3535C93.1402 39.3147 92.7135 39.9387 92.0735 40.44C91.4442 40.9413 90.6602 41.192 89.7215 41.192ZM89.7215 34.264C89.1562 34.264 88.6548 34.4347 88.2175 34.776C87.7802 35.1067 87.5135 35.608 87.4175 36.28H91.8975C91.8655 35.6613 91.6468 35.1707 91.2415 34.808C90.8362 34.4453 90.3295 34.264 89.7215 34.264ZM95.3533 41V33.064H96.8733L97.0173 34.568C97.2946 34.0453 97.6786 33.6347 98.1693 33.336C98.6706 33.0267 99.2733 32.872 99.9773 32.872V34.648H99.5133C99.0439 34.648 98.6226 34.728 98.2493 34.888C97.8866 35.0373 97.5933 35.2987 97.3693 35.672C97.1559 36.0347 97.0493 36.5413 97.0493 37.192V41H95.3533ZM104.973 41.192C104.194 41.192 103.495 41.016 102.877 40.664C102.269 40.312 101.789 39.8267 101.437 39.208C101.095 38.5787 100.925 37.8533 100.925 37.032C100.925 36.2107 101.095 35.4907 101.437 34.872C101.789 34.2427 102.269 33.752 102.877 33.4C103.495 33.048 104.194 32.872 104.973 32.872C105.954 32.872 106.775 33.128 107.437 33.64C108.109 34.152 108.541 34.8453 108.733 35.72H106.957C106.85 35.2827 106.615 34.9413 106.253 34.696C105.89 34.4507 105.463 34.328 104.973 34.328C104.557 34.328 104.173 34.4347 103.821 34.648C103.469 34.8507 103.186 35.1547 102.973 35.56C102.759 35.9547 102.653 36.4453 102.653 37.032C102.653 37.6187 102.759 38.1147 102.973 38.52C103.186 38.9147 103.469 39.2187 103.821 39.432C104.173 39.6453 104.557 39.752 104.973 39.752C105.463 39.752 105.89 39.6293 106.253 39.384C106.615 39.1387 106.85 38.792 106.957 38.344H108.733C108.551 39.1973 108.125 39.8853 107.453 40.408C106.781 40.9307 105.954 41.192 104.973 41.192ZM113.26 41.192C112.588 41.192 112.033 41.08 111.596 40.856C111.159 40.632 110.833 40.3387 110.62 39.976C110.407 39.6027 110.3 39.1973 110.3 38.76C110.3 37.992 110.599 37.384 111.196 36.936C111.793 36.488 112.647 36.264 113.756 36.264H115.836V36.12C115.836 35.5013 115.665 35.0373 115.324 34.728C114.993 34.4187 114.561 34.264 114.028 34.264C113.559 34.264 113.148 34.3813 112.796 34.616C112.455 34.84 112.247 35.176 112.172 35.624H110.476C110.529 35.048 110.721 34.5573 111.052 34.152C111.393 33.736 111.82 33.4213 112.332 33.208C112.855 32.984 113.425 32.872 114.044 32.872C115.153 32.872 116.012 33.1653 116.62 33.752C117.228 34.328 117.532 35.1173 117.532 36.12V41H116.06L115.916 39.64C115.692 40.0773 115.367 40.4453 114.94 40.744C114.513 41.0427 113.953 41.192 113.26 41.192ZM113.596 39.816C114.055 39.816 114.439 39.7093 114.748 39.496C115.068 39.272 115.313 38.9787 115.484 38.616C115.665 38.2533 115.777 37.8533 115.82 37.416H113.932C113.26 37.416 112.78 37.5333 112.492 37.768C112.215 38.0027 112.076 38.296 112.076 38.648C112.076 39.0107 112.209 39.2987 112.476 39.512C112.753 39.7147 113.127 39.816 113.596 39.816ZM119.51 41V33.064H121.03L121.174 34.568C121.451 34.0453 121.835 33.6347 122.326 33.336C122.827 33.0267 123.43 32.872 124.134 32.872V34.648H123.67C123.2 34.648 122.779 34.728 122.406 34.888C122.043 35.0373 121.75 35.2987 121.526 35.672C121.312 36.0347 121.206 36.5413 121.206 37.192V41H119.51ZM128.985 41.192C128.217 41.192 127.54 41.0107 126.953 40.648C126.366 40.2853 125.908 39.7893 125.577 39.16C125.246 38.5307 125.081 37.816 125.081 37.016C125.081 36.216 125.246 35.5067 125.577 34.888C125.908 34.2587 126.366 33.768 126.953 33.416C127.55 33.0533 128.233 32.872 129.001 32.872C129.63 32.872 130.18 32.9947 130.649 33.24C131.129 33.4853 131.502 33.832 131.769 34.28V29.48H133.465V41H131.945L131.769 39.768C131.513 40.1413 131.161 40.472 130.713 40.76C130.265 41.048 129.689 41.192 128.985 41.192ZM129.289 39.72C130.014 39.72 130.606 39.4693 131.065 38.968C131.534 38.4667 131.769 37.8213 131.769 37.032C131.769 36.232 131.534 35.5867 131.065 35.096C130.606 34.5947 130.014 34.344 129.289 34.344C128.564 34.344 127.966 34.5947 127.497 35.096C127.028 35.5867 126.793 36.232 126.793 37.032C126.793 37.5547 126.9 38.0187 127.113 38.424C127.326 38.8293 127.62 39.1493 127.993 39.384C128.377 39.608 128.809 39.72 129.289 39.72Z"
          color="#FCFCFC"
        />
        <Circle cx={31} cy={99} r={15} color="#EB001B" />
        <Circle cx={49} cy={99} r={15} color="#F79E1B" />
        <Path
          path="M39.9999 111C44.1406 108.605 46.9265 104.128 46.9265 99C46.9265 93.8723 44.1406 89.3953 39.9999 87C35.8591 89.3953 33.0732 93.8723 33.0732 99C33.0732 104.128 35.8591 108.605 39.9999 111Z"
          color="#FF5F00"
        />
        <Path
          path="M22.24 177.088V175.24C20.672 175.064 19.416 174.512 18.472 173.584C17.528 172.656 17.048 171.44 17.032 169.936H19.72C19.736 170.688 19.96 171.352 20.392 171.928C20.824 172.488 21.44 172.864 22.24 173.056V167.272C22.112 167.24 21.976 167.2 21.832 167.152C21.704 167.104 21.568 167.056 21.424 167.008C20.128 166.576 19.152 166.016 18.496 165.328C17.856 164.64 17.536 163.736 17.536 162.616C17.52 161.304 17.944 160.232 18.808 159.4C19.672 158.568 20.816 158.08 22.24 157.936V156.016H23.872V157.96C25.264 158.12 26.384 158.624 27.232 159.472C28.08 160.32 28.512 161.384 28.528 162.664H25.84C25.824 162.136 25.648 161.64 25.312 161.176C24.992 160.696 24.512 160.368 23.872 160.192V165.328C24 165.376 24.128 165.424 24.256 165.472C24.384 165.504 24.512 165.544 24.64 165.592C25.472 165.864 26.216 166.192 26.872 166.576C27.528 166.96 28.048 167.464 28.432 168.088C28.832 168.712 29.032 169.504 29.032 170.464C29.032 171.264 28.84 172.016 28.456 172.72C28.072 173.408 27.496 173.984 26.728 174.448C25.96 174.912 25.008 175.184 23.872 175.264V177.088H22.24ZM20.176 162.4C20.176 163.04 20.36 163.536 20.728 163.888C21.096 164.224 21.6 164.52 22.24 164.776V160.12C21.632 160.232 21.136 160.488 20.752 160.888C20.368 161.272 20.176 161.776 20.176 162.4ZM26.344 170.632C26.344 169.848 26.112 169.256 25.648 168.856C25.184 168.44 24.592 168.096 23.872 167.824V173.104C24.656 173.008 25.264 172.736 25.696 172.288C26.128 171.84 26.344 171.288 26.344 170.632Z"
          color="#FCFCFC"
        />
        <Path
          path="M42.128 175.288C41.024 175.288 40.024 175.096 39.128 174.712C38.232 174.312 37.512 173.704 36.968 172.888C36.424 172.072 36.136 171.048 36.104 169.816H39.128C39.144 170.632 39.408 171.32 39.92 171.88C40.448 172.424 41.184 172.696 42.128 172.696C43.024 172.696 43.712 172.448 44.192 171.952C44.672 171.456 44.912 170.832 44.912 170.08C44.912 169.2 44.592 168.536 43.952 168.088C43.328 167.624 42.52 167.392 41.528 167.392H40.28V164.872H41.552C42.368 164.872 43.048 164.68 43.592 164.296C44.136 163.912 44.408 163.344 44.408 162.592C44.408 161.968 44.2 161.472 43.784 161.104C43.384 160.72 42.824 160.528 42.104 160.528C41.32 160.528 40.704 160.76 40.256 161.224C39.824 161.688 39.584 162.256 39.536 162.928H36.536C36.6 161.376 37.136 160.152 38.144 159.256C39.168 158.36 40.488 157.912 42.104 157.912C43.256 157.912 44.224 158.12 45.008 158.536C45.808 158.936 46.408 159.472 46.808 160.144C47.224 160.816 47.432 161.56 47.432 162.376C47.432 163.32 47.168 164.12 46.64 164.776C46.128 165.416 45.488 165.848 44.72 166.072C45.664 166.264 46.432 166.728 47.024 167.464C47.616 168.184 47.912 169.096 47.912 170.2C47.912 171.128 47.688 171.976 47.24 172.744C46.792 173.512 46.136 174.128 45.272 174.592C44.424 175.056 43.376 175.288 42.128 175.288ZM57.6076 175L63.9436 160.816H55.6636V158.2H67.1116V160.384L60.7996 175H57.6076ZM74.906 175.288C73.674 175.288 72.61 175.072 71.714 174.64C70.834 174.208 70.138 173.616 69.626 172.864C69.13 172.096 68.842 171.232 68.762 170.272H71.762C71.906 170.96 72.258 171.536 72.818 172C73.378 172.448 74.074 172.672 74.906 172.672C75.802 172.672 76.53 172.344 77.09 171.688C77.666 171.032 77.954 170.216 77.954 169.24C77.954 168.232 77.666 167.432 77.09 166.84C76.53 166.248 75.818 165.952 74.954 165.952C74.234 165.952 73.61 166.128 73.082 166.48C72.554 166.832 72.178 167.272 71.954 167.8H69.002L70.442 158.2H79.754V160.888H72.746L71.978 164.776C72.33 164.392 72.81 164.08 73.418 163.84C74.026 163.584 74.706 163.456 75.458 163.456C76.658 163.456 77.658 163.728 78.458 164.272C79.258 164.8 79.866 165.504 80.282 166.384C80.698 167.248 80.906 168.192 80.906 169.216C80.906 170.384 80.65 171.424 80.138 172.336C79.642 173.248 78.938 173.968 78.026 174.496C77.13 175.024 76.09 175.288 74.906 175.288ZM89.2608 175.288C88.1568 175.288 87.1568 175.096 86.2608 174.712C85.3648 174.312 84.6448 173.704 84.1008 172.888C83.5568 172.072 83.2688 171.048 83.2368 169.816H86.2608C86.2768 170.632 86.5408 171.32 87.0528 171.88C87.5808 172.424 88.3168 172.696 89.2608 172.696C90.1568 172.696 90.8448 172.448 91.3248 171.952C91.8048 171.456 92.0448 170.832 92.0448 170.08C92.0448 169.2 91.7248 168.536 91.0848 168.088C90.4608 167.624 89.6528 167.392 88.6608 167.392H87.4128V164.872H88.6848C89.5008 164.872 90.1808 164.68 90.7248 164.296C91.2688 163.912 91.5408 163.344 91.5408 162.592C91.5408 161.968 91.3328 161.472 90.9168 161.104C90.5168 160.72 89.9568 160.528 89.2368 160.528C88.4528 160.528 87.8368 160.76 87.3888 161.224C86.9568 161.688 86.7168 162.256 86.6688 162.928H83.6688C83.7328 161.376 84.2688 160.152 85.2768 159.256C86.3008 158.36 87.6208 157.912 89.2368 157.912C90.3888 157.912 91.3568 158.12 92.1408 158.536C92.9408 158.936 93.5408 159.472 93.9408 160.144C94.3568 160.816 94.5648 161.56 94.5648 162.376C94.5648 163.32 94.3008 164.12 93.7728 164.776C93.2608 165.416 92.6208 165.848 91.8528 166.072C92.7968 166.264 93.5648 166.728 94.1568 167.464C94.7488 168.184 95.0448 169.096 95.0448 170.2C95.0448 171.128 94.8208 171.976 94.3728 172.744C93.9248 173.512 93.2688 174.128 92.4048 174.592C91.5568 175.056 90.5088 175.288 89.2608 175.288Z"
          color="#FCFCFC"
        />
        <Path
          path="M97.6057 175.06C97.4057 175.06 97.2377 174.996 97.1017 174.868C96.9737 174.732 96.9097 174.568 96.9097 174.376C96.9097 174.184 96.9737 174.024 97.1017 173.896C97.2377 173.76 97.4057 173.692 97.6057 173.692C97.7977 173.692 97.9577 173.76 98.0857 173.896C98.2217 174.024 98.2897 174.184 98.2897 174.376C98.2897 174.568 98.2217 174.732 98.0857 174.868C97.9577 174.996 97.7977 175.06 97.6057 175.06ZM102.277 175.144C101.741 175.144 101.257 175.048 100.825 174.856C100.393 174.656 100.045 174.36 99.7814 173.968C99.5254 173.576 99.3894 173.088 99.3734 172.504H100.393C100.401 172.984 100.569 173.4 100.897 173.752C101.225 174.096 101.685 174.268 102.277 174.268C102.869 174.268 103.313 174.104 103.609 173.776C103.913 173.448 104.065 173.052 104.065 172.588C104.065 172.196 103.969 171.876 103.777 171.628C103.593 171.38 103.341 171.196 103.021 171.076C102.709 170.956 102.365 170.896 101.989 170.896H101.365V170.044H101.989C102.533 170.044 102.957 169.92 103.261 169.672C103.573 169.424 103.729 169.076 103.729 168.628C103.729 168.252 103.605 167.944 103.357 167.704C103.117 167.456 102.757 167.332 102.277 167.332C101.813 167.332 101.441 167.472 101.161 167.752C100.881 168.024 100.725 168.368 100.693 168.784H99.6734C99.6974 168.328 99.8174 167.924 100.033 167.572C100.257 167.22 100.561 166.948 100.945 166.756C101.329 166.556 101.773 166.456 102.277 166.456C102.821 166.456 103.273 166.552 103.633 166.744C104.001 166.936 104.277 167.192 104.461 167.512C104.653 167.832 104.749 168.184 104.749 168.568C104.749 168.992 104.633 169.38 104.401 169.732C104.169 170.076 103.821 170.308 103.357 170.428C103.853 170.532 104.265 170.768 104.593 171.136C104.921 171.504 105.085 171.988 105.085 172.588C105.085 173.052 104.977 173.48 104.761 173.872C104.553 174.256 104.241 174.564 103.825 174.796C103.409 175.028 102.893 175.144 102.277 175.144ZM109.572 175.144C108.996 175.144 108.496 175.04 108.072 174.832C107.648 174.624 107.308 174.34 107.052 173.98C106.804 173.612 106.652 173.196 106.596 172.732H107.58C107.676 173.196 107.9 173.572 108.252 173.86C108.604 174.14 109.048 174.28 109.584 174.28C109.984 174.28 110.328 174.188 110.616 174.004C110.904 173.812 111.124 173.556 111.276 173.236C111.436 172.916 111.516 172.56 111.516 172.168C111.516 171.544 111.34 171.04 110.988 170.656C110.636 170.272 110.18 170.08 109.62 170.08C109.156 170.08 108.76 170.184 108.432 170.392C108.104 170.6 107.864 170.872 107.712 171.208H106.752L107.472 166.6H111.876V167.476H108.252L107.76 170.032C107.952 169.8 108.216 169.608 108.552 169.456C108.896 169.304 109.288 169.228 109.728 169.228C110.28 169.228 110.76 169.356 111.168 169.612C111.584 169.868 111.908 170.216 112.14 170.656C112.372 171.096 112.488 171.596 112.488 172.156C112.488 172.692 112.372 173.188 112.14 173.644C111.916 174.1 111.584 174.464 111.144 174.736C110.712 175.008 110.188 175.144 109.572 175.144Z"
          color="#FCFCFC"
          opacity={0.64}
        />
      </Group>
    </Group>
  );
};
