import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import BackgroundGeolocation from 'custom-plugins/background-geolocation/backgroundGeolocation';
import MockLocation from 'custom-plugins/location-mocker/locationMocker';
import { concatMap, from, timer } from 'rxjs';

export interface OffsetInterface {
  lat: number;
  lon: number;
  useRealPosition: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  currentLocation: {
    lat: number;
    lon: number;
  } = {
      lat: 0,
      lon: 0
    };

  offsets: OffsetInterface[] = [
    { lat: 0, lon: 0, useRealPosition: true },
    { lat: 5, lon: 0, useRealPosition: false },
    { lat: -5, lon: 5, useRealPosition: false },
    { lat: -5, lon: -5, useRealPosition: false },
    { lat: 5, lon: -5, useRealPosition: false },
  ]

  constructor(
    private platform: Platform
  ) { }

  async ngOnInit() {
    await this.platform.ready()

    this.rxjs_setMockCoordinatesConBackgroundGeolocation(this.offsets)

    setInterval(() => {
      this.rxjs_setMockCoordinatesConBackgroundGeolocation(this.offsets)
    }, 10000)
  }

  // private async setMockCoordinates(listaOffsets: OffsetInterface[]) {
  //   listaOffsets.map(
  //     async (offset, i) => {
  //       if (offset.useRealPosition) {
  //         MockLocation.removeTestProvider();

  //         const { coords } = await Geolocation.getCurrentPosition();

  //         MockLocation.addTestProvider();

  //         await MockLocation.setMockLocation({
  //           lat: coords.latitude,
  //           lon: coords.longitude
  //         });

  //       } else {
  //         setTimeout(
  //           async () => {
  //             const { coords } = await Geolocation.getCurrentPosition();
  //             const coordinate = { lat: coords.latitude, lon: coords.longitude };
  //             this.settaMockLocationConOffset(coordinate, offset)
  //           }, 2000 * i)
  //       }
  //     })
  // }

  // private rxjs_setMockCoordinates(listaOffsets: OffsetInterface[]) {
  //   from(listaOffsets).pipe(
  //     concatMap((offset, i) => timer(2000).pipe(
  //       concatMap(async () => {
  //         if (offset.useRealPosition) {
  //           MockLocation.removeTestProvider();

  //           const { coords } = await Geolocation.getCurrentPosition();

  //           MockLocation.addTestProvider();

  //           MockLocation.setMockLocation({
  //             lat: coords.latitude,
  //             lon: coords.longitude
  //           });

  //         } else {
  //           const { coords } = await Geolocation.getCurrentPosition();
  //           const coordinate = { lat: coords.latitude, lon: coords.longitude };
  //           this.settaMockLocationConOffset(coordinate, offset)
  //         }

  //         if (i == listaOffsets.length - 1) {
  //           this.rxjs_setMockCoordinates(listaOffsets);
  //         }
  //         // if (!offset.useRealPosition) {
  //         //   return this.settaMockLocationDaOffset(offset)
  //         // } else {
  //         //   console.log('Rimuovo il test provider');
  //         //   MockLocation.removeTestProvider();
  //         //   console.log('Fetcho la vera posizione');
  //         //   this.getRealPosition();
  //         //   MockLocation.addTestProvider();
  //         //   console.log('Setto la vera posizione come mock');

  //         //   return this.settaMockLocationDaOffset(offset) // in questo caso l'offset è 0
  //         // }
  //       })
  //     ))
  //   ).subscribe(() => {
  //   });
  // }

  private rxjs_setMockCoordinatesConBackgroundGeolocation(listaOffsets: OffsetInterface[]) {
    from(listaOffsets).pipe(
      concatMap((offset, i) => timer(2000).pipe(
        concatMap(async () => {
          if (offset.useRealPosition) {
            MockLocation.removeTestProvider();

            BackgroundGeolocation.addWatcher({ requestPermissions: false, stale: true }, (location) => {
              let currentLocation = { longitude: location?.longitude, latitude: location?.latitude };
              if (currentLocation.latitude && currentLocation.longitude) {
                this.currentLocation = { lat: currentLocation.latitude, lon: currentLocation.longitude };
                MockLocation.removeTestProvider();
                MockLocation.addTestProvider();

                MockLocation.setMockLocation({
                  lat: this.currentLocation.lat,
                  lon: this.currentLocation.lon
                });
              }
            }
            ).then((id) => {
              setTimeout(() => BackgroundGeolocation.removeWatcher({ id }), 2000);
            });
          } else {
            const coordinate = { lat: this.currentLocation.lat, lon: this.currentLocation.lon };
            this.settaMockLocationConOffset(coordinate, offset)
          }

        })
      ))
    ).subscribe(() => {
    });
  }

  private settaMockLocationConOffset(coordinate: { lat: number; lon: number; }, offset: any) {
    const { lat: nuovaLatitudineConOffset, lon: nuovaLongitudineConOffset } = this.generaCoordinateConOffset(coordinate, offset);

    return MockLocation.setMockLocation({
      lat: nuovaLatitudineConOffset,
      lon: nuovaLongitudineConOffset
    });
  }

  private settaMockLocation(coordinate: any) {
    return MockLocation.setMockLocation({
      lat: coordinate.lat,
      lon: coordinate.lon
    });
  }

  private generaCoordinateConOffset(actualCoordinates: { lat: number; lon: number; }, offsetInMeters: { lat: number, lon: number; }) {
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

  private async getRealPosition() {
    MockLocation.removeTestProvider();

    const { coords } = await Geolocation.getCurrentPosition();

    this.currentLocation = {
      lat: coords.latitude,
      lon: coords.longitude
    }

    MockLocation.addTestProvider();
  }
}
