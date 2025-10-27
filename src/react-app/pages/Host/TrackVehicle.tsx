import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import BaseURL from "@/../../BaseURL.ts";

// Custom car icon using Flaticon CSS
const carIcon = L.divIcon({
  html: '<i class="fi fi-bs-car" style="font-size: 32px; color: #3b82f6;"></i>',
  className: "custom-car-marker",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Start point marker
const startIcon = L.divIcon({
  html: '<div style="background: #10b981; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">S</div>',
  className: "start-marker",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

interface VehicleLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

interface HistoryPoint {
  lat: number;
  long: number;
  time: number;
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
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [routeHistory, setRouteHistory] = useState<[number, number][]>([]);
  const [liveRoute, setLiveRoute] = useState<[number, number][]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [reqId, setReqId] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch route history
  useEffect(() => {
    if (!reqId) return;
    
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${BaseURL}/api/gps/history/${reqId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch route history");
          return;
        }

        const data = await response.json() as { history: HistoryPoint[] };
        if (data.history && data.history.length > 0) {
          const route = data.history.map((point) => [point.lat, point.long] as [number, number]);
          setRouteHistory(route);
          console.log("Route history loaded:", route.length, "points");
        }
      } catch (err) {
        console.error("Error fetching route history:", err);
      }
    };

    fetchHistory();
  }, [reqId]);

  // Fetch reqId from gpsId
  useEffect(() => {
    if (!gpsId) return;

    const fetchReqId = async () => {
      try {
        // We'll need to fetch the reqId from the backend
        // For now, we can get it from the approvedRequests endpoint
        const response = await fetch(`${BaseURL}/api/rent/approvedRequests`, {
          credentials: "include",
        });

        if (response.ok) {
          const requests = await response.json() as Array<{ reqId: number; gpsId: string | null }>;
          const request = requests.find((req) => req.gpsId === gpsId);
          if (request) {
            setReqId(request.reqId);
          }
        }
      } catch (err) {
        console.error("Error fetching reqId:", err);
      }
    };

    fetchReqId();
  }, [gpsId]);

  useEffect(() => {
    if (!gpsId) return;
    const connectWebSocket = () => {
      try {
        setConnectionStatus("connecting");
        const wsProtocol =
          window.location.protocol === "https:" ? "wss:" : "ws:";
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
          const timeMatch = message.match(/Time:([-\d.]+)/);
          
          console.log("Parsed lat:", latMatch?.[1], "lng:", longMatch?.[1], "time:", timeMatch?.[1]);
          
          if (latMatch && longMatch && timeMatch) {
            const lat = parseFloat(latMatch[1]);
            const lng = parseFloat(longMatch[1]);
            const timestamp = new Date(parseInt(timeMatch[1]) * 1000);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Setting location:", { lat, lng });
              const newLocation = { lat, lng, timestamp: timestamp.toISOString() };
              setLocation(newLocation);
              setLastUpdateTime(timestamp);
              
              // Add to live route if this is a new position
              setLiveRoute(prevRoute => {
                const newPoint: [number, number] = [lat, lng];
                const lastPoint = prevRoute[prevRoute.length - 1];
                
                // Only add if it's significantly different from the last point (avoid duplicate points)
                if (!lastPoint || 
                    Math.abs(lastPoint[0] - lat) > 0.0001 || 
                    Math.abs(lastPoint[1] - lng) > 0.0001) {
                  return [...prevRoute, newPoint];
                }
                return prevRoute;
              });
            } else {
              console.warn("Invalid lat/lng values:", lat, lng);
            }
          } else {
            console.warn("Could not parse GPS data. Message:", message);
            // If message is "Lat:null Long:null", show default location
            if (message.includes("null")) {
              console.log("No GPS data yet, using default location");
              setLocation({
                lat: 28.6139,
                lng: 77.209,
                timestamp: new Date().toISOString(),
              });
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connecting to GPS
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Establishing real-time tracking connection...
            </p>
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
            <div className="text-6xl mb-4">
              {connectionStatus === "error" ? "" : ""}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {connectionStatus === "error"
                ? "Connection Error"
                : "Connection Lost"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {connectionStatus === "error"
                ? "Unable to connect to GPS tracking. Please check your permissions or the GPS ID."
                : "Lost connection to GPS. Attempting to reconnect..."}
            </p>
            <Button
              onClick={() => navigate(-1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go Back
            </Button>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Waiting for GPS Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Connected! Waiting for vehicle location data...
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                Connected
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {" "}
                Live Vehicle Tracking
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                GPS ID: <code className="font-mono text-sm">{gpsId}</code>
              </p>
            </div>
            <div className="flex gap-3">
              {routeHistory.length > 0 && (
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`${showHistory ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400 hover:bg-gray-500"} text-white px-6 py-2 rounded-lg font-semibold`}
                >
                  {showHistory ? "🗺️ Hide Route" : "🗺️ Show Route"} ({routeHistory.length})
                </Button>
              )}
              <Button
                onClick={() => navigate(-1)}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg font-semibold"
              >
                {" "}
                Back
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${connectionStatus === "connected" ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
            <span
              className={`text-sm font-semibold ${connectionStatus === "connected" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}
            >
              {connectionStatus === "connected"
                ? "Real-time Tracking Active"
                : "Connecting..."}
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {" "}
              Live Telemetry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Latitude
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  {location.lat.toFixed(6)}
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Longitude
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  {location.lng.toFixed(6)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Last Update
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Route Points
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {routeHistory.length > 0 ? routeHistory.length : "Loading..."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[600px] rounded-lg overflow-hidden">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Historical Route Polyline (from database) */}
                {showHistory && routeHistory.length > 0 && (
                  <>
                    <Polyline
                      positions={routeHistory}
                      pathOptions={{
                        color: "#8b5cf6",
                        weight: 4,
                        opacity: 0.6,
                        dashArray: "10, 10",
                      }}
                    />
                    {/* Start point marker */}
                    <Marker position={routeHistory[0]} icon={startIcon}>
                      <Popup>
                        <div className="text-center">
                          <p className="font-bold text-lg mb-2">🚩 Trip Start</p>
                          <p className="text-sm">
                            <strong>Lat:</strong> {routeHistory[0][0].toFixed(6)}°
                          </p>
                          <p className="text-sm">
                            <strong>Lng:</strong> {routeHistory[0][1].toFixed(6)}°
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}
                
                {/* Live Route Polyline (from WebSocket) */}
                {liveRoute.length > 1 && (
                  <Polyline
                    positions={liveRoute}
                    pathOptions={{
                      color: "#10b981",
                      weight: 5,
                      opacity: 0.8,
                      dashArray: "none",
                    }}
                  />
                )}
                
                {/* Current location marker */}
                <Marker position={[location.lat, location.lng]} icon={carIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-lg mb-2">🚗 Current Location</p>
                      <p className="text-sm">
                        <strong>Lat:</strong> {location.lat.toFixed(6)}°
                      </p>
                      <p className="text-sm">
                        <strong>Lng:</strong> {location.lng.toFixed(6)}°
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Updated: {new Date(location.timestamp).toLocaleString()}
                      </p>
                      {lastUpdateTime && (
                        <p className="text-xs text-blue-600 mt-1">
                          Live data: {lastUpdateTime.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
                
                {/* Accuracy circle for current position */}
                <Circle
                  center={[location.lat, location.lng]}
                  radius={50}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
                
                <ChangeView center={[location.lat, location.lng]} />
              </MapContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
