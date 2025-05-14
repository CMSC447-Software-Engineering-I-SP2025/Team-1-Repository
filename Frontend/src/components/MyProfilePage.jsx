import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import defaultProfilePic from "../../assets/default-profile.jpg";
import { Link } from "react-router-dom";
import { useUser } from "./UserProvider";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
// Initialize Supabase client
const supabaseUrl = "https://ibxxlcyqbpfmzohqrtma.supabase.co"; // Replace with your Supabase URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhsY3lxYnBmbXpvaHFydG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTgzNCwiZXhwIjoyMDU4OTg1ODM0fQ.F0iyO-IUVv1aYNUymhQroI2EliHggHHoxUqY_1EnHQQ"; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const MyProfilePage = ({
  onSave,
  currentUser,
  setCurrentUser,
  supabaseUser,
}) => {
  const [activeTab, setActiveTab] = useState("editProfile"); // State for active tab
  const [emailError, setEmailError] = useState(""); // State for email error
  const [phoneError, setPhoneError] = useState(""); // State for phone error
  const [firstNameError, setFirstNameError] = useState(""); // State for first name error
  const [lastNameError, setLastNameError] = useState(""); // State for last name error
  const [reviews, setReviews] = useState([]); // Ensure reviews is initialized as an array
  const [reviewsError, setReviewsError] = useState(""); // State for error handling
  const [climbNames, setClimbNames] = useState({}); // State to store climb names
  const [editingReviewId, setEditingReviewId] = useState(null); // State for editing review
  const maxBioLength = 200; // Maximum character limit for bio

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState("");

  const climbCache = {};

  const fetchReviews = async () => {
    try {
      console.log("Fetching reviews for user ID:", currentUser.UserId);
      const response = await axios.get(
        `https://localhost:7195/api/Database/reviewsByUser/${currentUser.UserId}`
      );
      setReviews(response.data);
      setReviewsError("");
      console.log("Fetched reviews:", response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviewsError("Failed to load reviews. Please try again later.");
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && currentUser) {
      fetchReviews();
    }
  }, [activeTab, currentUser]);

  const GetClimb = async (climbId) => {
    if (climbCache[climbId]) {
      return climbCache[climbId]; // Return cached climb name if available
    }
    try {
      console.log("Fetching climb with ID:", climbId);
      const response = await axios.post(
        `https://localhost:7195/Search/ClimbID/${climbId}`,
        {
          method: "POST",
        }
      );
      console.log("Fetched climb data:", response.data);
      climbCache[climbId] = response.data.name || "Unknown Climb"; // Cache the climb name
      return climbCache[climbId];
    } catch (error) {
      console.error("Error fetching climb:", error);
      return "Unknown Climb";
    }
  };

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.FirstName || "");
      setLastName(currentUser.LastName || "");
      setEmail(currentUser.Email || "");
      setPhone(currentUser.PhoneNumber || "");
      setBio(currentUser.Bio || "");
      setUsername(currentUser.UserName || "");
      setProfilePic(currentUser.ProfileImage || defaultProfilePic); // Initialize profile picture
    }
  }, [currentUser]);

    if (activeTab === "myClimbs" && currentUser) {
      const fetchFavoriteClimbs = async () => {
        try {
          // Fetch the list of favorite climbs
          const response = await axios.get(
            "https://localhost:7195/api/Database/FavoriteClimb",
            {
              params: { userId: currentUser.UserId },
            }
          );

          const favoriteClimbsData = response.data;
          console.log("Fetched favorite climbs:", favoriteClimbsData);

          // Fetch additional details for each climb using ClimbWithParentArea API
          const detailedClimbs = await Promise.all(
            favoriteClimbsData.map(async (climb) => {
              try {
                const climbDetailsResponse = await axios.post(
                  "https://localhost:7195/Search/ClimbWithParentArea",
                  {
                    climbId: climb.climbId,
                    parentAreaId: climb.parentAreaId,
                  }
                );

                const climbDetails = climbDetailsResponse.data;
                console.log("Climb details response:", climbDetails);

                // Get the climb object from the list of climbs in the response
                const climbData = climbDetails.climbs.find(c => c.id === climb.climbId);

                if (!climbData) {
                  console.warn("Climb not found in response.climbs:", climb.climbId);
                  return null;
                }

                // Log area details to the console
                console.log(`Climb ID: ${climb.id}`);
                console.log(`Area Name: ${climbDetails.areaName}`);
                console.log(`Location: Lat: ${climbDetails.metadata.lat}, Lng: ${climbDetails.metadata.lng}`);

                return {
                  id: climb.climbId,
                  name: climbData.name,
                  areaName: climbDetails.areaName,
                  location: {
                    lat: climbDetails.metadata.lat,
                    lng: climbDetails.metadata.lng,
                  },
                };
              } catch (error) {
                console.error(
                  `Error fetching details for climb ID ${climb.id}:`,
                  error
                );
                return null; // Return null if there's an error
              }
            })
          );

          // Filter out any null values (in case of errors)
          const validClimbs = detailedClimbs.filter((climb) => climb !== null);
          console.log("Valid climbs:", validClimbs);

          setFavoriteClimbs(validClimbs);
        } catch (error) {
          console.error("Error fetching favorite climbs:", error);
        }
      };

      fetchFavoriteClimbs();
    }
  }, [activeTab, currentUser]);

  console.log("Debugging favoriteClimbs:", favoriteClimbs);
  console.log("Debugging currentUser in MyProfilePage:", currentUser.UserId);
  console.log("Debugging Climb name:", favoriteClimbs.map((climb) => climb.name));

  const removeFavoriteClimb = async (climbId) => {
    try {
      await axios.delete("https://localhost:7195/api/Database/FavoriteClimb", {
        data: {
          userId: currentUser.UserId,
          climbId: climbId,
        },
      });

      console.log("Successfully removed favorite climb:", climbId);

      // Remove from UI
      setFavoriteClimbs((prev) => prev.filter((climb) => climb.id !== climbId));
    } catch (error) {
      console.error("Error removing favorite climb:", error);
    }
  };
  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.FirstName || "");
      setLastName(currentUser.LastName || "");
      setEmail(currentUser.Email || "");
      setPhone(currentUser.PhoneNumber || "");
      setBio(currentUser.Bio || "");
      setUsername(currentUser.UserName || "");
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("Debugging currentUser in MyProfilePage:", currentUser);
  }, [currentUser]);
    const fetchClimbNames = async () => {
      const names = {};
      for (const review of reviews) {
        if (!climbNames[review.RouteId]) {
          names[review.RouteId] = await GetClimb(review.RouteId);
        }
      }
      setClimbNames((prev) => ({ ...prev, ...names }));
    };

    if (activeTab === "reviews" && reviews.length > 0) {
      fetchClimbNames();
    }
  }, [activeTab, reviews]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/; // Allow 10 to 15 digits
    return phoneRegex.test(phone);
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result); // Set Base64 string in profilePic state
      };
      reader.readAsDataURL(file); // Convert file to Base64
    }
  };

  const base64ToBlob = (base64, mimeType) => {
    const base64Data = base64.split(",")[1]; // Extract Base64 data after the comma
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length)
      .fill()
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    let hasError = false;
    // Validate first name
    if (!firstName.trim()) {
      setFirstNameError("First name cannot be empty.");
      hasError = true;
    } else {
      setFirstNameError("");
    }

    // Validate last name
    if (!lastName.trim()) {
      setLastNameError("Last name cannot be empty.");
      hasError = true;
    } else {
      setLastNameError("");
    }

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    // Validate phone
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid phone number (10-15 digits).");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (hasError) return;

    // Prepare updated user data
    const updatedUser = {
      ...currentUser,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phone,
      Bio: bio,
      UserName: username,
    };

    if (profilePic && profilePic.startsWith("data:image")) {
      console.log("Uploading profile picture to Supabase...");
      try {
        const fileBlob = base64ToBlob(profilePic, "image/jpeg");
        const fileName = `${supabaseUser.id}-${Date.now()}.jpg`; // Generate a unique file name

        const { data, error } = await supabase.storage
          .from("profile-pictures") // Replace with your bucket name
          .upload(`images/${fileName}`, fileBlob, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error("Error uploading profile picture:", error);
        } else {
          console.log("Profile picture uploaded successfully:", data);
          updatedUser.ProfileImage = `https://ibxxlcyqbpfmzohqrtma.supabase.co/storage/v1/object/public/profile-pictures/images/${fileName}`;
        }
      } catch (error) {
        console.error("Error during file upload:", error);
      }
    }

    console.log("Payload being sent to the server:", updatedUser); // Log payload for debugging

    onSave(updatedUser);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `https://localhost:7195/api/Database/review/${reviewId}`
      );
      fetchReviews();
      console.log(`Review with ID ${reviewId} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete review with ID ${reviewId}:`, error);
    }
  };

  const handleUpdateReview = async (review) => {
    try {
      const updatedReview = {
        ...review,
        Rating: review.Rating,
        Text: review.Text,
      };
      await axios.put(
        `https://localhost:7195/api/Database/review/${review.ReviewId}`,
        updatedReview
      );
      fetchReviews();
      console.log(`Review with ID ${review.ReviewId} updated successfully.`);
    } catch (error) {
      console.error(
        `Failed to update review with ID ${review.ReviewId}:`,
        error
      );
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 bg-gray-100 dark:bg-gray-900 dark:text-white">
      <div className="max-w-4xl p-6 mx-auto mt-10 bg-white rounded-lg">
        {/* Tabs */}
        <div className="flex justify-between px-4 mb-6 border-b border-gray-300">
          {["editProfile", "myClimbs", "reviews", "photos", "community"].map(
            (tab) => (
              <div
                key={tab}
                className={`relative pb-3 text-base font-medium transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? "text-blue-600 border-b-4 border-blue-600"
                    : "text-gray-500 hover:text-blue-600 hover:border-b-4 hover:border-blue-300"
                }`}
                onClick={() => setActiveTab(tab)}
                style={{ flex: 1, textAlign: "center" }}
              >
                {tab === "editProfile"
                  ? "Edit Profile"
                  : tab === "myClimbs"
                  ? "My Climbs"
                  : tab === "reviews"
                  ? "Reviews"
                  : tab === "photos"
                  ? "Photos"
                  : "Community"}
              </div>
            )
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "editProfile" && (
          <form onSubmit={handleSaveChanges}>
            {/* Profile Picture and Username */}
            <div className="flex items-center mb-6 space-x-4">
              <div
                className="relative w-24 h-24 overflow-hidden border border-gray-300 rounded-full cursor-pointer"
                onClick={() =>
                  document.getElementById("profilePicInput").click()
                } // Trigger file input click
              >
                <img
                  src={profilePic || defaultProfilePic} // Use profilePic or defaultProfilePic
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden" // Hide the file input
              />
              <div>
                <h2 className="text-xl font-bold text-gray-800">{username}</h2>
              </div>
            </div>

            {/* First Name and Last Name */}
            <div className="flex mb-6 space-x-4">
              <div className="w-1/2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    firstNameError ? "border-red-500" : "border-gray-300"
                  } rounded focus:outline-none focus:ring-2 ${
                    firstNameError
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                />
                {firstNameError && (
                  <p className="mt-1 text-sm text-red-500">{firstNameError}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-2 border ${
                    lastNameError ? "border-red-500" : "border-gray-300"
                  } rounded focus:outline-none focus:ring-2 ${
                    lastNameError ? "focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                {lastNameError && (
                  <p className="mt-1 text-sm text-red-500">{lastNameError}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                disabled
                className="w-full px-4 py-2 text-gray-500 bg-gray-100 border border-gray-300 rounded cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div className="mt-1 text-sm text-gray-500">
                {bio.length}/{maxBioLength} characters
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "myClimbs" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Favorite Climbs</h2>
            {favoriteClimbs.length === 0 ? (
              <p className="text-gray-600">You have no favorite climbs yet.</p>
            ) : (
              <ul className="space-y-4">
                {favoriteClimbs.map((climb) => (
                  <li
                    key={climb.id}
                    className="p-4 bg-gray-100 rounded shadow flex flex-col space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{climb.name}</h3>
                      <button
                        onClick={() => removeFavoriteClimb(climb.id)}
                        className="text-red-500 hover:text-red-700 text-2xl"
                        title="Remove from favorites"
                      >
                        ♥
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <strong>Area Name:</strong> {climb.areaName}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <strong>Location:</strong> Lat: {climb.location.lat}, Lng:{" "}
                      {climb.location.lng}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Reviews</h2>
            {reviewsError ? (
              <p className="text-red-500">{reviewsError}</p>
            ) : !Array.isArray(reviews) || reviews.length === 0 ? ( // Validate reviews is an array
              <p className="text-gray-600">You have no reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review, index) => (
                  <li
                    key={index}
                    className="relative flex items-center p-4 bg-gray-100 rounded shadow"
                  >
                    <div className="flex-1 pr-24">
                      {" "}
                      {/* Add padding to the right */}
                      <div className="flex items-center">
                        <h3 className="mr-2 text-lg font-semibold">
                          {climbNames[review.RouteId] || "Loading..."}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => {
                            const starValue = i + 1;
                            return (
                              <span
                                key={i}
                                className={`text-2xl ${
                                  review.Rating >= starValue * 2
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {editingReviewId === review.ReviewId ? (
                        <>
                          <textarea
                            defaultValue={review.Text}
                            onChange={(e) =>
                              setReviews((prev) =>
                                prev.map((r) =>
                                  r.ReviewId === review.ReviewId
                                    ? { ...r, Text: e.target.value }
                                    : r
                                )
                              )
                            }
                            className="w-full p-2 mt-2 border rounded"
                          ></textarea>
                        </>
                      ) : (
                        <p className="mt-2 text-gray-700">{review.Text}</p>
                      )}
                    </div>
                    <div className="absolute flex flex-col space-y-2 top-4 right-4">
                      {editingReviewId === review.ReviewId ? (
                        <>
                          <button
                            onClick={() => {
                              handleUpdateReview(review);
                              setEditingReviewId(null);
                            }}
                            className="w-20 px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => setEditingReviewId(null)}
                            className="w-20 px-4 py-2 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingReviewId(review.ReviewId)}
                            className="w-20 px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.ReviewId)}
                            className="w-20 px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Photos</h2>
            <p className="text-gray-600">Gallery of photos will go here.</p>
          </div>
        )}
        {activeTab === "community" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Friends</h2>
            <Link to="/add-friend" className="px-3">
              +
            </Link>
            {currentUser.userRelations.length === 0 ? (
              <p>You have no friends, haha, loser.</p>
            ) : (
              <ul>
                {currentUser.userRelations.map((userRelation, index) => (
                  <li key={index} style={{ marginBottom: "1rem" }}>
                    <strong>User1ID:</strong> {userRelation.user1ID} <br />
                    <strong>User2ID:</strong> {userRelation.user2ID}
                    <br />
                    <strong>RelationType:</strong> {userRelation.relationType}
                  </li>
                ))}
              </ul>
            )}
            <h2 className="text-xl font-bold text-gray-800">Groups</h2>
            <Link to="/add-group" className="px-3">
              +
            </Link>
            {currentUser.groupRelations.length === 0 ? (
              <p>You are in no groups, haha, loser.</p>
            ) : (
              <ul>
                {currentUser.groupRelations.map((groupRelation, index) => (
                  <li key={index} style={{ marginBottom: "1rem" }}>
                    <Link
                      to="/group"
                      state={{ groupID: groupRelation.groupID }}
                      className="px-3"
                    >
                      <strong>GroupID:</strong> {groupRelation.groupID} <br />
                      <strong>RelationType:</strong>{" "}
                      {groupRelation.relationType}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;