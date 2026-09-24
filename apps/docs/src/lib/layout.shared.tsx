import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { basePath } from "./base-path";

export const githubUrl = "https://github.com/shopify/react-native-skia";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <img src={`${basePath}/img/logo.png`} alt="" width={24} height={24} />
          React Native Skia
        </>
      ),
      url: "/",
    },
    githubUrl,
  };
}
