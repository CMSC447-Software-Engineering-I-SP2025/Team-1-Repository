import React, { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import climbs from "../data/climbs";
import ClimbInfoBox from "./ClimbInfoBox";

const WorldMap = ({ climb, setSelectedClimb }) => {
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

      // Create a marker for each climb
      climbs.forEach((climb) => {
        const marker = new window.google.maps.Marker({
          position: { lat: climb.latitude, lng: climb.longitude },
          map,
          title: climb.name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: ReactDOMServer.renderToString(
            <ClimbInfoBox name={climb.name} location={climb.location} />
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
          setSelectedClimb(climb);
        });
      });

      if (climb) {
        map.setCenter({ lat: climb.latitude, lng: climb.longitude });
        map.setZoom(12);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(4);
          },
          () => {
            map.setCenter({ lat: 0, lng: 0 });
            map.setZoom(2);
          }
        );
      }
    };

    window.initMap = initMap;
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ&callback=initMap`
    );
  }, [climb]);

  return <div id="map" className="w-full h-screen"></div>;
};

export default WorldMap;
