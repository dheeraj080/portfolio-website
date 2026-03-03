/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@mapbox/mapbox-gl-geocoder' {
  import { IControl, ControlPosition } from 'mapbox-gl';

  export interface GeocoderOptions {
    accessToken: string;
    origin?: string;
    zoom?: number;
    flyTo?: boolean | object;
    placeholder?: string;
    proximity?: { longitude: number; latitude: number };
    trackProximity?: boolean;
    collapsed?: boolean;
    clearAndBlurOnEsc?: boolean;
    clearOnBlur?: boolean;
    minLength?: number;
    limit?: number;
    countries?: string;
    types?: string;
    bbox?: [number, number, number, number];
    filter?: (item: any) => boolean;
    localGeocoder?: (query: string) => any[];
    marker?: boolean | object;
    mapboxgl?: any;
  }

  export default class MapboxGeocoder implements IControl {
    constructor(options: GeocoderOptions);
    onAdd(map: any): HTMLElement;
    onRemove(map: any): void;
    // This was the breaking line:
    getDefaultPosition(): ControlPosition; 
    addTo(container: string | HTMLElement | any): this;
    on(event: string, callback: (result: any) => void): this;
  }
}