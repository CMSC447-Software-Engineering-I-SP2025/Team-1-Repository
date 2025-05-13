import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "./UserProvider";

const ClimbPage = ({ selectedClimb, isLoggedIn }) => {
  const { user: currentUser } = useUser(); // Access currentUser using useUser hook
  const [favoriteClimbs, setFavoriteClimbs] = useState([]);

  useEffect(() => {
    const fetchFavoriteClimbs = async () => {
      if (!currentUser?.id) {
        console.error("User is not logged in. Cannot fetch favorite climbs.");
        return;
      }

      try {
        const response = await axios.get(
          "https://localhost:7195/api/Database/FavoriteClimb",
          {
            params: { userId: currentUser.id },
          }
        );

        const simplifiedFavorites = response.data.map((climb) => ({
          id: climb.id,
          parentAreaId: climb.parentAreaId,
          name: climb.name,
        }));

        console.log("Fetched favorite climbs:", simplifiedFavorites);
        setFavoriteClimbs(simplifiedFavorites);
      } catch (error) {
        console.error("Error fetching favorite climbs:", error);
      }
    };

    fetchFavoriteClimbs();
  }, [currentUser]);

  const addFavoriteClimb = async (climb) => {
    if (!currentUser?.id) {
      console.error("User is not logged in. Cannot add favorite climb.");
      return;
    }

    // Fetch parentAreaId if undefined
    if (!climb?.parentAreaId) {
      try {
        console.log("Fetching parentAreaId for climb ID:", climb.id);
        const response = await axios.get(
          `https://localhost:7195/api/Database/GetParentAreaIdByClimbId`,
          { params: { climbId: climb.id } }
        );
        climb.parentAreaId = response.data.parentAreaId;
        console.log("Fetched parentAreaId:", climb.parentAreaId);
      } catch (error) {
        console.error("Error fetching parentAreaId:", error);
        return;
      }
    }

    // Validate climb object
    if (!climb?.id || !climb?.parentAreaId || !climb?.name) {
      console.error("Invalid climb object:", climb);
      return;
    }

    try {
      console.log("Adding favorite climb with payload:", {
        userId: currentUser.id,
        climbId: climb.id,
        parentAreaId: climb.parentAreaId,
      });

      await axios.post("https://localhost:7195/api/Database/FavoriteClimb", {
        userId: currentUser.id,
        climbId: climb.id,
        parentAreaId: climb.parentAreaId,
      });

      setFavoriteClimbs((prev) => [...prev, climb]);
      console.log("Successfully added favorite climb:", climb);
    } catch (error) {
      console.error("Error adding favorite climb:", error);
    }
  };

  const removeFavoriteClimb = async (climbId) => {
    if (!currentUser?.id) return;

    try {
      await axios.delete("https://localhost:7195/api/Database/FavoriteClimb", {
        data: {
          userId: currentUser.id,
          climbId,
        },
      });

      setFavoriteClimbs((prev) => prev.filter((fav) => fav.id !== climbId));
    } catch (error) {
      console.error("Error removing favorite climb:", error);
    }
  };

  const toggleFavoriteClimb = async (climb) => {
    if (!currentUser?.id) return;

    const isFavorite = favoriteClimbs.some((fav) => fav.id === climb.id);

    if (isFavorite) {
      setFavoriteClimbs((prev) => prev.filter((fav) => fav.id !== climb.id));
      await removeFavoriteClimb(climb.id);
    } else {
      const newClimb = {
        id: climb.id,
        parentAreaId: climb.parentAreaId,
        name: climb.name,
      };
      setFavoriteClimbs((prev) => [...prev, newClimb]);
      await addFavoriteClimb(newClimb);
    }
  };

  const isFavorite = favoriteClimbs.some((fav) => fav.id === selectedClimb?.id);
  if (!selectedClimb) {
    return <div className="text-center text-gray-500">No climb selected</div>;
  }

  const [score, setScore] = useState("");
  const [photos, setPhotos] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [rating, setRating] = useState(""); // Rating will be a string to match your model
  const [description, setDescription] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);


  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="gold"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.23L12 18.897l-7.417 4.603L6 15.27 0 9.423l8.332-1.268z" />
          </svg>
        ))}
        {halfStar && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="gold" />
                <stop offset="50%" stopColor="gray" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star)"
              d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.23L12 18.897l-7.417 4.603L6 15.27 0 9.423l8.332-1.268z"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="gray"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.23L12 18.897l-7.417 4.603L6 15.27 0 9.423l8.332-1.268z" />
          </svg>
        ))}
      </>
    );
  };

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

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          "https://localhost:7195/api/Database/ReviewsByClimbID",
          {
            params: { id: selectedClimb.id },
          }
        );
        setReviews(response.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchClimbPhoto();
    fetchAvg();
    if (selectedClimb) {
      fetchReviews();
    }
  }, [selectedClimb]);

  useEffect(() => {
    if (showGallery) {
      setPopupImage(null);
    }
  }, [showGallery]);

  useEffect(() => {
    const checkIfReviewed = () => {
      if (reviews.some((review) => review.UserId === currentUser?.UserId)) {
        setHasReviewed(true);
      } else {
        setHasReviewed(false);
      }
    };

    if (isLoggedIn && currentUser) {
      console.log("Debugging currentUser in ClimbPage:", currentUser);
      checkIfReviewed();
    }
  }, [reviews, currentUser, isLoggedIn]);

  const handleClosePopup = () => {
    setPopupImage(null);
    setShowGallery(false);
  };

  const ShowGallery = () => {
    handleClosePopup();
    setShowGallery(true);
  };

  const handleStarClick = (rating) => {
    setNewRating(rating);
  };

  const handleReviewSubmit = async () => {
    console.log("Submitting review for user:", currentUser.UserId); // Log user ID
    if (!newReview.trim()) {
      setReviewError("Review cannot be empty.");
      return;
    }
    if (newRating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    const reviewData = {
      ReviewID: 99,
      UserId: currentUser.UserId,
      RouteId: selectedClimb.id,
      Rating: newRating * 2, // Convert to a scale of 10 if required by the backend
      Text: newReview, // Use the correct field name expected by the backend
      UserName: currentUser.UserName,
    };

    console.log("Submitting review data:", reviewData); // Log the request payload

    if (!reviewData.UserId || !reviewData.RouteId) {
      console.error("Invalid UserId or RouteId:", reviewData);
      setReviewError("Invalid user or climb. Please try again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://localhost:7195/api/Database/review",
        reviewData
      );
      console.log("Review created successfully:", response.data);

      // Clear form and fetch updated reviews
      setNewReview("");
      setNewRating(0);
      setReviewError("");

      const updatedReviews = await axios.get(
        "https://localhost:7195/api/Database/ReviewsByClimbID",
        {
          params: { id: selectedClimb.id },
        }
      );
      setReviews(updatedReviews.data);

      // Fetch updated average rating
      const avgResponse = await axios.get(
        "https://localhost:7195/api/Database/ClimbAvgRating",
        {
          params: { id: selectedClimb.id },
        }
      );
      setScore(avgResponse.data / 2); // Update average score
    } catch (err) {
      console.error("Could not submit review:", err);
      console.error("Server response:", err.response?.data); // Log server response for debugging
      if (
        err.response?.data?.message?.includes("FOREIGN KEY constraint failed")
      ) {
        setReviewError(
          "Failed to submit review. Please ensure the climb and user exist."
        );
      } else {
        setReviewError("Failed to submit review. Please try again.");
      }
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="w-full max-w-5xl p-6 overflow-hidden bg-white rounded-lg shadow-lg">
        {/* Photo Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {photos.length >= 2 ? (
            photos.slice(0, 2).map((url, index) => (
              <div
                key={index}
                className="relative block overflow-hidden rounded-lg shadow-md hover:cursor-pointer"
                onClick={() => setPopupImage(url)}
              >
                <img
                  decoding="async"
                  data-nimg="fill"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  src={url}
                  alt={`Climb photo ${index + 1}`}
                  className="object-cover w-full h-64"
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
            ))
          ) : (
            <div className="flex items-center justify-center h-64 col-span-2 bg-gray-200 rounded-lg">
              <img
                src="https://via.placeholder.com/300x200?text=No+Image+Available"
                alt="No Image Available"
                className="object-contain h-full"
              />
            </div>
          )}
        </div>

        {/* Main content and map layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Climb Info */}
          <div className="flex-1">
            <div className="flex justify-center items-center mb-4">
              <h1 className="text-4xl font-bold text-gray-900 mr-4">
                {selectedClimb.name}
              </h1>
              {isLoggedIn && (
                <button
                  onClick={() => toggleFavoriteClimb(selectedClimb)}
                  className="text-red-500 hover:text-red-700 text-6xl"
                  aria-label="Toggle Favorite"
                >
                  {isFavorite ? "♥" : "♡"}
                </button>
              )}
            </div>
            <div className="flex justify-center mb-4">{renderStars(score)}</div>
            <p className="mb-2 text-lg text-center text-gray-700">
              <strong>Area:</strong> {selectedClimb.area.areaName}
            </p>
            <p className="mb-2 text-lg text-center text-gray-700">
              <strong>Location:</strong> {selectedClimb.metadata.lat},{" "}
              {selectedClimb.metadata.lng}
            </p>
            <div className="mt-6 text-center">
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">
                Grade
              </h2>
              <span className="inline-block px-4 py-2 text-lg bg-gray-200 rounded">
                {selectedClimb.grades.yds},{" "}
                {selectedClimb.grades.french
                  ? selectedClimb.grades.french
                  : selectedClimb.grades.font}
              </span>
            </div>
          </div>

          {/* Map */}
          <div
            id="climb-map"
            className="flex-1 rounded-lg shadow-lg h-96"
          ></div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          {/* Leave a Review Box */}
          {isLoggedIn && !hasReviewed && (
            <div className="p-6 mb-8 bg-gray-100 rounded-lg shadow-md">
              <h3 className="mb-4 text-xl font-semibold text-gray-800">
                Leave a Review
              </h3>
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    onClick={() => handleStarClick(star)}
                    xmlns="http://www.w3.org/2000/svg"
                    fill={star <= newRating ? "gold" : "gray"}
                    viewBox="0 0 24 24"
                    width="36"
                    height="36"
                    className="cursor-pointer"
                  >
                    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.23L12 18.897l-7.417 4.603L6 15.27 0 9.423l8.332-1.268z" />
                  </svg>
                ))}
              </div>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Write your review here..."
              ></textarea>
              {reviewError && (
                <p className="mt-2 text-sm text-red-500">{reviewError}</p>
              )}
              <button
                onClick={handleReviewSubmit}
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Review
              </button>
            </div>
          )}

          {/* List of Reviews */}
          <h2 className="mb-6 text-3xl font-semibold text-center text-gray-800">
            Reviews
          </h2>
          <div>
            {reviews.length === 0 ? (
              <p className="text-center text-gray-600">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review, index) => (
                  <li
                    key={index}
                    className="p-4 text-gray-800 bg-white rounded-lg shadow-md"
                  >
                    <div className="flex">
                      <strong>{review.UserName || "Anonymous"} </strong> <br />
                      {renderStars(review.Rating / 2)}{" "}
                      {/* Display rating as stars */}
                    </div>
                    {review.Text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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