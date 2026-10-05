import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";

type LoadingProps = {
  /** Text shown under the spinner. Pass "" to hide it. */
  label?: string;
  /** "small" | "large" or a number (Android only). */
  size?: "small" | "large";
  /** Spinner and label color. */
  color?: string;
  /** Fill the whole screen and center the content. */
  fullScreen?: boolean;
  style?: ViewStyle;
};

export default function Loading({
  size = "large",
  color = "#666666",
  fullScreen = false,
  style,
}: LoadingProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={"Loading"}
      style={[styles.container, fullScreen && styles.fullScreen, style]}
    >
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  fullScreen: {
    flex: 1,
  },
  label: {
    fontSize: 5,
  },
});
