import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type LoadingProps = {
  /** Text shown under the spinner. Omit (or pass "") to hide it. */
  label?: string;
  /**
   * "small" | "large" or a number (Android only). Defaults to "small" now —
   * right for inline/button use, where "large" (36pt on iOS) was making
   * buttons noticeably taller than their own label text ever did. Pass
   * "large" explicitly for a standalone/full-screen spinner.
   */
  size?: "small" | "large";
  /** Spinner and label color. */
  color?: string;
  /** Fill the whole screen and center the content. */
  fullScreen?: boolean;
  style?: ViewStyle;
};

export default function Loading({
  label,
  size = "small",
  color = "#666666",
  fullScreen = false,
  style,
}: LoadingProps) {
  // No label and not full-screen — the common "swapped in for a button's
  // label" case — skips the wrapping View and its padding entirely and
  // returns the bare spinner. That wrapper was the actual source of the
  // extra height: even at size="small", a centering container with its
  // own padding around a spinner that has nothing else to center against
  // is pure added box, not just the spinner's own footprint.
  if (!label && !fullScreen) {
    return <ActivityIndicator size={size} color={color} style={style} />;
  }

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label || "Loading"}
      style={[styles.container, fullScreen && styles.fullScreen, style]}
    >
      <ActivityIndicator size={size} color={color} />
      {/* Previously declared in props/styles but never actually rendered —
          the label did nothing no matter what was passed in. */}
      {!!label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
    gap: 8,
  },
  fullScreen: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
