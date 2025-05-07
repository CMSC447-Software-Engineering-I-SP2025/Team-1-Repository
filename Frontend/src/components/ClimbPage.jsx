import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ClimbPage = ({ selectedClimb, isLoggedIn }) => {
  if (!selectedClimb) {
    return <div className="text-center text-gray-500">No climb selected</div>;
  }

  const [score, setScore] = useState("");
  const [photos, setPhotos] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchAvg = async () => {
      try {
        const res = await axios.get(
          "https://localhost:7195/api/Database/ClimbAvgRating",
          {
            params: { id: selectedClimb.id },
          }
        );
        setScore(res.data / 2);
      } catch (err) {
        setScore(0);
        console.error("Could not fetch average rating:", err);
      }
    };

    const fetchClimbPhoto = async () => {
      try {
        const query = `
          query PhotoURLsByAreaOrClimbID {
            climbMediaPagination(
              input: {climbUuid: "${selectedClimb.id}", maxFiles: 10}
            ) {
              mediaConnection {
                edges {
                  node {
                    mediaUrl
                  }
                }
              }
            }
          }
        `;

        const res = await axios.post(
          "https://api.openbeta.io/",
          { query },
          { headers: { "Content-Type": "application/json" } }
        );
        const photoUrls =
          res.data.data.climbMediaPagination.mediaConnection.edges.map(
            (edge) => `https://media.openbeta.io${edge.node.mediaUrl}`
          );
        setPhotos(photoUrls);
      } catch (err) {
        console.error("Could not fetch climb photo:", err);
      }
    };

    fetchClimbPhoto();
    fetchAvg();
  }, [selectedClimb]);

  useEffect(() => {
    if (showGallery) {
      setPopupImage(null);
    }
  }, [showGallery]);

  const handleClosePopup = () => {
    setPopupImage(null);
    setShowGallery(false);
  };

  const ShowGallery = () => {
    handleClosePopup();
    setShowGallery(true);
  };

  useEffect(() => {
    if (selectedClimb) {
      const loadGoogleMapsScript = () => {
        const existingScript = document.querySelector(
          `script[src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ"]`
        );
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwR8VfIU19NHVjF1mMR2cInjKNG9OLFzQ`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        } else {
          initMap();
        }
      };

      const initMap = () => {
        const map = new window.google.maps.Map(
          document.getElementById("climb-map"),
          {
            center: {
              lat: selectedClimb.metadata.lat,
              lng: selectedClimb.metadata.lng,
            },
            zoom: 12,
          }
        );

        new window.google.maps.Marker({
          position: {
            lat: selectedClimb.metadata.lat,
            lng: selectedClimb.metadata.lng,
          },
          map,
          title: selectedClimb.name,
        });
      };

      loadGoogleMapsScript();
    }
  }, [selectedClimb]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="w-full max-w-4xl overflow-x-auto">
        <div className="grid grid-flow-row-dense grid-cols-2 gap-1 overflow-hidden rounded-xl h-80 fadeinEffect">
          {photos.slice(0, 2).map((url, index) => (
            <div
              key={index}
              className="relative block hover:cursor-pointer"
              onClick={() => setPopupImage(url)}
            >
              <img
                decoding="async"
                data-nimg="fill"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                src={url}
                alt={`Climb photo ${index + 1}`}
                className="absolute inset-0 object-cover w-full h-full"
              />
              {index === 1 && (
                <div className="absolute right-4 bottom-4">
                  <button
                    onClick={() => ShowGallery()}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 256 256"
                      className="mr-2"
                    >
                      <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path>
                    </svg>
                    See more photos
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content and map layout */}
      <div className="flex flex-col w-full max-w-6xl gap-8 mt-8 lg:flex-row">
        {/* Climb Info */}
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold text-center text-gray-900">
            {selectedClimb.name}
          </h1>
          <p className="mt-2 text-lg text-center text-gray-700">
            Area: {selectedClimb.area.areaName}
          </p>
          <p className="mt-2 text-lg text-center text-gray-700">
            Location: {selectedClimb.metadata.lat}, {selectedClimb.metadata.lng}
          </p>
          {score === 0 ? (
            <p>No reviews for this climb.</p>
          ) : (
            <p className="mt-2 text-lg text-center text-gray-700">
              Rating: {score}
            </p>
          )}
          <div className="mt-8">
            <h2 className="text-3xl font-semibold text-center text-gray-800">
              Grade
            </h2>
            <div className="flex justify-center mt-4">
              <span className="inline-block px-4 py-2 text-lg text-center bg-gray-200 rounded">
                {selectedClimb.grades.yds},{" "}
                {selectedClimb.grades.french
                  ? selectedClimb.grades.french
                  : selectedClimb.grades.font}
              </span>
            </div>
            <Link to="/create-review" className="px-3">
              Click me to create a review for this climb!
            </Link>
            <Link to="/view-reviews" className="px-3">
              Click me to view reviews for this climb!
            </Link>
          </div>
        </div>

        {/* Map */}
        <div id="climb-map" className="flex-1 rounded-lg shadow-lg h-96"></div>
      </div>

      {/* Popup for individual image */}
      {popupImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClosePopup}
        >
          <div
            className="relative w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClosePopup}
              className="absolute flex items-center justify-center w-8 h-8 text-lg font-bold text-gray-600 bg-gray-200 rounded-full shadow-md top-2 right-2 hover:text-gray-800"
            >
              ✕
            </button>
            <img
              src={popupImage}
              alt="Popup"
              className="w-full h-auto max-h-[70vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}

      {/* Popup for gallery */}
      {showGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClosePopup}
        >
          <div
            className="relative w-full max-w-5xl p-6 bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClosePopup}
              className="absolute flex items-center justify-center w-8 h-8 text-lg font-bold text-gray-600 bg-gray-200 rounded-full shadow-md top-2 right-2 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold text-center">
              Photo Gallery
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {photos.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Gallery photo ${index + 1}`}
                  className="object-cover w-full h-40 rounded-lg cursor-pointer hover:shadow-lg"
                  onClick={() => {
                    setPopupImage(url);
                    setShowGallery(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimbPage;
