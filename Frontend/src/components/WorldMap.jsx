import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import climbs from "../data/climbs";

const WorldMap = forwardRef(({ climb }, ref) => {
  useEffect(() => {
    // Function to load the Google Maps script
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

    // Function to initialize the map
    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      });

      // Center map to user's location if available
      if (navigator.geolocation) {
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

      // Center map to the selected climb if available
      if (climb) {
        map.setCenter({ lat: climb.latitude, lng: climb.longitude });
        map.setZoom(12);
      }
    };

    // Assign initMap to the global window object
    window.initMap = initMap;
    // Load the Google Maps script
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ&callback=initMap`
    );
  }, [climb]);

  // Expose recenterMap method to parent component
  useImperativeHandle(ref, () => ({
    recenterMap: () => {
      if (window.google && climb) {
        const map = new window.google.maps.Map(document.getElementById("map"), {
          center: { lat: climb.latitude, lng: climb.longitude },
          zoom: 12,
        });
      }
    },
  }));

  return <div id="map" className="w-full h-screen"></div>;
});

export default WorldMap;
