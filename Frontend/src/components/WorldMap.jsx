import React, { use, useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import ClimbInfoBox from "./ClimbInfoBox";

const WorldMap = ({
  areas,
  area,
  setSelectedArea,
  isLoading,
  setStateName,
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [currentStateName, setCurrentStateName] = useState("");

  useEffect(() => {
    // Fetch state name based on map center
    const fetchStateName = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${mapCenter.lat},${mapCenter.lng}&key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          const stateComponent = addressComponents.find((component) =>
            component.types.includes("administrative_area_level_1")
          );
          if (stateComponent) {
            setStateName(stateComponent.long_name);
            setCurrentStateName(stateComponent.long_name); // Update state name for display
          }
        }
      } catch (error) {
        console.error("Failed to fetch state name:", error);
      }
    };

    fetchStateName();
  }, [mapCenter]);

  useEffect(() => {
    if (map && areas) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));
      setMarkers([]);

      // Add new markers
      const newMarkers = areas.map((area) => {
        const marker = new window.google.maps.Marker({
          position: { lat: area.metadata.lat, lng: area.metadata.lng },
          map,
          title: area.areaName,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: ReactDOMServer.renderToString(
            <ClimbInfoBox
              name={area.areaName}
              location={
                "lat: " + area.metadata.lat + " lng: " + area.metadata.lng
              }
            />
          ),
        });

        let timeoutId;

        marker.addListener("mouseover", () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          infoWindow.open(map, marker);
        });

        marker.addListener("mouseout", () => {
          timeoutId = setTimeout(() => {
            infoWindow.close();
          }, 200);
        });

        marker.addListener("click", () => {
          setSelectedArea(area);
        });

        return marker;
      });

      setMarkers(newMarkers);
    }
  }, [areas, map]);

  useEffect(() => {
    const loadScript = (url) => {
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        script.onload = () => {
          if (window.google) {
            initMap();
          }
        };
      } else {
        if (window.google) {
          initMap();
        }
      }
    };

    const initMap = () => {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: mapCenter,
          zoom: 2,
        }
      );

      // Add a listener to update mapCenter when dragging ends
      mapInstance.addListener("dragend", () => {
        const newCenter = mapInstance.getCenter();
        setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
      });

      setMap(mapInstance); // Store map instance
    };

    window.initMap = initMap;
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ&callback=initMap`
    );
  }, []);

  if (!areas || !Array.isArray(areas)) {
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <div className="absolute p-2 bg-white rounded shadow-md bottom-4 left-4">
        <p className="text-sm font-medium">
          State: {currentStateName || "Loading..."}
        </p>
      </div>
    </div>
  );
};

export default WorldMap;
