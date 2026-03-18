import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  primary: "#FF5C00",
  secondary: "#ff991c",
  background: "#fff",
  black: "#000",
  white: "#fff",
  num: "#dee2e6",
  icon: "#888",
  serviceBg: "#F2F2F2",
  active: "#FFEDDC",
};

export const FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export const SIZES = {
  base: 10,
  width,
  height,
};

const theme = { COLORS, SIZES, FONTS };

export default theme;
