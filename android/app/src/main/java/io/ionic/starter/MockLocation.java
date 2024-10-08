package io.ionic.starter;

import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

public class MockLocation {
  String providerName;
  Context context;

  public MockLocation(String name, Context context) {
    this.providerName = name;
    this.context = context;

    int powerUsage = 0;
    int accuracy = 5;

    if (Build.VERSION.SDK_INT >= 30) {
      powerUsage = 1;
      accuracy = 2;
    }

    LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    initializePlugin(locationManager, powerUsage, accuracy, /* maxRetryCount= */ 3, /* currentRetryCount= */ 0);
  }

  private void initializePlugin(LocationManager lm, int powerUsage, int accuracy, int maxRetryCount, int currentRetryCount) {
    if (currentRetryCount < maxRetryCount) {
      try {
        shutdown();
        lm.addTestProvider(providerName, false, false, false, false, false, true, true, powerUsage, accuracy);
        lm.setTestProviderEnabled(providerName, true);
      } catch (Exception e) {
        Log.e("Error", "Exception");
        initializePlugin(lm, powerUsage, accuracy, maxRetryCount, (currentRetryCount + 1));
      }
    } else {
      throw new SecurityException("Not allowed to perform MOCK_LOCATION");
    }
  }

  /**
   * Pushes the location in the system (mock). This is where the magic gets done.
   *
   * @param lat latitude
   * @param lon longitude
   * @return Void
   */
  public void pushCoordsToMock(double lat, double lon) {
    LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    Location mockLocation = new Location(providerName);

    mockLocation.setLatitude(lat);
    mockLocation.setLongitude(lon);

    mockLocation.setAltitude(3F);
    mockLocation.setTime(System.currentTimeMillis());
    //mockLocation.setAccuracy(16F);
    mockLocation.setSpeed(0.01F);
    mockLocation.setBearing(1F);
    mockLocation.setAccuracy(3F);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      mockLocation.setBearingAccuracyDegrees(0.1F);
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      mockLocation.setVerticalAccuracyMeters(0.1F);
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      mockLocation.setSpeedAccuracyMetersPerSecond(0.01F);
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
      mockLocation.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());
    }

    lm.setTestProviderLocation(providerName, mockLocation);
  }

  /**
   * Removes the provider
   *
   * @return Void
   */
  public void shutdown() {
    try {
      LocationManager lm = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
      lm.removeTestProvider(providerName);
    } catch (Exception e) {
    }
  }
}
