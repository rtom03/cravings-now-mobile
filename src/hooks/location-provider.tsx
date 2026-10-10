import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export type Coords = { lat: number; lng: number };
export type Place = {
  name: string;
  city: string | null;
  region: string | null;
  country: string | null;
};
type Status = "loading" | "granted" | "denied" | "blocked";

type Ctx = {
  coords: Coords | null;
  place: Place | null;
  status: Status;
  retry: () => Promise<void>;
  openSettings: () => void;
};

const CACHE_KEY = "last_location_v1";
const LocationContext = createContext<Ctx | null>(null);

const toPlace = (a: Location.LocationGeocodedAddress): Place => ({
  name:
    [a.name, a.street, a.district].filter(Boolean).join(", ") ||
    a.city ||
    "Unknown location",
  city: a.city ?? a.subregion ?? null,
  region: a.region ?? null,
  country: a.country ?? null,
});

const resolvePlace = async (
  lat: number,
  lng: number,
): Promise<Place | null> => {
  try {
    const [addr] = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    return addr ? toPlace(addr) : null;
  } catch {
    return null;
  }
};

const movedEnough = (a: Coords | null, b: Coords) =>
  !a || Math.abs(a.lat - b.lat) > 0.002 || Math.abs(a.lng - b.lng) > 0.002; // ~200m

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const lastGeocoded = useRef<Coords | null>(null);

  // set coords immediately, geocode only if we moved (or have no place yet)
  const applyFix = useCallback(async (next: Coords) => {
    setCoords(next);
    if (!movedEnough(lastGeocoded.current, next)) return;
    lastGeocoded.current = next;
    const p = await resolvePlace(next.lat, next.lng);
    if (p) {
      setPlace(p);
      AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ coords: next, place: p }),
      ).catch(() => {});
    }
  }, []);

  const init = useCallback(async () => {
    // 1. cached place from last session -> available in ms
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { coords: Coords; place: Place };
        setCoords((c) => c ?? cached.coords);
        setPlace((p) => p ?? cached.place);
        lastGeocoded.current = cached.coords;
      }
    } catch {}

    // 2. permission
    let perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== "granted" && perm.canAskAgain) {
      perm = await Location.requestForegroundPermissionsAsync();
    }
    if (perm.status !== "granted") {
      setStatus(perm.canAskAgain ? "denied" : "blocked");
      return;
    }
    setStatus("granted");

    // 3. last known fix from the OS -> near-instant, may be null
    const last = await Location.getLastKnownPositionAsync();
    if (last) {
      applyFix({ lat: last.coords.latitude, lng: last.coords.longitude }); // not awaited on purpose
    }

    // 4. fresh fix -> refines coords/place if we moved
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    applyFix({ lat: pos.coords.latitude, lng: pos.coords.longitude });
  }, [applyFix]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <LocationContext.Provider
      value={{
        coords,
        place,
        status,
        retry: init,
        openSettings: () => Linking.openSettings(),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useUserLocation must be used inside <LocationProvider>");
  return ctx;
}
