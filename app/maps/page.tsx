"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Search, Mountain, MapPin } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Define the type for the natural features received from the map component
interface NaturalFeature {
  id: number
  name: string
  lat: number
  lon: number
  natural: string
  tags: Record<string, string>
}

// Import the Map component dynamically to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-muted flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
})

export default function HillFinder() {
  const [destination, setDestination] = useState("") 
  const [origin, setOrigin] = useState("")          
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [originCoordinates, setOriginCoordinates] = useState<[number, number] | null>(null) 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nearbyFeatures, setNearbyFeatures] = useState<NaturalFeature[] | null>(null) // New state for the list

  // Function to geocode a single address using Nominatim
  const geocodeAddress = async (address: string) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
    )
    const data = await response.json()
    if (data && data.length > 0) {
      return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)] as [number, number]
    }
    return null
  }

  const handleSearch = async () => {
    if (!destination.trim()) return

    setIsLoading(true)
    setError(null)
    setCoordinates(null);
    setOriginCoordinates(null);
    setNearbyFeatures(null); // Clear features on new search

    try {
      // 1. Geocode Destination (for Hill Search)
      const destCoords = await geocodeAddress(destination)
      setCoordinates(destCoords)

      // 2. Geocode Origin (for Routing)
      let origCoords: [number, number] | null = null
      if (origin.trim()) {
        origCoords = await geocodeAddress(origin)
        setOriginCoordinates(origCoords)
      } else {
        setOriginCoordinates(null)
      }
      
      if (!destCoords) {
        setError("Destination location not found. Please try a different search term.")
      }

    } catch (err) {
      setError("An error occurred while searching for the location.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Hill and Route Finder</h1>

      <div className="mb-6 space-y-3">
        {/* Origin Address Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter your Origin Address (e.g., 123 Main St, New York)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Destination Address Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter Destination Address (to search for hills nearby)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : <Search className="h-4 w-4 mr-2" />}
            Find Hills & Route
          </Button>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <p className="text-sm text-muted-foreground mt-2">
          Enter a **Destination Address** to find nearby hills. Optionally, enter an **Origin Address** to see the **driving route** and **distance** between them.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden mb-6">
        <MapComponent 
          destinationCoordinates={coordinates} 
          originCoordinates={originCoordinates}
          onFeaturesFetched={setNearbyFeatures} // Pass the setter function
        />
      </div>

      {/* --- New Panel for Nearby Hills --- */}
      {nearbyFeatures && nearbyFeatures.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <Mountain className="h-6 w-6 text-green-600"/> Nearby Hills & Mountains
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyFeatures.map((feature, index) => (
              <div key={feature.id} className="p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold text-lg">{index + 1}. {feature.name}</h4>
                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1 mt-1">
                    <Mountain className="h-3 w-3"/> Type: {feature.natural}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3"/> Lat: {feature.lat.toFixed(4)}, Lon: {feature.lon.toFixed(4)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {nearbyFeatures && nearbyFeatures.length === 0 && !isLoading && (
         <div className="text-center p-4 border rounded-lg bg-yellow-50 text-yellow-700">
            <p>No hills or mountains found near the destination address.</p>
        </div>
      )}
    </main>
  )
}