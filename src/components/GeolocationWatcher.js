// GeolocationWatcher.js
import React, { useEffect } from "react";

function GeolocationWatcher({ onLocationChange }) {
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onLocationChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting geolocation:", error);
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [onLocationChange]);

  // This component doesn't render anything, it just handles side effects
  return null;
}

export default GeolocationWatcher;
