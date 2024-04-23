// RouteCalculator.js
import React, { useEffect, useState } from "react";

function RouteCalculator({
  driverLocation,
  stops,
  onDirectionsChange,
  onEtaChange,
}) {
  const [nextStopName, setNextStopName] = useState("");

  useEffect(() => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      const location = { lat: stops[0].lat, lng: stops[0].lng };

      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            setNextStopName(results[0].formatted_address);
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      });
    }
  }, [stops]);

  const calculateRoute = () => {
    if (window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      const waypoints = stops.slice(1, -1).map((stop) => ({ location: stop }));

      directionsService.route(
        {
          origin: driverLocation,
          destination: stops[stops.length - 1],
          waypoints: waypoints,
          optimizeWaypoints: true, // Optimize the order of waypoints
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            onDirectionsChange(result);
            onEtaChange(result.routes[0].legs[0].duration.text);
          } else {
            console.error(`Error fetching directions: ${status}`);
          }
        }
      );
    }
  };

  useEffect(() => {
    calculateRoute();
  }, [driverLocation, stops]);

  return null; 
}

export default RouteCalculator;
