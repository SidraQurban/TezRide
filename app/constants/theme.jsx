import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  primary: "#FF5C00",
  secondary: "#ff991c",
  background: "#fff",
  black: "#000",
  white: "#fff",
};

export const SIZES = {
  base: 10,
  width,
  height,
};

const theme = { COLORS, SIZES };

export default theme;
