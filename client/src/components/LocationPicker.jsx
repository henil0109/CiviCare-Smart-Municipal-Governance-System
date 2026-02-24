import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Building2 } from 'lucide-react';
import axios from 'axios';

const GUJARAT_CITIES = [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Junagadh",
    "Anand",
    "Navsari",
    "Morbi",
    "Nadiad",
    "Surendranagar",
    "Bharuch",
    "Mehsana",
    "Bhuj",
    "Porbandar",
    "Palanpur",
    "Valsad",
    "Vapi",
    "Gondal",
    "Veraval",
    "Godhra",
    "Patan",
    "Kalol",
    "Dahod",
    "Botad",
    "Amreli",
    "Deesa",
    "Jetpur"
];

// Major Surat areas for prioritized local suggestions
const SURAT_AREAS = [
    "Adajan", "Vesu", "Piplod", "Parle Point", "Citylight", "Ghod Dod Road",
    "Pal", "Palanpur", "Katargam", "Varachha", "Mota Varachha", "Sarthana",
    "Amroli", "Udhna", "Pandesara", "Limbayat", "Dindoli", "Bhestan",
    "Althan", "Bamroli", "Kosad", "Rander", "Jahangirpura", "Olpad",
    "Nanpura", "Athwa Lines", "Bhatar", "Majura Gate", "Ring Road", "Textile Market",
    "Dumas Road", "Gaurav Path", "New City Light", "VIP Road"
];

const LocationPicker = ({ onAddressSelect, initialAddress, disabled = false }) => {
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Refs to track current state for comparison in effects without stale closures
    const cityRef = useRef(city);
    const areaRef = useRef(area);

    useEffect(() => {
        cityRef.current = city;
        areaRef.current = area;
    }, [city, area]);

    // Initialize and Sync from props
    useEffect(() => {
        if (!initialAddress) return;

        // Construct what we expect the address to be based on current local state using Refs
        const currentCity = cityRef.current;
        const currentArea = areaRef.current;

        // Formatted address we would send to parent
        const currentFormatted = currentCity ? `${currentArea}, ${currentCity}, Gujarat` : currentArea;

        // If the incoming prop matches what we just sent/typed (or very close), DO NOT re-parse or overwrite.
        if (initialAddress === currentFormatted) return;
        if (currentCity && initialAddress.startsWith(currentArea) && initialAddress.includes(currentCity)) return;

        // Parse external update (e.g. from DB load or GPS)
        const foundCity = GUJARAT_CITIES.find(c => initialAddress.includes(c));
        if (foundCity) {
            setCity(foundCity);
            // Extract Area: Remove ", City, Gujarat" suffix if present to keep input clean
            const parts = initialAddress.split(foundCity);
            if (parts.length > 0) {
                // Take the part before the city
                let cleanArea = parts[0].trim();
                // Remove trailing comma/spaces
                while (cleanArea.endsWith(',') || cleanArea.endsWith(' ')) {
                    cleanArea = cleanArea.slice(0, -1);
                }
                setArea(cleanArea);
            }
        } else {
            // If no city found, just set the whole thing as area
            setArea(initialAddress);
        }
    }, [initialAddress]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleCityChange = (e) => {
        const newCity = e.target.value;
        setCity(newCity);
        setArea(''); // Clear area when city changes
        setSuggestions([]);
        onAddressSelect(`${newCity}, Gujarat`, null, null);
    };

    const handleAreaChange = async (e) => {
        const value = e.target.value;
        setArea(value);

        // Update parent with current partial input
        const fullAddress = city ? `${value}, ${city}, Gujarat` : value;
        onAddressSelect(fullAddress, null, null);

        // 1. Filter local areas if city is Surat
        let localMatches = [];
        if (city === "Surat" && value.length > 0) {
            localMatches = SURAT_AREAS
                .filter(a => a.toLowerCase().includes(value.toLowerCase()))
                .map(a => ({
                    display_name: `${a}, Surat, Gujarat`,
                    name: a,
                    lat: null,
                    lon: null,
                    type: 'local'
                }))
                .slice(0, 5); // Start with top matches
        }

        // Show local matches immediately if we have input
        if (localMatches.length > 0) {
            setSuggestions(localMatches);
            setShowSuggestions(true);
        }

        if (value.length > 2 && city) {
            setLoading(true);
            try {
                // 2. Fetch API suggestions
                // Looser query for better coverage: "Value City"
                const query = `${value} ${city}`;
                const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=5&countrycodes=in`, {
                    headers: { 'User-Agent': 'CivicHeroApp/1.0' }
                });

                const apiResults = response.data;

                // 3. Merge Strategies
                // We want local matches to ensure they appear, but API matches might have better details (like proper society names inside that area)
                // Let's prepend local matches to API matches, removing duplicates

                const merged = [...localMatches];
                apiResults.forEach(apiItem => {
                    // Check if this API item is already covered by a local match roughly
                    // Actually, let's just show both if they are distinct enough, or prioritize API if it matches a local name exactly?
                    // Simple merge: Add API items that don't exact-match the name of a local item
                    const isDuplicate = merged.some(m => m.display_name === apiItem.display_name);
                    if (!isDuplicate) {
                        merged.push(apiItem);
                    }
                });

                setSuggestions(merged);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete failed:", error);
                // On error, just stick with local matches if any
            } finally {
                setLoading(false);
            }
        } else if (value.length <= 2 && localMatches.length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const formattedAddress = suggestion.display_name;
        onAddressSelect(formattedAddress, parseFloat(suggestion.lat), parseFloat(suggestion.lon));
        setArea(formattedAddress);
        setShowSuggestions(false);
    };

    const handleUseCurrentLocation = () => {
        if (disabled) return;
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
                        headers: { 'User-Agent': 'CivicHeroApp/1.0' }
                    });

                    if (response.data && response.data.display_name) {
                        const addr = response.data.address;
                        const fullDisplayName = response.data.display_name;

                        const detectedCity = addr.city || addr.town || addr.village || addr.county;
                        const matchedCity = GUJARAT_CITIES.find(c => detectedCity && detectedCity.includes(c)) || GUJARAT_CITIES.find(c => fullDisplayName.includes(c));

                        if (matchedCity) {
                            setCity(matchedCity);
                        }

                        setArea(fullDisplayName);
                        onAddressSelect(fullDisplayName, latitude, longitude);
                    } else {
                        throw new Error("No address found in response");
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed", error);
                    // More specific error handling
                    if (error.code === "ERR_NETWORK") {
                        alert("Network error: Unable to connect to address server. Using GPS coordinates.");
                    } else {
                        // Fallback silently or with mild warning usually better, but here we strictly alert
                        // alert("Location detected but address lookup failed. Using coordinates.");
                    }
                    // Always fill coordinates as fallback
                    const coordsAddr = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setArea(coordsAddr);
                    onAddressSelect(coordsAddr, latitude, longitude);
                } finally {
                    setDetecting(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Unable to retrieve location.";
                if (error.code === 1) msg = "Permission denied. Please enable location access in your browser.";
                if (error.code === 2) msg = "Location unavailable. Check GPS signal.";
                if (error.code === 3) msg = "Location detection timed out.";
                alert(msg);
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // Increased timeout to 15s
        );
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {/* Step 1: City Selection */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="text-gray-400" size={18} />
                </div>
                <select
                    value={city}
                    onChange={handleCityChange}
                    disabled={disabled}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm appearance-none font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <option value="" disabled>Select City in Gujarat</option>
                    {GUJARAT_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other (Manual Entry)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>

            {/* Step 2: Area Search */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className={`transition-colors ${city ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-gray-300'}`} size={18} />
                    </div>
                    <input
                        type="text"
                        value={area}
                        onChange={handleAreaChange}
                        disabled={disabled || !city}
                        placeholder={city ? `Search area, society, apartment in ${city}...` : "Select a city first"}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all shadow-sm font-medium ${disabled || !city
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400'
                            }`}
                        autoComplete="off"
                    />
                    {loading && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Loader2 className="animate-spin text-blue-500" size={18} />
                        </div>
                    )}
                </div>

                {!disabled && (
                    <button
                        type="button"
                        onClick={handleUseCurrentLocation}
                        disabled={detecting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2 whitespace-nowrap font-semibold disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] justify-center"
                    >
                        {detecting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Navigation size={18} />
                                <span className="hidden sm:inline">Detect</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {suggestions.map((item, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
                        >
                            <MapPin size={16} className="mt-1 text-gray-400 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name || item.display_name.split(',')[0]}</p>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.display_name}</p>
                            </div>
                        </button>
                    ))}

                    {/* Always show the manual option if there is text input */}
                    {area.length > 2 && (
                        <button
                            type="button"
                            onClick={() => {
                                // Manual override: Close suggestions, keep value as is
                                setShowSuggestions(false);
                                onAddressSelect(`${area}, ${city}, Gujarat`, null, null);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                        >
                            <div className="bg-gray-100 p-1 rounded-full">
                                <span className="text-gray-500 text-xs font-bold">Manual</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Use "{area}"</p>
                                <p className="text-xs text-gray-400">Can't find your address? Select this to use exactly what you typed.</p>
                            </div>
                        </button>
                    )}

                    <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-400 text-right">
                        Powered by OpenStreetMap
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
