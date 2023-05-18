import { Component, OnInit } from '@angular/core';
import { tick } from '@angular/core/testing';
import { Geolocation } from '@capacitor/geolocation';
import { Platform } from '@ionic/angular';
import MockLocation from 'custom-plugins/location-mocker/locationMocker';
import { BehaviorSubject, Subject, concatMap, delay, from, interval, map, mapTo, mergeMap, take, tap, timer, zip } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform
  ) { }

  async ngOnInit() {
    await this.platform.ready()

    let coordinateAttuali = {
      lat: 0,
      lon: 0
    }

    await Geolocation.watchPosition({ enableHighAccuracy: true, maximumAge: 1000 }, async (position) => {
      // console.log('posizione:', position)

      if (position?.coords) {
        coordinateAttuali = {
          lat: position?.coords.latitude,
          lon: position?.coords.longitude
        }
      }
    });

    const offsets = [
      { lat: 10, lon: 0 },
      { lat: 0, lon: 10 },
      { lat: -10, lon: 0 },
      { lat: 0, lon: -10 }
    ];
    setInterval(() => {

      from(offsets).pipe(
        concatMap(offset => timer(2000).pipe(
          concatMap(() => {
            console.log('Eseguo', offset);

            const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, offset);

            return MockLocation.setMockLocation({
              lat: newOffsetLat,
              lon: newOffsetLon
            });
          })
        ))
      ).subscribe(() => { });
    }, 8000)

    // setInterval(() => {
    //   from(offsets)
    //     .pipe(
    //       concatMap((offset) =>
    //         timer(2000).pipe(
    //           concatMap(() => {
    //             const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, offset);

    //             return MockLocation.setMockLocation({
    //               lat: newOffsetLat,
    //               lon: newOffsetLon
    //             });
    //           })
    //         )
    //       )
    //     )
    //     .subscribe(() => { });
    // }, 8000)


    // const testSetInterval = async () => {
    //   setTimeout(async () => {
    //     const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 10, lon: 0 })

    //     await MockLocation.setMockLocation({
    //       lat: newOffsetLat,
    //       lon: newOffsetLon
    //     });
    //   }, 2000)

    //   setTimeout(async () => {
    //     const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 0, lon: 10 })

    //     await MockLocation.setMockLocation({
    //       lat: newOffsetLat,
    //       lon: newOffsetLon
    //     });

    //   }, 4000)

    //   setTimeout(async () => {
    //     const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: -10, lon: 0 })

    //     await MockLocation.setMockLocation({
    //       lat: newOffsetLat,
    //       lon: newOffsetLon
    //     });
    //   }, 6000)

    //   setTimeout(async () => {
    //     const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 0, lon: -10 })

    //     await MockLocation.setMockLocation({
    //       lat: newOffsetLat,
    //       lon: newOffsetLon
    //     });
    //   }, 8000)

    // }

    // setInterval(async () => {
    //   testSetInterval()
    // }, 8000)



    // setInterval(async () => {
    //   console.log('Setto posizione con le nuove coordinate')

    //   setInterval(async () => {
    //     console.log('Setto posizione con le nuove coordinate')

    //     const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 10, lon: 0 })

    //     await MockLocation.setMockLocation({
    //       lat: newOffsetLat,
    //       lon: newOffsetLon
    //     });

    //     setInterval(async () => {
    //       console.log('Setto posizione con le nuove coordinate')

    //       const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 0, lon: 10 })

    //       await MockLocation.setMockLocation({
    //         lat: newOffsetLat,
    //         lon: newOffsetLon
    //       });

    //       setInterval(async () => {
    //         console.log('Setto posizione con le nuove coordinate')

    //         const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: -10, lon: 0 })

    //         await MockLocation.setMockLocation({
    //           lat: newOffsetLat,
    //           lon: newOffsetLon
    //         });

    //         setInterval(async () => {
    //           console.log('Setto posizione con le nuove coordinate')

    //           const { lat: newOffsetLat, lon: newOffsetLon } = this.generaCoordinateConOffset(coordinateAttuali, { lat: 0, lon: -10 })

    //           await MockLocation.setMockLocation({
    //             lat: newOffsetLat,
    //             lon: newOffsetLon
    //           });
    //         }, 2000)
    //       }, 2000)
    //     }, 2000)
    //   }, 2000)

    // }, 10000)
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
}
