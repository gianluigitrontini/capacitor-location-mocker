import { registerPlugin } from '@capacitor/core';

export interface LocationMockerPlugin {
    setMockLocation(opts: { lat: number; lon: number; }): Promise<void>;
}

const LocationMocker = registerPlugin<LocationMockerPlugin>('MockLocation');

export default LocationMocker;