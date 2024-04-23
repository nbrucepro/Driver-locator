import {
    Autocomplete,
    DirectionsRenderer,
    GoogleMap,
    Marker,
    useJsApiLoader,
    useLoadScript
  } from "@react-google-maps/api";
  import { useEffect, useRef, useState } from "react";
  import { Box, ButtonGroup, Flex, HStack, Input, SkeletonText, Text } from "@chakra-ui/react";
import InformationDisplay from "./InformationDisplay";
import AutocompleteInput from "./AutocompleteInput";
import { IoMenu } from "react-icons/io5";
import GeolocationWatcher from "./GeolocationWatcher";
import RouteCalculator from "./RouteCalculator";
import GoogleMapComponent from "./GoogleMapComponent";
  
  const center = { lat: -1.939826787816454, lng: 30.0445426438232 };
  
  const stops = [
    { lat: -1.9355377074007851, lng: 30.060163829002217 },
    { lat: -1.9358808342336546, lng: 30.08024820994666 },
    { lat: -1.9489196023037583, lng: 30.092607828989397 },
    { lat: -1.9592132952818164, lng: 30.106684061788073 },
    { lat: -1.9487480402200394, lng: 30.126596781356923 },
    { lat: -1.9365670876910166, lng: 30.13020167024439 }
  ];
  
  function MainComponent() {
    const [driverLocation, setDriverLocation] = useState(center);
    const [map, setMap] = useState(null);
    const [etaToNextStop, setEtaToNextStop] = useState(null);
    const [directions, setDirections] = useState(null);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const originRef = useRef();
    const destinationRef = useRef();
    const [nextStopName, setNextStopName] = useState("");
  
    const { isLoaded } = useJsApiLoader({
      id: "google-map-script",
      googleMapsApiKey: "AIzaSyCiLbzCiqyuLRUZBZV3osNA46iXOQm2NKc",
      libraries: ["places"]
    });
  
    const { isLoaded: isScriptLoaded } = useLoadScript({
      googleMapsApiKey: "AIzaSyCiLbzCiqyuLRUZBZV3osNA46iXOQm2NKc"
    });
  
    useEffect(() => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
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
      }
    },[]);
  
    useEffect(() => {
      if (isScriptLoaded && window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const location = { lat: stops[0].lat, lng: stops[0].lng };
  
        geocoder.geocode({ location }, (results, status) => {
          if (status === "OK") {
            if (results[0]) {
                console.log(results)
              setNextStopName(results[0].formatted_address);
            } else {
              console.log("No results found");
            }
          } else {
            console.log("Geocoder failed due to: " + status);
          }
        });
      }
    }, [currentStopIndex, isScriptLoaded]);
  
    const calculateRoute = () => {
      if (isScriptLoaded && window.google && window.google.maps) {
        const directionsService = new window.google.maps.DirectionsService();
        const waypoints = stops.slice(1, -1).map(stop => ({ location: stop }));
    
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
              setDirections(result);
              setEtaToNextStop(result.routes[0].legs[0].duration.text);
            } else {
              console.error(`Error fetching directions: ${status}`);
            }
          }
        );
      }
    };
    
  
    useEffect(() => {
      calculateRoute();
    }, [driverLocation, currentStopIndex]);

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
  
    if (!isLoaded || !isScriptLoaded) {
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
              distanceToNextStop={12 + " Km"} // Set distanceToNextStop to minDistance
            />
          </Box>
        </Box>
      </Flex> 
      );
  }
  
  export default MainComponent;
  