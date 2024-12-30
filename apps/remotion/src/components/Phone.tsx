/* eslint-disable max-len */
import {
  Fill,
  Group,
  Path,
  Shadow,
  Skia,
  fitbox,
  rect,
} from "@shopify/react-native-skia";
import type { ReactNode } from "react";
interface PhoneProps {
  x: number;
  y: number;
  width: number;
  children: ReactNode | ReactNode[];
  progress?: number;
}

const src = rect(0, 0, 421, 852);
const aspectRatio = src.width / src.height;

const clip = Skia.Path.MakeFromSVGString(
  "M 73 0 H 348 C 386.66 0 418 31.3401 418 70 V 782 C 418 820.66 386.66 852 348 852 H 73 C 34.3401 852 3 820.66 3 782 V 70 C 3 31.3401 34.3401 0 73 0 Z H 348 Z"
)!;

export const Phone = ({ x, y, width, children, progress = 1 }: PhoneProps) => {
  const dst = rect(x, y, width, width / aspectRatio);
  return (
    <Group transform={fitbox("cover", src, dst)}>
      <Path path={clip}>
        <Shadow blur={30} dx={20} dy={0} color="rgba(0, 0, 0, 0.5)" />
      </Path>
      <Group clip={clip}>
        <Fill color="#F6F8FB" opacity={progress} />
        {children}
        <Path
          fillType="evenOdd"
          path="M73 0H348C386.66 0 418 31.3401 418 70V782C418 820.66 386.66 852 348 852H73C34.3401 852 3 820.66 3 782V70C3 31.3401 34.3401 0 73 0ZM348 6H73C37.6538 6 9 34.6538 9 70V782C9 817.346 37.6538 846 73 846H348C383.346 846 412 817.346 412 782V70C412 34.6538 383.346 6 348 6Z"
          color="white"
        />
        <Path
          fillType="evenOdd"
          path="M417.971 266H418.981C420.096 266 421 266.895 421 268V364C421 365.105 420.096 366 418.981 366H417.971V266Z"
          color="white"
        />
        <Path
          fillType="evenOdd"
          path="M0 302C0 300.895 0.90402 300 2.01918 300H3.02878V363H2.01918C0.90402 363 0 362.105 0 361V302Z"
          color="white"
        />
        <Path
          fillType="evenOdd"
          path="M0 223C0 221.895 0.90402 221 2.01918 221H3.02878V284H2.01918C0.90402 284 0 283.105 0 282V223Z"
          color="white"
        />
        <Path
          fillType="evenOdd"
          path="M0 162C0 160.895 0.90402 160 2.01918 160H3.02878V193H2.01918C0.90402 193 0 192.105 0 191V162Z"
          color="white"
        />
        <Path
          path="M167.5 30C157.835 30 150 37.835 150 47.5C150 57.165 157.835 65 167.5 65H252.5C262.165 65 270 57.165 270 47.5C270 37.835 262.165 30 252.5 30H167.5ZM250.5 41C246.91 41 244 43.9101 244 47.5C244 51.0899 246.91 54 250.5 54C254.09 54 257 51.0899 257 47.5C257 43.9101 254.09 41 250.5 41Z"
          color="white"
        />
        <Path
          path="M 167.5 30 Z M 250.5 41 C 246.91 41 244 43.9101 244 47.5 C 244 51.0899 246.91 54 250.5 54 C 254.09 54 257 51.0899 257 47.5 C 257 43.9101 254.09 41 250.5 41 Z"
          color="#F6F8FB"
        />
      </Group>
    </Group>
  );
};
