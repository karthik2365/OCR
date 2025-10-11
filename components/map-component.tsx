"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mountain, MapPin, Route } from "lucide-react"

// Fix Leaflet marker icon issues
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
import iconRetina from "leaflet/dist/images/marker-icon-2x.png"

// Define the NaturalFeature type
interface NaturalFeature {
  id: number
  name: string
  lat: number
  lon: number
  natural: string
  tags: Record<string, string>
}

// Define props for the component
interface MapComponentProps {
  destinationCoordinates: [number, number] | null
  originCoordinates: [number, number] | null
  onFeaturesFetched: (features: NaturalFeature[]) => void;
}

// Component to recenter the map when coordinates change
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

// Function to format distance in meters to kilometers
const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(1)} km`
}

export default function MapComponent({ destinationCoordinates, originCoordinates, onFeaturesFetched }: MapComponentProps) {
  const [features, setFeatures] = useState<NaturalFeature[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<{ coordinates: [number, number][], distance: number, duration: number } | null>(null)

  // Determine map center and zoom based on available coordinates
  const defaultPosition: [number, number] = [20.5937, 78.9629]
  let mapCenter = destinationCoordinates || defaultPosition
  let mapZoom = 13
  
  if (originCoordinates && destinationCoordinates) {
      const bounds = L.latLngBounds(originCoordinates, destinationCoordinates)
      mapCenter = [bounds.getCenter().lat, bounds.getCenter().lng]
      mapZoom = 10 
  } else if (destinationCoordinates) {
      mapCenter = destinationCoordinates
      mapZoom = 13 
  }

  // Fix Leaflet's default icon issue - Dependency array MUST be empty to run once.
  useEffect(() => {
    // This is wrapped to ensure it only runs once and avoids the Fast Refresh error.
    if (typeof window !== 'undefined') {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconUrl: icon.src,
            iconRetinaUrl: iconRetina.src,
            shadowUrl: iconShadow.src,
        })
    }
  }, []) 

  // --- FEATURE (HILLS/MOUNTAINS) FETCHING ---
  useEffect(() => {
    async function fetchFeatures() {
      if (!destinationCoordinates) {
        setFeatures([])
        onFeaturesFetched([]); 
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [lat, lon] = destinationCoordinates
        const radius = 10000 
        const query = `
          [out:json];
          (
            node["natural"="peak"](around:${radius},${lat},${lon});
            node["natural"="mountain"](around:${radius},${lat},${lon});
            node["natural"="hill"](around:${radius},${lat},${lon});
          );
          out center;
        `
        
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        const data = await response.json()

        let featureData: NaturalFeature[] = [];
        if (data && data.elements) {
          featureData = data.elements
            .map((element: any, index: number) => {
              const featureLat = element.lat || element.center?.lat
              const featureLon = element.lon || element.center?.lon
              const featureName = element.tags?.name || element.tags?.natural || "Unnamed Feature"
              
              return {
                id: element.id || index,
                name: featureName,
                lat: featureLat,
                lon: featureLon,
                natural: element.tags?.natural,
                tags: element.tags || {},
              }
            })
            .filter((feature: any) => feature.lat && feature.lon)
        }

        setFeatures(featureData)
        onFeaturesFetched(featureData); 

      } catch (err) {
        console.error("Error fetching natural features:", err)
        setError("Failed to fetch nearby hills and mountains. Please try again.")
        onFeaturesFetched([]); 
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [destinationCoordinates, onFeaturesFetched]) 

  // --- ROUTING FETCHING ---
  useEffect(() => {
    async function fetchRoute() {
      if (!originCoordinates || !destinationCoordinates) {
        setRouteData(null)
        return
      }

      const [startLat, startLon] = originCoordinates
      const [endLat, endLon] = destinationCoordinates
      
      const profile = "driving" 
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${startLon},${startLat};${endLon},${endLat}?overview=full&alternatives=false&steps=false`
      
      try {
        const response = await fetch(osrmUrl)
        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const decodedCoords = decodePolyline(route.geometry, 5)
          
          setRouteData({
            coordinates: decodedCoords,
            distance: route.distance, 
            duration: route.duration, 
          })
          
        } else {
          setRouteData(null)
        }
      } catch (err) {
        if (!loading) setError("Failed to calculate route. Check addresses or try again.")
        setRouteData(null)
      }
    }

    fetchRoute()
  }, [originCoordinates, destinationCoordinates])
  
  // Custom Polyline decoding function for OSRM
  const decodePolyline = (str: string, precision: number): [number, number][] => {
    let index = 0, lat = 0, lng = 0, coordinates: [number, number][] = [],
        shift = 0, result = 0, byte = null,
        latitude_change, longitude_change,
        factor = Math.pow(10, precision || 5);

    while (index < str.length) {
        // latitude
        shift = 0; result = 0;
        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += latitude_change;

        // longitude
        shift = 0; result = 0;
        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }
    return coordinates;
  };
  
  // Custom marker for Origin
  const originIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2RhNGYwZiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDEwYTYgNiAwIDAgMC0xMiAwYzAgNy02IDktNiA5aDE4cy02LTItNi05eiIvPjxwYXRoIGQ9Ik0xMiAxMmMxLjEwNSAwIDItLjg5NSAyLTJTMTMuMTA1IDggMTIgOHMtMiAuODk1LTIgMmMwIDEuMTA1Ljg5NSAyIDIgMnoiLz48L3N2Zz4=',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -20],
  });


  return (
    <div className="relative">
      {/* Route Information Overlay */}
      {routeData && (
        <Card className="absolute top-4 left-4 z-[500] bg-white shadow-lg">
          <CardContent className="p-3 flex items-center gap-4">
            <Route className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-blue-800">Route Summary (Driving)</p>
              <p className="text-sm">Distance: <span className="font-semibold">{formatDistance(routeData.distance)}</span></p>
              <p className="text-sm">Duration: <span className="font-semibold">{Math.round(routeData.duration / 60)} mins</span></p>
            </div>
          </CardContent>
        </Card>
      )}

      <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "600px", width: "100%" }} className="z-0">
        <ChangeView center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Draw Route Polyline */}
        {routeData && (
            <Polyline 
                positions={routeData.coordinates} 
                color="#0066FF" 
                weight={6} 
                opacity={0.8} 
            />
        )}

        {/* Origin Location marker */}
        {originCoordinates && (
          <Marker position={originCoordinates} icon={originIcon}>
            <Popup><strong>Origin: Your Address</strong></Popup>
          </Marker>
        )}

        {/* Destination Location marker */}
        {destinationCoordinates && (
          <Marker position={destinationCoordinates}>
            <Popup><strong>Destination: Search Address</strong></Popup>
          </Marker>
        )}

        {/* Natural Feature markers (Hills/Mountains) */}
        {features.map((feature) => (
          <Marker key={feature.id} position={[feature.lat, feature.lon]}>
            <Popup>
              <Card className="border-0 shadow-none">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-base">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mountain className="h-4 w-4 flex-shrink-0" />
                    <span className="capitalize">Type: {feature.natural}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>Lat: {feature.lat.toFixed(4)}, Lon: {feature.lon.toFixed(4)}</span>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-md shadow-md">
            <p>Loading nearby hills and mountains...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          <p>{error}</p>
        </div>
      )}

      {/* Instructions when no location is selected */}
      {!destinationCoordinates && !loading && (
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-md shadow-md max-w-md text-center">
            <h3 className="text-lg font-medium mb-2">Enter an address to begin</h3>
            <p className="text-muted-foreground">
              Use the search box above to find a **Destination Address** and discover nearby hills. Optionally, enter an **Origin Address** to see the route and distance.
            </p>
          </div>
        </div>
      )}

      {/* No results message (Now handled by the parent component's list check) */}
    </div>
  )
}