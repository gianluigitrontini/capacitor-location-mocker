import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import BackgroundGeolocation from 'custom-plugins/background-geolocation/backgroundGeolocation';
import MockLocation from 'custom-plugins/location-mocker/locationMocker';
import { concatMap, delay, map, of, repeat, retry, switchMap, tap } from 'rxjs';

export interface OffsetInterface {
  /**
   * Offset for 'lat' in meters
   */
  lat: number;
  /**
   * Offset for 'lon' in meters
   */
  lon: number;
}

export interface MoveToInterface {
  initialPosition: {
    lat: number;
    lon: number;
  },
  offset?: number;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  watcherId!: string;

  currentLocation: {
    lat: number;
    lon: number;
  } = {
      lat: 0,
      lon: 0
    };

  mockedLocation: {
    lat: number;
    lon: number;
  } = {
      lat: 0,
      lon: 0
    };

  /**
   * Offset in km.
   * @default 5
   */
  offset = 0.01;

  constructor(
    private platform: Platform
  ) { }

  async ngOnInit() {
    await this.platform.ready()

    this.setMockCoordinatesConBackgroundGeolocation();
  }

  private setMockCoordinatesConBackgroundGeolocation() {
    of('').pipe(
      switchMap(() => {
        console.log('0 - Rimuovo il test provider / torno al centro')
        return MockLocation.removeTestProvider();
      }),
      map(() => {
        // Starts with the real position from GPS
        BackgroundGeolocation.addWatcher(
          {
            requestPermissions: true,
            stale: true
          },
          (location) => {
            if (location) {
              console.log('1 - Posizione corrente da GPS')
              this.currentLocation = {
                lon: location.longitude,
                lat: location.latitude
              };
            }
          }
        ).then(id => setTimeout(() => BackgroundGeolocation.removeWatcher({ id }), 500));
      }),
      delay(2000),
      concatMap(() => {
        console.log('2 - Aggiungo il test provider')
        return MockLocation.addTestProvider();
      }),
      delay(2000),
      concatMap(() => MockLocation.setMockLocation(this.moveToNorth({ initialPosition: this.currentLocation }))),
      delay(2000),
      concatMap(() => MockLocation.setMockLocation(this.moveToEast({ initialPosition: this.currentLocation }))),
      delay(2000),
      concatMap(() => MockLocation.setMockLocation(this.moveToSouth({ initialPosition: this.currentLocation }))),
      delay(2000),
      concatMap(() => MockLocation.setMockLocation(this.moveToWest({ initialPosition: this.currentLocation }))),
      delay(2000),
      repeat()
    ).subscribe();
  }

  private old_generaCoordinateConOffset(actualCoordinates: { lat: number; lon: number; }, offsetInMeters: { lat: number, lon: number; }) {
    //Position, decimal degrees

    //Earth’s radius, sphere
    const earthRadius = 6378137

    //offsets in meters
    const dn = offsetInMeters.lon
    const de = offsetInMeters.lat

    //Coordinate offsets in radians
    const dLat = dn / earthRadius
    const dLon = de / (earthRadius * Math.cos(Math.PI * actualCoordinates.lat / 180))

    //OffsetPosition, decimal degrees
    let lat = actualCoordinates.lat + dLat * 180 / Math.PI
    let lon = actualCoordinates.lon + dLon * 180 / Math.PI

    return { lat, lon }
  }

  moveToNorth({ initialPosition, offset = this.offset }: MoveToInterface) {
    console.log('3 - Muovo nord')
    const r_earth = 6378;
    const pi = Math.PI;
    const new_latitude = initialPosition.lat + (offset / r_earth) * (180 / pi);

    return { lat: new_latitude, lon: initialPosition.lon }
  }

  moveToSouth({ initialPosition, offset = this.offset }: MoveToInterface) {
    console.log('5 - Muovo sud')

    const r_earth = 6378;
    const pi = Math.PI;
    const new_latitude = initialPosition.lat - (offset / r_earth) * (180 / pi);

    return { lat: new_latitude, lon: initialPosition.lon }
  }

  moveToEast({ initialPosition, offset = this.offset }: MoveToInterface) {
    console.log('4 - Muovo est')

    const r_earth = 6378;
    const pi = Math.PI;
    const new_longitude = initialPosition.lon + (offset / r_earth) * (180 / pi);

    return { lat: initialPosition.lat, lon: new_longitude }
  }

  moveToWest({ initialPosition, offset = this.offset }: MoveToInterface) {
    console.log('6 - Muovo ovest')

    const r_earth = 6378;
    const pi = Math.PI;
    const new_longitude = initialPosition.lon - (offset / r_earth) * (180 / pi);

    return { lat: initialPosition.lat, lon: new_longitude }
  }
}
