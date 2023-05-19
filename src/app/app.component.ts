import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
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
  coordinateAttuali = {
    lat: 0,
    lon: 0
  }

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

    // await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 12000 }, async (position) => {
    //       if (position?.coords) {
    //         this.coordinateAttuali = {
    //           lat: position?.coords.latitude,
    //           lon: position?.coords.longitude
    //         }
    //       }
    //     });

    this.setMockCoordinates(this.offsets); // durata totale 8 secondi (8000ms)

    // Dopo 10 secondi continua ad eseguire la funzione in loop
    setInterval(() => {
      this.setMockCoordinates(this.offsets)
    }, 10000)
  }

  private setMockCoordinates(listaOffsets: OffsetInterface[]) {
    from(listaOffsets).pipe(
      concatMap(offset => timer(2000).pipe(
        concatMap(() => {
          if (!offset.useRealPosition) {
            return this.settaCoordinate(offset)
          } else {
            console.log('Rimuovo il test provider');
            MockLocation.removeTestProvider();
            console.log('Fetcho la vera posizione');
            this.getRealPosition();
            MockLocation.addTestProvider();
            console.log('Setto la vera posizione come mock');
            return this.settaCoordinate(offset)
          }
        })
      ))
    ).subscribe(() => {
    });
  }

  private settaCoordinate(offset: any) {
    const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(this.coordinateAttuali, offset);

    return MockLocation.setMockLocation({
      lat: newOffsetLat,
      lon: newOffsetLon
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
    const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 2000 });

    this.coordinateAttuali = {
      lat: coords.latitude,
      lon: coords.longitude
    }

    console.log('Coordinate vere', this.coordinateAttuali);
  }
}
