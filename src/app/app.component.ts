import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import MockLocation from 'plugins/location-mocker/LocationMocker';


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
    const value = await MockLocation.setMockLocation({ lat: 50, lon: 50 });
    console.log(value);
  }
}
