import { AppText } from "@/components/app-text";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, TouchableOpacity, View } from "react-native";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  surface: "#FFFFFF",
  signal: "#E63462",
  support: "#0F5257",
  n600: "#6E6E76",
  n100: "#F1EFEA",
} as const;

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

// A small centered dialog, not a full-screen sheet like AddressModal/
// ItemDetailSheet — it's naturally centered via flex, so it doesn't need
// SafeModal/safe-area handling the way anything anchored to a screen edge
// does. Generic on purpose: pass different title/message/tone/icon for
// any other destructive or need-confirmation action later (clearing the
// cart, removing a saved address, etc.) rather than building one per case.
export default function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  icon,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const accent = tone === "danger" ? COLORS.signal : COLORS.support;
  const resolvedIcon: keyof typeof Ionicons.glyphMap =
    icon ??
    (tone === "danger" ? "alert-circle-outline" : "help-circle-outline");

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(27,27,31,0.45)",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        {/* Swallow taps on the card itself so they don't bubble to the
            backdrop's onPress and dismiss the dialog unintentionally. */}
        <Pressable
          onPress={() => {}}
          style={{
            width: "100%",
            backgroundColor: COLORS.surface,
            borderRadius: 20,
            padding: 22,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: tone === "danger" ? "#FBE3E9" : COLORS.n100,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Ionicons name={resolvedIcon} size={22} color={accent} />
          </View>

          <AppText
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: COLORS.ink,
              textAlign: "center",
            }}
          >
            {title}
          </AppText>

          {!!message && (
            <AppText
              style={{
                fontSize: 12.5,
                color: COLORS.n600,
                textAlign: "center",
                marginTop: 8,
                lineHeight: 18,
              }}
            >
              {message}
            </AppText>
          )}

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 20,
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: COLORS.n100,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: "center",
              }}
            >
              <AppText
                style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}
              >
                {cancelLabel}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: accent,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: "center",
              }}
            >
              <AppText
                style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}
              >
                {confirmLabel}
              </AppText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
