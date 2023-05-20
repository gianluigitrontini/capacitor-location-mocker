import { registerPlugin } from '@capacitor/core';

export interface LocationMockerPlugin {
    setMockLocation(opts: { lat: number | undefined; lon: number | undefined }): Promise<void>;
    removeTestProvider(): Promise<void>;
    addTestProvider(): Promise<void>;
}

const LocationMocker = registerPlugin<LocationMockerPlugin>('MockLocation');

export default LocationMocker;