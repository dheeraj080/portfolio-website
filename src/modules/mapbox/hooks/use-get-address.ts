import { useState, useEffect } from "react";
import { Feature, FeatureCollection, Point } from "geojson";

export interface MapboxFeature extends Feature {
  geometry: Point;
  properties: {
    full_address: string;
    name: string;
    place_formatted: string;
    context: {
      country: {
        country_code: string;
        name: string;
      };
      locality: {
        name: string;
      } | null;
      place: {
        name: string;
      } | null;
      region: {
        name: string;
      } | null;
    };
  };
}

export interface MapboxReverseGeocodingResponse extends FeatureCollection {
  features: MapboxFeature[];
  query: [number, number];
}

export type AddressData = MapboxReverseGeocodingResponse | null;

type LocationState = {
  data: MapboxReverseGeocodingResponse | null;
  isLoading: boolean;
  error: string | null;
};

interface UseGetLocationProps {
  lat: number;
  lng: number;
}

export const useGetAddress = ({ lat, lng }: UseGetLocationProps) => {
  const [state, setState] = useState<LocationState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "ECarryPhotography/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if there is an error from Nominatim (e.g. invalid coords) 
        if (data.error) {
          throw new Error(data.error);
        }

        const address = data.address || {};
        
        // Map Nominatim to Mapbox response structure
        const mappedData: MapboxReverseGeocodingResponse = {
          type: "FeatureCollection",
          query: [lng, lat],
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [Number(data.lon) || lng, Number(data.lat) || lat],
              },
              properties: {
                full_address: data.display_name || "",
                name: data.name || address.city || address.town || address.village || "",
                place_formatted: data.display_name || "",
                context: {
                  country: {
                    country_code: (address.country_code || "us").toUpperCase(),
                    name: address.country || "",
                  },
                  locality: address.suburb ? { name: address.suburb } : null,
                  place: address.city || address.town || address.village ? 
                         { name: address.city || address.town || address.village } : null,
                  region: address.state ? { name: address.state } : null,
                },
              },
            }
          ]
        };
        
        setState({ data: mappedData, isLoading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch location",
        });
      }
    };

    fetchLocation();
  }, [lat, lng]);

  return state;
};
