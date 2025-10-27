#!/usr/bin/env bash

URL="http://localhost:5173/api/gps/updateLoc"
GPS_ID="fTETsx38gK"
GPS_PASS="12345678"

# Array of [lat, lon] pairs
COORDS=(
  "3.3232,25.3123"
  "6.4233,25.3125"
  "6.5234,31.3127"
  "7.6235,26.3129"
  "3.7236,23.3131"
  "2.3237,22.3133"
)

for coord in "${COORDS[@]}"; do
  LAT="${coord%,*}"   # part before comma
  LON="${coord#*,}"   # part after comma

  BODY=$(jq -nc \
    --arg gpsId "$GPS_ID" \
    --arg gpsPass "$GPS_PASS" \
    --argjson lat "$LAT" \
    --argjson lon "$LON" \
    '{gpsId: $gpsId, gpsPass: $gpsPass, lat: $lat, lon: $lon}')

  echo "Sending: lat=$LAT lon=$LON"
  curl -s -X POST -H "Content-Type: application/json" -d "$BODY" "$URL"
  echo ""
  sleep 1
done
