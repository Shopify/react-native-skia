import type { ReactNode } from "react";
import React from "react";
import { View } from "react-native";

interface ButtonProps {
  x: number;
  y: number;
  size: number;
  children?: ReactNode | ReactNode[];
}

export const Button = ({ children }: ButtonProps) => {
  return <View />;
};
