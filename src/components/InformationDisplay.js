// InformationDisplay.js
import React from "react";
import { HStack, Text } from "@chakra-ui/react";

function InformationDisplay({ nextStopName, etaToNextStop }) {
  return (
    <HStack
      flexDirection={{ base: "column", md: "row" }}
      spacing={4}
      mt={4}
      justifyContent={"space-between"}
    >
      <Text>Next stop: {nextStopName}</Text>
      <Text>Time: {etaToNextStop}</Text>
    </HStack>
  );
}

export default InformationDisplay;
