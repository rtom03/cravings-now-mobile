import { Typography } from "@/constant/typography";
import { Text, TextProps } from "react-native";

type Variant = keyof typeof Typography;

export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[Typography[variant], style]} />;
}
