import AddressModal from "@/components/address-modal";
import { AppText } from "@/components/app-text";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { logout } from "@/lib/api/auth";
import ConfirmationModal from "@/components/shared/confirmation-modal";
import { fomarlizeName, getInitials } from "@/utils";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  support: "#0F5257",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
} as const;

interface StatColumnProps {
  value: string;
  label: string;
  showDivider?: boolean;
}

function StatColumn({ value, label, showDivider = true }: StatColumnProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        borderRightWidth: showDivider ? 1 : 0,
        borderRightColor: COLORS.n200,
      }}
    >
      <AppText style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
        {value}
      </AppText>
      <AppText style={{ fontSize: 10, color: COLORS.n600, marginTop: 2 }}>
        {label}
      </AppText>
    </View>
  );
}

interface ProfileListItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
  showDivider?: boolean;
}

function ProfileListItem({
  icon,
  label,
  onPress,
  tone = "default",
  showDivider = true,
}: ProfileListItemProps) {
  const tint = tone === "danger" ? COLORS.signal : COLORS.ink;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: COLORS.n100,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: tone === "danger" ? "#FBE3E9" : COLORS.n100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <AppText
        style={{ flex: 1, fontSize: 13, fontWeight: "500", color: tint }}
      >
        {label}
      </AppText>
      {tone === "default" && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.n200} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user); // re-renders on change

  // console.log(user);

  const [addressModalVisible, setAddressModalVisible] =
    useState<boolean>(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState<boolean>(false);

  // TODO: no auth/user store exists yet — replace with real signed-in user
  // data once one does, rather than showing a placeholder as if it's real.

  const initials = getInitials(user?.name);
  const userName = fomarlizeName(user?.name);
  const userEmail = user?.email || "your@email.com";

  // Runs only once the confirmation dialog is accepted. Navigates to login
  // regardless of whether the API call itself succeeds — if logout() fails
  // server-side, still clearing the person out locally is the safer
  // default. Flag/replace this if the backend needs to be treated as the
  // source of truth instead.
  const handleLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/(auth)/login");
    }
  };

  // TODO: no orders/addresses/favourites count source yet — "—" instead of
  // a fabricated number until real data is wired up.
  const stats = { orders: "—", addresses: "—", favourites: "—" };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Profile header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 20,
            paddingTop: 26,
            paddingBottom: 18,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: COLORS.support,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
              {initials}
            </AppText>
          </View>
          <View>
            <AppText
              style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}
            >
              {userName}
            </AppText>
            <AppText
              style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 2 }}
            >
              {userEmail}
            </AppText>
          </View>
        </View>

        {/* ── Stats ── */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: COLORS.n100,
            borderRadius: 16,
            paddingVertical: 16,
            marginHorizontal: 20,
            marginBottom: 20,
          }}
        >
          <StatColumn value={stats.orders} label="Orders" />
          <StatColumn value={stats.addresses} label="Addresses" />
          <StatColumn
            value={stats.favourites}
            label="Favourites"
            showDivider={false}
          />
        </View>

        {/* ── Menu list ── */}
        {/* TODO: confirm the Orders tab's actual route segment. */}
        <ProfileListItem
          icon="bag-outline"
          label="Order history"
          onPress={() => router.push("/(tabs)/orders" as Href)}
        />
        <ProfileListItem
          icon="location-outline"
          label="Saved addresses"
          onPress={() => setAddressModalVisible(true)}
        />

        <ProfileListItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => {
            // TODO: no notifications settings screen exists yet.
          }}
        />
        <ProfileListItem
          icon="help-circle-outline"
          label="Help & support"
          onPress={() => {
            // TODO: no help/support screen exists yet.
          }}
        />
        <ProfileListItem
          icon="log-out-outline"
          label="Log out"
          tone="danger"
          showDivider={false}
          onPress={() => setLogoutModalVisible(true)}
        />
      </ScrollView>

      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />

      <ConfirmationModal
        visible={logoutModalVisible}
        title="Log out?"
        message="Are you sure you want to logout?"
        tone="danger"
        icon="log-out-outline"
        confirmLabel="Yes"
        cancelLabel="No"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}
