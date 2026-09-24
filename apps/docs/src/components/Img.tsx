import type { ImgHTMLAttributes } from "react";

import { basePath } from "@/lib/base-path";

// Image from public/ (e.g. the reference renders produced by the test suite in
// public/img). Unlike Next's <Link>, a raw <img src> doesn't get the base path.
export const Img = ({
  src,
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
  <img src={`${basePath}${src}`} alt={alt} {...props} />
);
