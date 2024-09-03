import type { ReactNode } from "react";
import React, { useContext, createContext } from "react";

interface Theme {
  primary: string;
}

export const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({
  primary,
  children,
}: {
  primary: string;
  children: ReactNode;
}) => (
  <ThemeContext.Provider value={{ primary }}>{children}</ThemeContext.Provider>
);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error("Theme provider not found");
  }
  return theme;
};
