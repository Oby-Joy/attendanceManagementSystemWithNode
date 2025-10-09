import { useState } from "react";

function LocationComponent() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError("Unable to retrieve your location.");
        console.error(err);
      }
    );
  };

  return (
    <div>
      <button
        onClick={getLocation}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Get Current Location
      </button>

      {location && (
        <p className="mt-2">
          📍 Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default LocationComponent;
