import { Href, useRouter } from "expo-router";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./app-text";
import SafeModal from "./shared/safe-modal";
import { Ionicons } from "@expo/vector-icons";

// ─── CravingsNow design tokens ──────────────────────────────────────────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// HomeScreen / BrandsScreen / DetailsScreen / this file until that
// migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  support: "#0F5257",
  warnBg: "#FBF1DE",
  warnText: "#9A6B1E",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

// TODO: replace with real saved-address data once an addresses API/store
// exists — these mirror the design frame's sample content.
const SAVED_ADDRESSES = [
  {
    id: "work",
    label: "Work",
    detail: "Ligali Ayorinde Street, 310A",
    icon: "desktop-outline" as const,
  },
  {
    id: "home",
    label: "Home",
    detail: "Morgan Street, 8",
    icon: "home-outline" as const,
  },
];

function AddressRow({
  icon,
  label,
  detail,
  warning,
  onEdit,
  showDivider = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail: string;
  warning?: string;
  onEdit?: () => void;
  showDivider?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: COLORS.n100,
        alignItems: "flex-start",
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
          style={{ fontSize: 13.5, fontWeight: "700", color: COLORS.ink }}
        >
          {label}
        </AppText>
        <AppText style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 2 }}>
          {detail}
        </AppText>
        {!!warning && (
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: COLORS.warnBg,
              borderRadius: 8,
              paddingHorizontal: 9,
              paddingVertical: 5,
              marginTop: 7,
            }}
          >
            <AppText
              style={{
                fontSize: 10.5,
                fontWeight: "600",
                color: COLORS.warnText,
              }}
            >
              ⚠ {warning}
            </AppText>
          </View>
        )}
      </View>
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: COLORS.n100,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="pencil-outline" size={14} color={COLORS.ink} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AddressModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // TODO: replace with the device's real detected location + reverse
  // geocoded address once location permissions/geocoding are wired up.
  const currentLocationLabel = "Mobolaji Bank Anthony Way, 3a";

  // Picking any address just closes the modal for now — swap this for
  // writing to a shared "selected address" store once one exists.
  const selectAddress = () => onClose();

  return (
    <SafeModal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: COLORS.paper }}>
        <StatusBar barStyle="dark-content" />

        {/* TODO: swap this flat placeholder for a real map (e.g.
            react-native-maps) centered on the pin — kept simple for now. */}
        <View style={{ height: 230, backgroundColor: COLORS.n100 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: insets.top + 16,
              left: 16,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={16} color={COLORS.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              position: "absolute",
              right: 16,
              bottom: 38,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "rgba(255,255,255,0.92)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="navigate-outline" size={15} color={COLORS.ink} />
          </TouchableOpacity>

          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              top: 70,
              backgroundColor: COLORS.ink,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <AppText style={{ fontSize: 11, fontWeight: "600", color: "#fff" }}>
              {currentLocationLabel}
            </AppText>
          </View>

          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              top: 100,
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: COLORS.surface,
              borderWidth: 3,
              borderColor: COLORS.support,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="home" size={20} color={COLORS.support} />
          </View>

          <View
            style={{
              position: "absolute",
              alignSelf: "center",
              bottom: 10,
              width: 44,
              height: 5,
              borderRadius: 3,
              backgroundColor: "rgba(0,0,0,0.15)",
            }}
          />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            marginTop: -20,
            paddingHorizontal: 20,
            paddingTop: 22,
          }}
        >
          <AppText
            style={{
              fontSize: 19,
              fontWeight: "700",
              color: COLORS.ink,
              marginBottom: 16,
            }}
          >
            Where should we deliver?
          </AppText>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={selectAddress}>
              <AddressRow
                icon="navigate-outline"
                label="Current location"
                detail={currentLocationLabel}
                warning="Missing address details"
              />
            </TouchableOpacity>

            {SAVED_ADDRESSES.map((address, index) => (
              <TouchableOpacity key={address.id} onPress={selectAddress}>
                <AddressRow
                  icon={address.icon}
                  label={address.label}
                  detail={address.detail}
                  showDivider={index < SAVED_ADDRESSES.length - 1}
                  onEdit={() => {
                    // TODO: navigate to an edit-address screen once it exists.
                  }}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push("/address/new" as Href);
              }}
              style={{
                marginTop: 16,
                backgroundColor: COLORS.n100,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <AppText
                style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}
              >
                Add a new address
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeModal>
  );
}
