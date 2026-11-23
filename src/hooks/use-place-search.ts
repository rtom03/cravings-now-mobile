import { useEffect, useState } from "react";
import { useUserLocation } from "./location-provider";

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN!; // public pk. token

export type PickedPlace = {
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
  floorNumber?: string;
  doorNumber?: string;
};

export function usePlaceSearch(query: string) {
  const { coords } = useUserLocation();
  const [results, setResults] = useState<PickedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          access_token: TOKEN,
          country: "ng",
          autocomplete: "true",
          limit: "5",
          language: "en",
        });
        if (coords) params.set("proximity", `${coords.lng},${coords.lat}`); // lng,lat order

        const res = await fetch(
          `https://api.mapbox.com/search/geocode/v6/forward?${params}`,
          { signal: ctrl.signal },
        );
        const json = await res.json();

        setResults(
          (json.features ?? []).map((f: any) => ({
            id: f.id,
            name: f.properties.name,
            address:
              f.properties.place_formatted ?? f.properties.full_address ?? "",
            lat: f.properties.coordinates.latitude,
            lng: f.properties.coordinates.longitude,
          })),
        );
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, coords]);

  return { results, loading };
}
