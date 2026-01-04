import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { FaMapMarkerAlt, FaLocationArrow, FaTimes } from "react-icons/fa";
import toast from 'react-hot-toast';
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- FIX: Default Leaflet Marker Icons ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SUB-COMPONENT: Instantly Snap to Location ---
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {

      map.setView(position, 15); 
    }
  }, [position, map]);
  return null;
}

// --- SUB-COMPONENT: Click Handler ---
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const VolunteerLocationModal = ({ onClose, onSave }) => {
  // Default: Hyderabad/Secunderabad 
  const [position, setPosition] = useState({ lat: 17.3850, lng: 78.4867 });
  const [loading, setLoading] = useState(false);

  // --- ROBUST GPS LOGIC ---
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    toast.loading("Locating...", { id: "gps" });

    const success = (pos) => {
      const { latitude, longitude } = pos.coords;
      // Update state -> Triggers MapUpdater 
      setPosition({ lat: latitude, lng: longitude });
      setLoading(false);
      toast.success("Location found!", { id: "gps" });
    };

    const error = (err) => {
      console.warn("High accuracy error, trying low accuracy...", err);
      // Fallback: Try again with low accuracy if high fails
      navigator.geolocation.getCurrentPosition(
        success,
        (finalErr) => {
          console.error(finalErr);
          setLoading(false);
          toast.error("Could not find location. Please tap map manually.", { id: "gps" });
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    };

    // First Try: High Accuracy (GPS)
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 15000, // Wait 15 seconds before failing
      maximumAge: 0   // Do not use old cached locations
    });
  };

  const handleConfirm = () => {
    onSave(position);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
           <div>
              <h2 className="text-2xl font-bold text-gray-800">Confirm Location</h2>
              <p className="text-gray-500 text-sm mt-1">
                Pin your exact location on the map below
              </p>
           </div>
           <button 
             onClick={onClose} 
             className="p-2 bg-gray-100 rounded-full hover:bg-red-100 hover:text-red-500 transition"
           >
             <FaTimes />
           </button>
        </div>

        {/* Map Area */}
        <div className="p-6 pt-4">
            <div className="relative h-[350px] w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
            
              <MapContainer
                center={position}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Logic Components */}
                <MapUpdater position={position} />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>

              {/* Floating GPS Button */}
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="absolute top-4 right-4 z-[1000] bg-white text-gray-800 px-4 py-2 rounded-xl shadow-md font-semibold hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 border border-gray-200 transition-all active:scale-95"
              >
                {loading ? (
                  <span className="animate-spin text-blue-600">⌛</span>
                ) : (
                  <FaLocationArrow className="text-blue-500" />
                )}
                {loading ? "Locating..." : "Use My GPS"}
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/75 text-white text-xs px-4 py-1.5 rounded-full pointer-events-none font-medium backdrop-blur-md">
                Tap map to correct location manually
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-gray-600 font-semibold bg-gray-100 hover:bg-gray-200 transition order-2 sm:order-1"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition transform active:scale-95 order-1 sm:order-2 flex items-center justify-center gap-2"
          >
            <FaMapMarkerAlt />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default VolunteerLocationModal;