import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import * as Location from "expo-location";

export type Coords = { lat: number; lng: number };
export type Place = {
  name: string;
  city: string | null;
  region: string | null;
  country: string | null;
};

type Status = "loading" | "granted" | "denied" | "blocked";

export function useUserLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [place, setPlace] = useState<Place | null>(null);

  const init = useCallback(async () => {
    // already granted earlier -> no prompt
    let perm = await Location.getForegroundPermissionsAsync();

    // only ask if never granted and OS still allows prompting
    if (perm.status !== "granted" && perm.canAskAgain) {
      perm = await Location.requestForegroundPermissionsAsync();
    }

    if (perm.status !== "granted") {
      setStatus(perm.canAskAgain ? "denied" : "blocked");
      return;
    }

    setStatus("granted");
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    setCoords({ lat, lng });
    setPlace(await resolvePlace(lat, lng));
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  // user permanently denied -> only Settings can fix it
  const openSettings = () => Linking.openSettings();

  //   return { coords, status, retry: init, openSettings };
  return { coords, place, status, setCoords, retry: init, openSettings };
}

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
    return null; // geocoder can fail (offline, rate-limited); coords still valid
  }
};
