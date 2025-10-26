#!/usr/bin/env bash

URL="http://localhost:5173/api/gps/updateLoc"
GPS_ID="GVfF9vgMFS"
GPS_PASS="12345678"

# Array of [lat, lon] pairs
COORDS=(
  "1.3232,20.3123"
  "1.4233,20.3125"
  "1.5234,20.3127"
  "1.6235,20.3129"
  "1.7236,20.3131"
  "1.3237,20.3133"
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
