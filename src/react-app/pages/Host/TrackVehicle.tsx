import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import BaseURL from "@/../../BaseURL.ts";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom car icon using Flaticon CSS
const carIcon = L.divIcon({
  html: '<i class="fi fi-bs-car" style="font-size: 32px; color: #3b82f6;"></i>',
  className: 'custom-car-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface VehicleLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function TrackVehicle(): React.ReactElement {
  const { gpsId } = useParams<{ gpsId: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<VehicleLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!gpsId) return;
    const connectWebSocket = () => {
      try {
        setConnectionStatus("connecting");
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsBaseUrl = BaseURL.replace(/^https?:/, wsProtocol);
        const ws = new WebSocket(`${wsBaseUrl}/api/gps/track/${gpsId}`);
        ws.onopen = () => {
          console.log("WebSocket connected");
          setConnectionStatus("connected");
          setLoading(false);
        };
        ws.onmessage = (event) => {
          console.log("Received GPS data:", event.data);
          const message = event.data as string;
          const latMatch = message.match(/Lat:([-\d.]+)/);
          const longMatch = message.match(/Long:([-\d.]+)/);
          console.log("Parsed lat:", latMatch?.[1], "lng:", longMatch?.[1]);
          if (latMatch && longMatch) {
            const lat = parseFloat(latMatch[1]);
            const lng = parseFloat(longMatch[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Setting location:", { lat, lng });
              setLocation({ lat, lng, timestamp: new Date().toISOString() });
            } else {
              console.warn("Invalid lat/lng values:", lat, lng);
            }
          } else {
            console.warn("Could not parse GPS data. Message:", message);
            // If message is "Lat:null Long:null", show default location
            if (message.includes("null")) {
              console.log("No GPS data yet, using default location");
              setLocation({ lat: 28.6139, lng: 77.2090, timestamp: new Date().toISOString() });
            }
          }
        };
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("error");
          setLoading(false);
        };
        ws.onclose = () => {
          console.log("WebSocket disconnected");
          setConnectionStatus("disconnected");
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.CLOSED) {
              connectWebSocket();
            }
          }, 5000);
        };
        wsRef.current = ws;
      } catch (err) {
        console.error("Failed to connect WebSocket:", err);
        setConnectionStatus("error");
        setLoading(false);
      }
    };
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [gpsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connecting to GPS</h2>
            <p className="text-gray-600 dark:text-gray-300">Establishing real-time tracking connection...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "error" || connectionStatus === "disconnected") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">{connectionStatus === "error" ? "" : ""}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{connectionStatus === "error" ? "Connection Error" : "Connection Lost"}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{connectionStatus === "error" ? "Unable to connect to GPS tracking. Please check your permissions or the GPS ID." : "Lost connection to GPS. Attempting to reconnect..."}</p>
            <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-6xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Waiting for GPS Data</h2>
            <p className="text-gray-600 dark:text-gray-300">Connected! Waiting for vehicle location data...</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">Connected</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white"> Live Vehicle Tracking</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">GPS ID: <code className="font-mono text-sm">{gpsId}</code></p>
            </div>
            <Button onClick={() => navigate(-1)} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-semibold"> Back</Button>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === "connected" ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <span className={`text-sm font-semibold ${connectionStatus === "connected" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>{connectionStatus === "connected" ? "Real-time Tracking Active" : "Connecting..."}</span>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4"> Live Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latitude</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{location.lat.toFixed(6)}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longitude</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{location.lng.toFixed(6)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Update</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{new Date(location.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[600px] rounded-lg overflow-hidden">
              <MapContainer center={[location.lat, location.lng]} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[location.lat, location.lng]} icon={carIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-lg mb-2">🚗 Vehicle Location</p>
                      <p className="text-sm"><strong>Lat:</strong> {location.lat.toFixed(6)}°</p>
                      <p className="text-sm"><strong>Lng:</strong> {location.lng.toFixed(6)}°</p>
                      <p className="text-xs text-gray-600 mt-2">Updated: {new Date(location.timestamp).toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
                <ChangeView center={[location.lat, location.lng]} />
              </MapContainer>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400"> Using WebSocket for real-time GPS tracking via Cloudflare Durable Objects</p>
        </motion.div>
      </div>
    </div>
  );
}
