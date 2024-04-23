// AutocompleteInput.js
import React from "react";
import { Input } from "@chakra-ui/react";

function AutocompleteInput({ placeholder, value }) {
  return (
    <Input isReadOnly type="text" placeholder={placeholder} value={value} />
  );
}

export default AutocompleteInput;
