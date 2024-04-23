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
//   { lat: -1.9487480402200394, lng: 30.126596781356923 },
  { lat: -1.9365670876910166, lng: 30.13020167024439 }
];

function MainComponent() {
  const [driverLocation, setDriverLocation] = useState(center);
  const [etaToNextStop, setEtaToNextStop] = useState(null);
  const [directions, setDirections] = useState(null);
  const [nextStopName, setNextStopName] = useState("");
  const [distanceToNextStop, setDistanceToNextStop] = useState("");
  const originRef = useRef();
  const destinationRef = useRef();

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: ["places"]
  });

  const handleDirectionsChange = (newDirections) => {
    // setDirections(newDirections);
    // setEtaToNextStop(newDirections.routes[0].legs[0].duration.text);
    setDirections(newDirections);
    if (newDirections && newDirections.routes.length > 0) {
      const route = newDirections.routes[0];
      const leg = route.legs[0];
      const duration = leg.duration.text;
      const distance = leg.distance.text;
      setEtaToNextStop(duration);
      setDistanceToNextStop(distance);
    }
  };

  useEffect(() => {
    if (directions) {
      // Get the next stop index based on the current stop index
      const nextStopIndex = directions.routes[0].legs[0].steps[0].end_location;
      // Reverse geocode the coordinates of the next stop to get the address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: nextStopIndex }, (results, status) => {
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
  }, [directions]);

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

      <GeolocationWatcher onLocationChange={setDriverLocation} />
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
        // p={4}
        borderRadius={"lg"}
        m={4}
        bgColor={"white"}
        shadow={"base"}
        zIndex={"1"}
        width={{base:"100%", md: "container.md"}}
      >
            <Flex px={4} justifyContent={"space-between"} alignItems={"center"} borderRadius={"lg"} py={4} mb={4} backgroundColor={"#70DC9E"}>
           <Box>
      <IoMenu fontSize={24} color={"white"} /> {/* Set color to white */}
    </Box>
            <Text fontWeight={"bold"} fontSize={24}>Startup</Text>
            </Flex>
            <Box
        p={4}
        borderRadius={"lg"}
        m={4}
        bgColor={"white"}
        shadow={"base"}
        zIndex={"1"}
        // width={{base:"100%", md: "container.md"}}
      >
        <Flex spacing={2} justifyContent={"space-between"}>
          <AutocompleteInput placeholder="Origin" value="Nyabugogo" />
          <Text fontWeight="bold" px={2}>-</Text>
          <AutocompleteInput placeholder="Destination" value="Kimironko" />
          <ButtonGroup>
          </ButtonGroup>
        </Flex>
        <InformationDisplay
          nextStopName={nextStopName}
          etaToNextStop={etaToNextStop}
          distanceToNextStop={distanceToNextStop}
        />
      </Box>
      </Box>
    </Flex>
  );
}

export default MainComponent;
