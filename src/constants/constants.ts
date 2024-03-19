import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("screen");
// original grid size: 190x144
// original background size: 650x1024
export const Constants = {
  MAX_WIDTH: width,
  MAX_HEIGHT: height,
  XR: width / 650,
  YR: height / 1024,
};
