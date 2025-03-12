import React, { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import ClimbInfoBox from "./ClimbInfoBox";

const WorldMap = ({ areas, area, setSelectedArea, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-32 h-32 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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

    // when the map is initialized
    const initMap = () => {
      // initialize the map
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      });

      // Create a marker for each area
      areas.forEach((area) => {
        const marker = new window.google.maps.Marker({
          position: { lat: area.metadata.lat, lng: area.metadata.lng },
          map,
          title: area.areaName,
        });

        if (area) {
          map.setCenter({ lat: area.metadata.lat, lng: area.metadata.lng });
          map.setZoom(12);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              map.setCenter({ lat: latitude, lng: longitude });
              map.setZoom(12);
            },
            () => {
              map.setCenter({ lat: 0, lng: 0 });
              map.setZoom(2);
            }
          );
        }

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
      });
    };

    window.initMap = initMap;
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ&callback=initMap`
    );
  }, [area]);

  return <div id="map" className="w-full h-screen"></div>;
};

export default WorldMap;
