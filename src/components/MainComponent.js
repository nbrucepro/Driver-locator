import React, { useRef, useState, useEffect } from "react";
import { Box, ButtonGroup, Flex, SkeletonText, Text } from "@chakra-ui/react";
import { useJsApiLoader } from "@react-google-maps/api";
import GoogleMapComponent from "./GoogleMapComponent";
import AutocompleteInput from "./AutocompleteInput";
import InformationDisplay from "./InformationDisplay";
import GeolocationWatcher from "./GeolocationWatcher";
import RouteCalculator from "./RouteCalculator";
import { IoMenu } from "react-icons/io5";

const center = { lat: -1.939826787816454, lng: 30.0445426438232 };
const stops = [
    { lat: -1.9355377074007851, lng: 30.060163829002217 },
    { lat: -1.9358808342336546, lng: 30.08024820994666 },
    { lat: -1.9489196023037583, lng: 30.092607828989397 },
    { lat: -1.9592132952818164, lng: 30.106684061788073 },
    { lat: -1.9487480402200394, lng: 30.126596781356923 },
    { lat: -1.9365670876910166, lng: 30.13020167024439 },
];

function MainComponent() {
  const [driverLocation2, setDriverLocation2] = useState(center);
  const [driverLocation, setDriverLocation] = useState(center);
  const [etaToNextStop, setEtaToNextStop] = useState(null);
  const [directions, setDirections] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [nextStopName, setNextStopName] = useState("");
  const [minDistance, setMinDistance] = useState(Number.MAX_VALUE); // Define minDistance state
  const originRef = useRef();
  const destinationRef = useRef();

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: ["places"]
  });

  const calculateDistance = (point1, point2) => {
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180); // Convert degrees to radians
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  useEffect(() => {
    if (driverLocation && stops) {
      let minDist = Number.MAX_VALUE;
      let nearest = null;
      stops.forEach(stop => {
        const distance = calculateDistance(driverLocation, stop);
        if (distance < minDist) {
          minDist = distance;
          nearest = stop;
        }
      });
      setNearestStop(nearest);
      setMinDistance(minDist); // Set minDistance state
    }
  }, [driverLocation, stops]);
//   useEffect(() => {
//     if (directions && window.google && window.google.maps) {
//       const nextStopIndex = directions.routes[0].legs[0].steps[0].end_location;
//       const geocoder = new window.google.maps.Geocoder();
//       geocoder.geocode({ location: nextStopIndex }, (results, status) => {
//         if (status === "OK") {
//           if (results[0]) {
            
//             setNextStopName(results[0].formatted_address.split(",")[0]);
//           } else {
//             console.log("No results found");
//           }
//         } else {
//           console.log("Geocoder failed due to: " + status);
//         }
//       });
//     }
//   }, [directions]);
useEffect(() => {
    if (nearestStop && stops&& window.google && window.google.maps) {
      const nearestStopIndex = stops.findIndex(stop => stop === nearestStop);
      const nextStopIndex = nearestStopIndex + 1;
      if (nextStopIndex < stops.length) {
        const nextStop = stops[nextStopIndex];
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: nextStop }, (results, status) => {
          if (status === "OK") {
            if (results[0]) {
              setNextStopName(results[0].formatted_address.split(",")[0]);
            } else {
              console.log("No results found");
            }
          } else {
            console.log("Geocoder failed due to: " + status);
          }
        });
      }
    }
  }, [nearestStop, stops]);
  

  const handleDirectionsChange = (newDirections) => {
    setDirections(newDirections);
    if (newDirections && newDirections.routes.length > 0) {
      const route = newDirections.routes[0];
      const leg = route.legs[0];
      const duration = leg.duration.text;
      const distance = leg.distance.text;
      setEtaToNextStop(duration);
    }
  };

  if (!isLoaded) {
    return <SkeletonText />;
  }

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      <GeolocationWatcher onLocationChange={setDriverLocation2} />
      <RouteCalculator
        driverLocation={driverLocation}
        stops={stops}
        onDirectionsChange={handleDirectionsChange}
        onEtaChange={setEtaToNextStop}
      />
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMapComponent
          driverLocation={driverLocation}
          stops={stops}
          directions={directions}
        />
      </Box>
      <Box
        borderRadius={"lg"}
        m={4}
        bgColor={"white"}
        shadow={"base"}
        zIndex={"1"}
        width={{ base: "100%", md: "container.md" }}
      >
        <Flex
          px={4}
          justifyContent={"space-between"}
          alignItems={"center"}
          borderRadius={"lg"}
          py={4}
          mb={4}
          backgroundColor={"#70DC9E"}
        >
          <Box>
            <IoMenu fontSize={24} color={"white"} /> {/* Set color to white */}
          </Box>
          <Text fontWeight={"bold"} fontSize={24}>
            Startup
          </Text>
        </Flex>
        <Box p={4}>
          <Flex spacing={2} justifyContent={"space-between"}>
            <AutocompleteInput placeholder="Origin" value="Nyabugogo" />
            <Text fontWeight="bold" px={2}>
              -
            </Text>
            <AutocompleteInput placeholder="Destination" value="Kimironko" />
            <ButtonGroup></ButtonGroup>
          </Flex>
          <InformationDisplay
            nextStopName={nextStopName}
            etaToNextStop={etaToNextStop}
            distanceToNextStop={minDistance.toFixed(1) + " Km"} // Set distanceToNextStop to minDistance
          />
        </Box>
      </Box>
    </Flex>
  );
}

export default MainComponent;
