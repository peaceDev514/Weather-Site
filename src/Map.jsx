import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const LocationMarker = ({ position, setPosition, setMapPlace, setCurrentLocation, setPlace }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then((res) => res.json())
        .then((data) => {
          const dataName = data.display_name;
          setCurrentLocation("");
          setPlace("");
          setMapPlace(dataName.split(",")[0]);
        })
        .catch((err) => console.error(err));
    },
  });
  return null;
};

const MapContent = ({
  position,
  setPosition,
  mapPlace,
  setMapPlace,
  setCurrentLocation,
  setPlace,
  detailsRef,
}) => {
  // Map mode state
  const [mapMode, setMapMode] = useState("satellite");

  // ✅ Tile URLs without `.png`
  const tileLayers = {
    satellite: "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", // Google Hybrid
    streets:
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", // ArcGIS Street
    terrain:
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}", // ArcGIS Terrain
  };

  const subDomains = mapMode === "satellite" ? ["mt0", "mt1", "mt2", "mt3"] : undefined;

  return (
    <div ref={(el) => (detailsRef.current[0] = el)}>
      {/* Dropdown to change view mode */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <select
          value={mapMode}
          onChange={(e) => setMapMode(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
          }}
        >
          <option value="satellite">Satellite View</option>
          <option value="streets">Street View</option>
          <option value="terrain">Terrain View</option>
        </select>
      </div>

      <MapContainer
        center={position || [6.5244, 3.3792]} // Lagos as fallback
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url={tileLayers[mapMode]}
          subdomains={subDomains}
          attribution={
            mapMode === "satellite"
              ? "© Google Maps"
              : mapMode === "streets"
              ? "© Esri — Source: Esri, HERE, Garmin, FAO, NOAA, USGS"
              : "© Esri — Terrain Data"
          }
        />

        {/* Marker */}
        {position && (
          <Marker position={position}>
            <Popup>You are here 📍</Popup>
          </Marker>
        )}

        {/* Handle user clicks */}
        <LocationMarker
          position={position}
          setPosition={setPosition}
          mapPlace={mapPlace}
          setMapPlace={setMapPlace}
          setCurrentLocation={setCurrentLocation}
          setPlace={setPlace}
        />
      </MapContainer>
    </div>
  );
};

export default MapContent;
