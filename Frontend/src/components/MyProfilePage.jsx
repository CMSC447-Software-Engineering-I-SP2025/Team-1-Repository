import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import defaultProfilePic from "../../assets/default-profile.jpg";
import { Link } from "react-router-dom";
import { useUser } from "./UserProvider";
import axios from "axios";
import ClimbPage from "./ClimbPage";

const MyProfilePage = ({
  onSave,
  currentUser,
  setCurrentUser,
  supabaseUser,
  setSelectedClimb,
}) => {
  const [activeTab, setActiveTab] = useState("editProfile"); // State for active tab
  const [emailError, setEmailError] = useState(""); // State for email error
  const [phoneError, setPhoneError] = useState(""); // State for phone error
  const [firstNameError, setFirstNameError] = useState(""); // State for first name error
  const [lastNameError, setLastNameError] = useState(""); // State for last name error
  const [reviews, setReviews] = useState([]); // Ensure reviews is initialized as an array
  const [reviewsError, setReviewsError] = useState(""); // State for error handling
  const maxBioLength = 200; // Maximum character limit for bio
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [favoriteClimbs, setFavoriteClimbs] = useState([]); // State for favorite climbs

  useEffect(() => {
    if (activeTab === "reviews" && currentUser) {
      const fetchReviews = async () => {
        try {
          console.log("Fetching reviews for user ID:", currentUser.UserId);
          const response = await axios.get(
            `https://localhost:7195/api/Database/reviewsByUser/${currentUser.UserId}`
          );
          setReviews(response.data); // Update reviews state with fetched data
          setReviewsError(""); // Clear any previous errors
          console.log("Fetched reviews:", response.data);
        } catch (error) {
          console.error("Error fetching reviews:", error);
          setReviewsError("Failed to load reviews. Please try again later.");
        }
      };

      fetchReviews();
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/; // Allow 10 to 15 digits
    return phoneRegex.test(phone);
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

    // Call the onSave callback with all updated fields
    onSave({
      ...currentUser,
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phone,
      Bio: bio,
      UserName: username,
    });
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
              <div className="relative w-24 h-24 overflow-hidden rounded-full">
                <img
                  src={currentUser.profilePic || defaultProfilePic}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
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
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border ${
                  emailError ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 ${
                  emailError ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-2 border ${
                  phoneError ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 ${
                  phoneError ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-500">{phoneError}</p>
              )}
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
                  <li key={index} className="p-4 bg-gray-100 rounded shadow">
                    <h3 className="text-lg font-semibold">{review.title}</h3>
                    <p className="text-gray-700">{review.content}</p>
                    <p className="text-sm text-gray-500">
                      Posted on: {new Date(review.date).toLocaleDateString()}
                    </p>
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
            {Array.isArray(currentUser.userRelations) ? (
              currentUser.userRelations.map((userRelation, index) => (
                <li key={index} style={{ marginBottom: "1rem" }}>
                  <strong>User1ID:</strong> {userRelation.user1ID} <br />
                  <strong>User2ID:</strong> {userRelation.user2ID}
                  <br />
                  <strong>RelationType:</strong> {userRelation.relationType}
                </li>
              ))
            ) : (
              <p>No user relations available.</p>
            )}
            <h2 className="text-xl font-bold text-gray-800">Groups</h2>
            <Link to="/add-group" className="px-3">
              +
            </Link>
            {Array.isArray(currentUser.groupRelations) && currentUser.groupRelations.length === 0 ? (
              <p>You are in no groups, haha, loser.</p>
            ) : (
              Array.isArray(currentUser.groupRelations) && (
                <ul>
                  {currentUser.groupRelations.map((groupRelation, index) => (
                    <li key={index} style={{ marginBottom: "1rem" }}>
                      <Link
                        to="/group"
                        state={{ groupID: groupRelation.groupID }}
                        className="px-3"
                      >
                        <strong>GroupID:</strong> {groupRelation.groupID} <br />
                        <strong>RelationType:</strong> {groupRelation.relationType}
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;