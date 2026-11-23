import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "./app-text";

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
}

const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
} as const;

export default function InfoCard({
  icon,
  title,
  subtitle,
  onPress,
}: InfoCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.n200,
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: COLORS.n100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color={COLORS.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.ink }}
        >
          {title}
        </AppText>
        <AppText
          numberOfLines={1}
          style={{ fontSize: 11, color: COLORS.n600, marginTop: 2 }}
        >
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.n200} />
    </TouchableOpacity>
  );
}
