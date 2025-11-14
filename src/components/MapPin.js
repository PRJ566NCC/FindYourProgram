"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPin({ lat, lng, name }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!lat || !lng) return <p>Location not available</p>;

  return (
    <>
      {!isFullScreen && (
        <div
          style={{
            height: "200px",
            width: "200px",
            borderRadius: "8px",
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={() => setIsFullScreen(true)}
        >
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>{name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {isFullScreen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setIsFullScreen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "90vw",
              height: "90vh",
              background: "white",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFullScreen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 10000,
                background: "#000",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Close Map
            </button>

            <MapContainer
              center={[lat, lng]}
              zoom={17}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]}>
                <Popup>{name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
}
