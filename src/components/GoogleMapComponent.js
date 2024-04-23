// GoogleMapComponent.js
import React from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";

function GoogleMapComponent({ driverLocation, stops, directions }) {
  return (
    <GoogleMap
      center={driverLocation}
      zoom={12.8}
      mapContainerStyle={{ width: "100%", height: "100%" }}
    >
      {stops.map((stop, index) => (
        <Marker
          key={index}
          position={stop}
          label={String.fromCharCode(65 + index)}
        />
      ))}
      <Marker position={driverLocation} />
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}

export default GoogleMapComponent;
