import { Href, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./app-text";
import SafeModal from "./shared/safe-modal";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAddresses } from "@/hooks/cravings-now-api/address-query";

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

// TODO: move into app config — the EXPO_PUBLIC_ prefix is required for Expo
// to expose an env var to the client bundle at all.
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

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
  const { data: addresses } = useAddresses();

  // console.log(addresses);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [currentLocationLabel, setCurrentLocationLabel] = useState<string>(
    "Detecting location…",
  );

  // Only look up location while the modal is actually open, and guard
  // against setting state after it's been closed/unmounted mid-request.
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (!cancelled) setCurrentLocationLabel("Location permission denied");
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      if (cancelled) return;
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      // const [place] = await Location.reverseGeocodeAsync({
      //   latitude: position.coords.latitude,
      //   longitude: position.coords.longitude,
      // });
      // if (!cancelled) {
      //   const label = [place?.street, place?.name, place?.city]
      //     .filter(Boolean)
      //     .join(", ");
      //   setCurrentLocationLabel(label || "Current location");
      // }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  // A real map image, centered on wherever `coords` currently points — the
  // pin overlay below is drawn on top and stays visually centered, which
  // together read as "the map, at your location" without needing a full
  // interactive map library for what's otherwise a static preview.
  const staticMapUrl = coords
    ? `https://mapmap.ai/api/static-map?center=${coords.longitude},${coords.latitude}&zoom=16&size=640x400&markers=${coords.longitude},${coords.latitude}`
    : null;
  // console.log(staticMapUrl);
  const goToAddressSearch = () => {
    onClose();
    router.push({
      pathname: "/address/new",
      // Biases Google's search results toward the person's current area
      // rather than searching blind.
      params: coords
        ? { lat: String(coords.latitude), lng: String(coords.longitude) }
        : undefined,
    });
  };

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

        <View
          style={{
            height: 430,
            backgroundColor: COLORS.n100,
            overflow: "hidden",
          }}
        >
          {staticMapUrl && (
            <Image
              source={{ uri: staticMapUrl }}
              style={{ position: "absolute", width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          )}

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

            {addresses?.map((address) => (
              <TouchableOpacity key={address.id} onPress={selectAddress}>
                <AddressRow
                  icon="navigate-outline"
                  label={address?.name!}
                  detail={address.type}
                  showDivider={addresses.length > 1}
                  onEdit={() => {
                    // TODO: navigate to an edit-address screen once it exists.
                  }}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={goToAddressSearch}
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
