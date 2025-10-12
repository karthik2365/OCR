"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// --- Type Definitions ---

interface Zone {
    name: string;
    minAlt: number;
    maxAlt: number;
    bgColor: string;
    o2: number;
    pressure: number;
    temp: number;
    silhouetteColor: string;
}

interface DataCardProps {
    icon: string;
    label: string;
    value: number;
    unit: string;
    color: string;
    isHighAltitude: boolean; // Added prop for dynamic color
}

interface SilhouetteProps {
    altitude: number;
    maxAlt: number;
    layer: number;
    startY: number;
    height: number;
    translateX: number;
    opacity: number;
    color: string;
}

interface ParticlesContainerProps {
    altProgress: number;
    particleColor: string;
}

interface ParticleProps {
    altProgress: number;
    color: string;
}


// --- Constants and Utilities ---

const ZONES: Zone[] = [
    { name: "Sea Level", minAlt: 0, maxAlt: 500, bgColor: "rgba(37, 99, 235, 1)", o2: 20.9, pressure: 1013, temp: 15, silhouetteColor: "#475569" }, // Blue-600
    { name: "Hills", minAlt: 500, maxAlt: 2500, bgColor: "rgba(16, 185, 129, 1)", o2: 18.7, pressure: 780, temp: 5, silhouetteColor: "#6B7280" }, // Emerald-500
    { name: "Highlands", minAlt: 2500, maxAlt: 5500, bgColor: "rgba(107, 114, 128, 1)", o2: 13.5, pressure: 530, temp: -5, silhouetteColor: "#9CA3AF" }, // Gray-500
    { name: "Snow Peaks", minAlt: 5500, maxAlt: 8000, bgColor: "rgba(148, 163, 184, 1)", o2: 10.0, pressure: 380, temp: -25, silhouetteColor: "#D1D5DB" }, // Slate-400
    { name: "Death Zone", minAlt: 8000, maxAlt: 8848, bgColor: "rgba(255, 255, 255, 1)", o2: 7.0, pressure: 340, temp: -35, silhouetteColor: "#E5E7EB" }, // White
];

// Linear interpolation function
const lerp = (start: number, end: number, t: number): number => start * (1 - t) + end * t;

// Custom utility to interpolate between two zone properties
const interpolate = (altitude: number, key: keyof Zone): string | number => {
    // Find the current zone boundaries
    for (let i = 0; i < ZONES.length - 1; i++) {
        const zoneA = ZONES[i];
        const zoneB = ZONES[i + 1];

        if (altitude >= zoneA.minAlt && altitude <= zoneB.maxAlt) {
            
            let t: number;
            if (altitude <= zoneB.minAlt) {
                // Calculate interpolation factor within the current transition range (A to B)
                t = (altitude - zoneA.minAlt) / (zoneB.minAlt - zoneA.minAlt);
            } else {
                // We are already fully in the last zone
                t = 1; 
            }
            
            // Ensure t is clamped between 0 and 1 for stability
            t = Math.max(0, Math.min(1, t));

            // Logic for different keys
            if (key === 'bgColor' || key === 'silhouetteColor') {
                // Simplified color interpolation: keep color A until the minAlt of B is reached
                return altitude < zoneB.minAlt ? zoneA[key] : zoneB[key];
            } else if (typeof zoneA[key] === 'number') {
                // Interpolate numerical properties
                return lerp(zoneA[key] as number, zoneB[key] as number, t);
            }
        }
    }
    // Handle edge case for max altitude (last zone)
    return ZONES[ZONES.length - 1][key];
};

// --- Sub Components ---

const DataCard: React.FC<DataCardProps> = React.memo(({ icon, label, value, unit, color, isHighAltitude }) => {
    const labelColor = isHighAltitude ? 'text-gray-600' : 'text-white/80';
    const valueColor = isHighAltitude ? 'text-gray-800' : 'text-white';
    
    // Adjust card background opacity slightly when high up for a subtle effect
    const cardBg = isHighAltitude ? 'bg-black/5' : 'bg-white/10';

    return (
        <div className={`flex items-center space-x-4 p-3 ${cardBg} backdrop-blur-sm rounded-xl shadow-lg border border-white/20 transition-all duration-500 ease-out hover:bg-white/20`}>
            <div className={`text-2xl ${color}`}>{icon}</div>
            <div>
                <div className={`text-sm font-light ${labelColor}`}>{label}</div>
                <div className={`text-2xl font-bold ${valueColor} leading-none`}>
                    {value.toFixed(1)}<span className="text-base font-normal ml-1">{unit}</span>
                </div>
            </div>
        </div>
    );
});
// FIX: Add display name
DataCard.displayName = 'DataCard';

const Silhouette: React.FC<SilhouetteProps> = ({ altitude, maxAlt, layer, startY, height, translateX, opacity, color }) => {
    // Calculate vertical position based on altitude (simulating parallax)
    const normalizedAlt: number = altitude / maxAlt;
    const yOffset: number = normalizedAlt * 100 * layer; // Layer 1 moves slowest, Layer 3 moves fastest

    return (
        <div
            className="absolute bottom-0 w-full transition-transform duration-[1000ms] ease-out pointer-events-none"
            style={{
                transform: `translate3d(${translateX}%, ${startY - yOffset}px, 0)`,
                height: `${height}vh`,
                opacity: opacity,
                maskImage: 'url("data:image/svg+xml;charset=UTF-8,<svg viewBox=\'0 0 1000 300\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'#000\' d=\'M 0 300 C 150 200, 350 250, 500 150 S 850 50, 1000 100 V 300 Z\'/></svg>")',
                WebkitMaskImage: 'url("data:image/svg+xml;charset=UTF-8,<svg viewBox=\'0 0 1000 300\' xmlns=\'http://www.w3.org/2000/svg\'><path fill=\'#000\' d=\'M 0 300 C 150 200, 350 250, 500 150 S 850 50, 1000 100 V 300 Z\'/></svg>")',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                backgroundColor: color,
            }}
        ></div>
    );
};

const Particle: React.FC<ParticleProps> = ({ color }) => {
    const random = Math.random();
    const duration = lerp(4, 10, random);
    const size = lerp(1, 3, random);
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    return (
        <div
            className="absolute rounded-full pointer-events-none transition-colors duration-500"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                left: `${x}%`,
                top: `${y}%`,
                animation: `float ${duration}s infinite alternate ease-in-out`,
                opacity: lerp(0.2, 0.8, random),
                transform: `translateZ(${lerp(-50, 50, random)}px)` // 3D effect
            }}
        />
    );
};
// FIX: Add display name
Particle.displayName = 'Particle';

const ParticlesContainer: React.FC<ParticlesContainerProps> = ({ particleColor }) => {
    const numParticles = 40;
    const [particles, setParticles] = useState<number[]>([]);

    useEffect(() => {
        // Generate particles only once
        setParticles(Array(numParticles).fill(0));
    }, []);

    // Dynamic keyframes for floating animation (needed for single file)
    const floatKeyframes = `
        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(10px, -10px); }
        }
    `;

    return (
        <>
            <style>{floatKeyframes}</style>
            <div className="absolute inset-0 overflow-hidden perspective-1000">
                {particles.map((_, i) => (
                    <Particle key={i} altProgress={0} color={particleColor} />
                ))}
            </div>
        </>
    );
};

// --- Main Component ---

const MAX_ALTITUDE = 8848; // Mount Everest
const HIGH_ALTITUDE_THRESHOLD = 8000; // Switch text color here

const App: React.FC = () => {
    const [altitude, setAltitude] = useState<number>(0);

    // Calculate dynamic values based on current altitude
    const altProgress: number = altitude / MAX_ALTITUDE;
    const dynamicBgColor: string | number = useMemo(() => interpolate(altitude, 'bgColor'), [altitude]);
    const dynamicTemp: string | number = useMemo(() => interpolate(altitude, 'temp'), [altitude]);
    const dynamicO2: string | number = useMemo(() => interpolate(altitude, 'o2'), [altitude]);
    const dynamicPressure: string | number = useMemo(() => interpolate(altitude, 'pressure'), [altitude]);
    const dynamicSilhouetteColor: string | number = useMemo(() => interpolate(altitude, 'silhouetteColor'), [altitude]);
    
    // Dynamic text color logic
    const isHighAltitude: boolean = altitude >= HIGH_ALTITUDE_THRESHOLD;
    const titleTextColor: string = isHighAltitude ? 'text-gray-800' : 'text-white';
    const subtitleTextColor: string = isHighAltitude ? 'text-gray-600' : 'text-white/80';
    const sliderThumbColor: string = isHighAltitude ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';


    const handleAltitudeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setAltitude(parseFloat(event.target.value));
    }, []);

    // Determine the current zone for display
    const currentZone: Zone = useMemo(() => {
        return ZONES.find(zone => altitude >= zone.minAlt && altitude <= zone.maxAlt) || ZONES[0];
    }, [altitude]);
    
    // Type checking ensures the interpolated values are numbers for DataCard
    const tempValue = typeof dynamicTemp === 'number' ? dynamicTemp : ZONES[0].temp;
    const o2Value = typeof dynamicO2 === 'number' ? dynamicO2 : ZONES[0].o2;
    const pressureValue = typeof dynamicPressure === 'number' ? dynamicPressure : ZONES[0].pressure;
    const silhouetteColor = typeof dynamicSilhouetteColor === 'string' ? dynamicSilhouetteColor : ZONES[0].silhouetteColor;

    return (
        <div className="relative w-full h-screen font-inter overflow-hidden transition-colors duration-1000" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Background and Atmospheric Layer */}
            <div
                className="absolute inset-0 transition-colors duration-1000 ease-out"
                style={{ backgroundColor: dynamicBgColor as string }}
            />

            {/* Particles/Fog Effect */}
            <ParticlesContainer altProgress={altProgress} particleColor={silhouetteColor} />

            {/* Parallax Mountain Silhouettes */}
            <Silhouette
                altitude={altitude} maxAlt={MAX_ALTITUDE} layer={1}
                startY={100} height={40} translateX={-5} opacity={0.6}
                color={silhouetteColor}
            />
            <Silhouette
                altitude={altitude} maxAlt={MAX_ALTITUDE} layer={2}
                startY={50} height={50} translateX={5} opacity={0.8}
                color={silhouetteColor}
            />
            <Silhouette
                altitude={altitude} maxAlt={MAX_ALTITUDE} layer={3}
                startY={0} height={60} translateX={0} opacity={1.0}
                color={silhouetteColor}
            />

            {/* Main Content Area - ADDED PT-16 TO CLEAR EXTERNAL NAVBAR */}
            <div className="absolute inset-0 flex flex-col md:flex-row p-4 md:p-8 pt-16 z-10">

                {/* Navbar/Title - CHANGED TO ABSOLUTE POSITIONING RELATIVE TO THIS CONTAINER */}
                <header className="absolute top-4 left-4 right-4 z-20">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            {/* Dynamic Title Color */}
                            <h1 className={`text-3xl font-extrabold ${titleTextColor} shadow-text transition-colors duration-500`}>The Breathing Earth</h1>
                            {/* Dynamic Subtitle Color */}
                            <p className={`text-sm font-light italic ${subtitleTextColor} shadow-text transition-colors duration-500`}>Climb through the thinning air.</p>
                        </div>
                        <div className="hidden sm:block">
                            {/* Zone Chip always uses dark text as its background is white/20 */}
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/50 text-gray-800 backdrop-blur-sm transition-colors duration-500">
                                {currentZone.name}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Fixed Info Card (Sidebar) */}
                <div className="fixed bottom-4 left-4 right-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:left-auto md:right-8 w-auto md:w-64 z-20">
                    <div className="flex flex-col space-y-4">
                        {/* Data Cards passing the color flag */}
                        <DataCard
                            icon="▲"
                            label={`Altitude (${currentZone.name})`}
                            value={altitude}
                            unit="m"
                            color="text-yellow-300"
                            isHighAltitude={isHighAltitude}
                        />
                        <DataCard
                            icon="🌬️"
                            label="Oxygen Level"
                            value={o2Value}
                            unit="%"
                            color="text-red-300"
                            isHighAltitude={isHighAltitude}
                        />
                        <DataCard
                            icon="💨"
                            label="Air Pressure"
                            value={pressureValue}
                            unit="hPa"
                            color="text-purple-300"
                            isHighAltitude={isHighAltitude}
                        />
                        <DataCard
                            icon="🌡️"
                            label="Temperature"
                            value={tempValue}
                            unit="°C"
                            color="text-cyan-300"
                            isHighAltitude={isHighAltitude}
                        />
                    </div>
                </div>

                {/* Altitude Slider/Controller */}
                <div className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-4/5 max-w-xl z-20">
                    <label htmlFor="altitude-slider" className="sr-only">Altitude Slider</label>
                    <input
                        id="altitude-slider"
                        type="range"
                        min="0"
                        max={MAX_ALTITUDE}
                        step="10"
                        value={altitude}
                        onChange={handleAltitudeChange}
                        className="w-full h-3 bg-white/30 rounded-full appearance-none cursor-pointer range-lg altitude-slider-style"
                        aria-label="Altitude"
                        style={{
                            // Custom Track and Thumb Styling based on altitude
                            '--track-color': isHighAltitude ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                            '--thumb-color': sliderThumbColor,
                            '--progress-color': isHighAltitude ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                        } as React.CSSProperties} // Cast required for custom CSS variables
                    />
                </div>
            </div>

            {/* Custom Styles for Slider (Tailwind limitations) */}
            <style jsx global>{`
                /* General font stack for Inter */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
                
                .shadow-text {
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
                }

                /* Custom Slider Styling */
                .altitude-slider-style {
                    height: 8px;
                    border-radius: 4px;
                    background: var(--track-color);
                    transition: all 0.5s ease-out;
                }

                .altitude-slider-style::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--thumb-color);
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease-out;
                    border: 2px solid var(--thumb-color); /* Match thumb border to color */
                }

                .altitude-slider-style::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: var(--thumb-color);
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                    transition: all 0.3s ease-out;
                    border: 2px solid var(--thumb-color);
                }
            `}</style>
        </div>
    );
}

export default App;