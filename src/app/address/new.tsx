import { useCreateAddress } from "@/hooks/cravings-now-api/address-mutation";
import { usePlaceSearch, PickedPlace } from "@/hooks/use-place-search";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// TODO: extract into a shared `@/constants/theme` file.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
  brand: "#E63462",
} as const;

type AddressType = "house" | "apartment" | "office" | "other";

const TYPES: {
  key: AddressType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "house", label: "House", icon: "home-outline" },
  { key: "apartment", label: "Apartment", icon: "business-outline" },
  { key: "office", label: "Office", icon: "briefcase-outline" },
  { key: "other", label: "Other", icon: "location-outline" },
];

export type SavedAddress = PickedPlace & {
  type: AddressType;
  buildingName: string;
  floor: string;
  doorNumber: string;
  notes: string;
};

const EMPTY_FORM = { buildingName: "", floor: "", doorNumber: "", notes: "" };

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, color: COLORS.n600 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.n600}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          backgroundColor: COLORS.paper,
          borderWidth: 1,
          borderColor: COLORS.n200,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          fontSize: 13,
          color: COLORS.ink,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

export default function AddressSearchScreen() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const { results, loading } = usePlaceSearch(q);

  const [place, setPlace] = useState<PickedPlace | null>(null);
  const [type, setType] = useState<AddressType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (k: keyof typeof EMPTY_FORM) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openSheet = (p: PickedPlace) => {
    Keyboard.dismiss();
    setPlace(p);
  };

  const closeSheet = () => {
    setPlace(null);
    setType(null);
    setForm(EMPTY_FORM);
  };

  const canSave = form.buildingName.trim().length > 0;

  const createAddress = useCreateAddress();

  const handleSave = () => {
    if (!place || !type || !canSave) return;
    const address: SavedAddress = { ...place, type, ...form };
    // TODO: persist (API / store) then navigate back
    console.log(address);
    // createAddress.mutate(address);
    closeSheet();
    // router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      {/* Header + search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: COLORS.n100,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={16} color={COLORS.ink} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.n200,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 11,
          }}
        >
          <Ionicons name="search-outline" size={16} color={COLORS.n600} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search for your address"
            placeholderTextColor={COLORS.n600}
            autoFocus
            style={{ flex: 1, fontSize: 13, color: COLORS.ink, padding: 0 }}
          />
          {loading && <ActivityIndicator size="small" color={COLORS.n600} />}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={
          q.trim().length >= 3 && !loading ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 32,
                fontSize: 13,
                color: COLORS.n600,
              }}
            >
              No results. Try a nearby landmark or area.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openSheet(item)}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.n200,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="location-outline" size={18} color={COLORS.n600} />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: COLORS.ink }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{ fontSize: 12, color: COLORS.n600, marginTop: 2 }}
                numberOfLines={1}
              >
                {item.address}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {/* Bottom sheet */}

      {/* Full-page details */}
      <Modal
        visible={!!place}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => (type ? setType(null) : closeSheet())}
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 20,
                  paddingTop: 8,
                  paddingBottom: 14,
                }}
              >
                <TouchableOpacity
                  onPress={() => (type ? setType(null) : closeSheet())}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: COLORS.n100,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={type ? "chevron-back" : "close"}
                    size={16}
                    color={COLORS.ink}
                  />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: COLORS.ink,
                    }}
                    numberOfLines={1}
                  >
                    {place?.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: COLORS.n600, marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {place?.address}
                  </Text>
                </View>
              </View>

              {!type ? (
                <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: COLORS.n600,
                      marginBottom: 10,
                    }}
                  >
                    What type of place is this?
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
                  >
                    {TYPES.map((t) => (
                      <Pressable
                        key={t.key}
                        onPress={() => setType(t.key)}
                        style={({ pressed }) => ({
                          flexBasis: "47%",
                          flexGrow: 1,
                          alignItems: "center",
                          gap: 8,
                          paddingVertical: 28,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: COLORS.n200,
                          backgroundColor: pressed
                            ? COLORS.n100
                            : COLORS.surface,
                        })}
                      >
                        <Ionicons name={t.icon} size={26} color={COLORS.ink} />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: COLORS.ink,
                          }}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : (
                <>
                  <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                      gap: 14,
                      paddingHorizontal: 20,
                      paddingTop: 8,
                      paddingBottom: 20,
                    }}
                  >
                    <Field
                      label="Building name"
                      value={form.buildingName}
                      onChangeText={set("buildingName")}
                      placeholder={
                        type === "house"
                          ? "House name or number"
                          : "e.g. Palm Court"
                      }
                    />
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      {type !== "house" && (
                        <View style={{ flex: 1 }}>
                          <Field
                            label="Floor number"
                            value={form.floor}
                            onChangeText={set("floor")}
                            placeholder="e.g. 3"
                            keyboardType="number-pad"
                          />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Field
                          label="Door number"
                          value={form.doorNumber}
                          onChangeText={set("doorNumber")}
                          placeholder="e.g. 3B"
                        />
                      </View>
                    </View>
                    <Field
                      label="Additional info"
                      value={form.notes}
                      onChangeText={set("notes")}
                      placeholder="Landmark, gate color, directions…"
                      multiline
                    />
                  </ScrollView>

                  {/* Pinned footer */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 12,
                      paddingBottom: 12,
                      borderTopWidth: 1,
                      borderTopColor: COLORS.n200,
                      backgroundColor: COLORS.surface,
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={!canSave}
                      style={{
                        backgroundColor: canSave ? COLORS.brand : COLORS.n200,
                        borderRadius: 14,
                        paddingVertical: 14,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: canSave ? "#FFF" : COLORS.n600,
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                      >
                        Save address
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </SafeAreaView>
  );
}
