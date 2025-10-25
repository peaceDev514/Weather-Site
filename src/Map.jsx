import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Component to handle map click events
const LocationMarker = ({position, setPosition, mapPlace, setMapPlace, setCurrentLocation, setPlace}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
	    .then(res => res.json())
	    .then(data => {
		const dataName = data.display_name;
		setCurrentLocation('');
		setPlace('');
		setMapPlace(dataName.split(',')[0]);

	    })
	    .catch(err => {
		    console.log(err);
	    })
    },
  });
  return null;
};

const MapContent = ({ position, setPosition, mapPlace, setMapPlace, setCurrentLocation, setPlace, detailsRef}) => {
  return (
	  <div ref={el => detailsRef.current[0] = el}>
    <MapContainer
      center={position || [6.5244, 3.3792]} // fallback: Lagos, Nigeria
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      {/* Satellite with labels (hybrid) */}
      <TileLayer
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
      />

      {/* Marker for current position */}
      {position && (
        <Marker position={position}>
          <Popup>You are here 📍</Popup>
        </Marker>
      )}

      {/* Handle clicks on the map */}
      <LocationMarker position={position} setPosition={setPosition} mapPlace={mapPlace} setMapPlace={setMapPlace} setCurrentLocation={setCurrentLocation} setPlace={setPlace} />
    </MapContainer>
	  </div>
  );
};

export default MapContent;
