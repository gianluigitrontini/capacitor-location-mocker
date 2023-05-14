package io.ionic.starter;

import android.Manifest;
import android.location.LocationManager;
import android.location.Location;

import com.capacitorjs.plugins.geolocation.Geolocation;
import com.capacitorjs.plugins.geolocation.GeolocationPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;

@CapacitorPlugin(name = "MockLocation")
public class MockLocationPlugin extends Plugin {

  private MockLocation implementation;

  public void load() {
    implementation = new MockLocation(LocationManager.GPS_PROVIDER, getContext());
  }

  /**
   * Set a mocked location.
   */
  @PluginMethod()
  public void setMockLocation(PluginCall call) {
    Double lat = call.getDouble("lat");
    Double lng = call.getDouble("lon");

    Log.d("Lat", String.valueOf(lat));

    try {
      //        mockNetwork.pushLocation(lat, lng);
      //      implementation.pushCoordsToMock(lat, lng);
    } catch (Exception e) {
      e.printStackTrace();
      return;
    }

    JSObject ret = new JSObject();
    Log.d("Done", "Done!");
    ret.put("data", "Location pushed");
    call.resolve(ret);
  }

}
