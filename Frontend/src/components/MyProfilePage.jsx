import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";
import { useLocation } from "react-router-dom";
import defaultProfilePic from "../../assets/default-profile.jpg";
import { Link } from "react-router-dom";
import axios from "axios";
//god is dead
const MyProfilePage = ({ onSave }) => {
  const location = useLocation(); // Get the location object from React Router
  const { user: authenticatedUser, loading } = useUser();
  const navigate = useNavigate(); // Add navigate for redirection
  const user = authenticatedUser || {}; // Fallback to location.state if needed
  const [profilePic, setProfilePic] = useState(defaultProfilePic); // State for profile picture
  const [isHovered, setIsHovered] = useState(false); // State for hover effect
  const [bio, setBio] = useState(user.bio || ""); // Initialize bio from user
  const [firstName, setFirstName] = useState(user.firstName || "John");
  const [lastName, setLastName] = useState(user.lastName || "Doe");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [phoneCountry, setPhoneCountry] = useState(user.phoneCountry || "+1");
  const [boulderGradeRange, setBoulderGradeRange] = useState(
    user.boulderGradeRange || { min: "V0", max: "V5" }
  );
  const [ropeGradeRange, setRopeGradeRange] = useState(
    user.ropeGradeRange || { min: "5.8", max: "5.12" }
  );
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
  const [favoriteClimbs, setFavoriteClimbs] = useState([]); // State for favorite climbs

    const [userRelations, setUserRelations] = useState();//useState([userRelation1, userRelation2]);

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
    /*const [groupRelation1] = useState({
        groupID: "1",
        relationType: "invited"
    });
    const [groupRelation2] = useState({
        groupID: "2",
        relationType: "member"
    });*/

    const [groupRelations, setGroupRelations] = useState();//useState([groupRelation1, groupRelation2]);

  useEffect(() => {
    if (!loading && authenticatedUser === null) {
      navigate("/login"); // Redirect to login only after loading is complete
    }
  }, [authenticatedUser, loading, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }, []);

  useEffect(() => {

        const fetchFriends = async (userID) => {
            try {
                console.log("User ID Friends are being gotten for:", userID);
                
                const url = `https://localhost:7195/api/Database/userRelations/${encodeURIComponent(userID)}`
                const response = await axios.get(
                    url
                );
                console.log("API Response:", response.data);
                setUserRelations(response.data);
            } catch (err) {
                console.error("Failed to fetch friends:", err);
                //setError("Could not load friends.");
            }
        };

        fetchFriends(user.id);
  }, [user.id]);
  useEffect(() => {
    if (activeTab === "reviews" && currentUser) {
      fetchReviews();
    }
  });

    useEffect(() => {

        const fetchGroups = async (userID) => {
            try {
                console.log("User ID groups are being fetched for:", userID);

                const url1 = `https://localhost:7195/api/Database/groupsOwnedByUser/${encodeURIComponent(userID)}`
                const response1 = await axios.get(
                    url1
                );
                const url2 = `https://localhost:7195/api/Database/groupsByUser/${encodeURIComponent(userID)}`
                const response2 = await axios.get(
                    url2
                );
                const response = response1.data.concat(response2.data);
                console.log("API Response for groups:", response);
                setGroupRelations(response);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
                //setError("Could not load groups.");
            }
        };

        fetchGroups(user.id);
    }, [user.id]);

    const acceptFriendRequest = async (senderID, receiverID) => {
        try {
            console.log("Accepting friend request from: ", senderID, " to: ", receiverID);

            const url = `https://localhost:7195/api/Database/acceptFriendRequest?senderUserId=${encodeURIComponent(senderID)}&receiverUserId=${encodeURIComponent(receiverID)}`
            const response = await axios.post(
                url
            );
            console.log("API Response for friends:", response.data);
        } catch (err) {
            console.error("Failed accept friend request:", err);
        }
    };

    const rejectFriendRequest = async (senderID, receiverID) => {
        try {
            console.log("rejecting friend request from: ", senderID, " to: ", receiverID);

            const url = `https://localhost:7195/api/Database/rejectFriendRequest?senderUserId=${encodeURIComponent(senderID)}&receiverUserId=${encodeURIComponent(receiverID)}`
            const response = await axios.delete(
                url
            );
            console.log("API Response:", response.data);
        } catch (err) {
            console.error("Failed reject friend request:", err);
        }
    };

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
        const fetchClimbNames = async () => {
            const names = {};
            for (const review of reviews) {
                if (!climbNames[review.RouteId]) {
                    names[review.RouteId] = await GetClimb(review.RouteId);
                }
            }
            setClimbNames((prev) => ({ ...prev, ...names }));
        };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/; // Allow 10 to 15 digits
    return phoneRegex.test(phone);
  };

  const formatPhoneNumber = (phone) => {
    // Format phone number as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, ""); // Remove non-numeric characters
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
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
  };
  const handleBioChange = (event) => {
    if (event.target.value.length <= maxBioLength) {
      setBio(event.target.value); // Update bio state
    }
  };

  const handleSaveChanges = (event) => {
    event.preventDefault();

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    // Validate phone
    if (!validatePhone(phone)) {
      setPhoneError("Please enter a valid phone number (10-15 digits).");
      return;
    } else {
      setPhoneError("");
    }

    // Auto-format phone number
    const formattedPhone = formatPhoneNumber(phone);

    const updatedUser = {
      ...user,
      firstName,
      lastName,
      email,
      phone: formattedPhone,
      phoneCountry,
      bio,
      boulderGradeRange,
      ropeGradeRange,
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

    return (authenticatedUser && (
    authenticatedUser &&<div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl p-6 mx-auto mt-10 bg-white rounded-lg">
        {/* Tabs */}
        <div className="flex justify-between px-4 mb-6 border-b border-gray-300">
          {["editProfile", "myClimbs", "reviews", "photos", "community"].map((tab) => (
            <div
              key={tab}
              className={`relative pb-3 text-base font-medium transition-all duration-300 cursor-pointer ${
                activeTab === tab
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-gray-500 hover:text-blue-600 hover:border-b-4 hover:border-blue-300"
              }`}
              onClick={() => setActiveTab(tab)}
              style={{ flex: 1, textAlign: "center" }} // Ensure even spacing and alignment
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
          ))}
        </div>

          {/* Tab Content */}
          {activeTab === "editProfile" && (
            <form onSubmit={handleSaveChanges}>
              {/* Profile Picture */}
              <div className="mb-6">
                <div
                  className="relative w-24 h-24 overflow-hidden rounded-full cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                  {isHovered && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white bg-black bg-opacity-50">
                      Change Image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* First Name and Last Name */}
              <div className="flex mb-6 space-x-4">
                {/* First Name */}
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                  style={{
                    outline: emailError ? "2px solid red" : "none",
                  }}
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
                <div className="flex">
                  <select
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    className="px-2 py-2 border border-gray-300 rounded-l bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ width: "auto" }}
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    {/* Add more country codes as needed */}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-4 py-2 border ${
                      phoneError ? "border-red-500" : "border-gray-300"
                    } rounded-r focus:outline-none focus:ring-2 ${
                      phoneError ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                    style={{
                      outline: phoneError ? "2px solid red" : "none",
                    }}
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                )}
              </div>

              {/* Boulder Grade Range and Rope Climbing Grade Range */}
              <div className="flex mb-6 space-x-4">
                {/* Boulder Grade Range */}
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Boulder Grade Range
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={boulderGradeRange.min}
                      onChange={(e) =>
                        setBoulderGradeRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="V0">V0</option>
                      <option value="V1">V1</option>
                      <option value="V2">V2</option>
                      <option value="V3">V3</option>
                      <option value="V4">V4</option>
                      <option value="V5">V5</option>
                      <option value="V6">V6</option>
                      <option value="V7">V7</option>
                      <option value="V8">V8</option>
                      <option value="V9">V9</option>
                      <option value="V10">V10</option>
                    </select>
                    <select
                      value={boulderGradeRange.max}
                      onChange={(e) =>
                        setBoulderGradeRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="V0">V0</option>
                      <option value="V1">V1</option>
                      <option value="V2">V2</option>
                      <option value="V3">V3</option>
                      <option value="V4">V4</option>
                      <option value="V5">V5</option>
                      <option value="V6">V6</option>
                      <option value="V7">V7</option>
                      <option value="V8">V8</option>
                      <option value="V9">V9</option>
                      <option value="V10">V10</option>
                    </select>
                  </div>
                </div>

                {/* Rope Climbing Grade Range */}
                <div className="w-1/2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Rope Climbing Grade Range
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={ropeGradeRange.min}
                      onChange={(e) =>
                        setRopeGradeRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5.5">5.5</option>
                      <option value="5.6">5.6</option>
                      <option value="5.7">5.7</option>
                      <option value="5.8">5.8</option>
                      <option value="5.9">5.9</option>
                      <option value="5.10">5.10</option>
                      <option value="5.11">5.11</option>
                      <option value="5.12">5.12</option>
                      <option value="5.13">5.13</option>
                      <option value="5.14">5.14</option>
                    </select>
                    <select
                      value={ropeGradeRange.max}
                      onChange={(e) =>
                        setRopeGradeRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="5.5">5.5</option>
                      <option value="5.6">5.6</option>
                      <option value="5.7">5.7</option>
                      <option value="5.8">5.8</option>
                      <option value="5.9">5.9</option>
                      <option value="5.10">5.10</option>
                      <option value="5.11">5.11</option>
                      <option value="5.12">5.12</option>
                      <option value="5.13">5.13</option>
                      <option value="5.14">5.14</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  rows="4"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={handleBioChange}
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
            <h2 className="text-xl font-bold text-gray-800">
              My Favorite Climbs
            </h2>
            {favoriteClimbs.length === 0 ? (
              <p className="text-gray-600">You have no favorite climbs yet.</p>
            ) : (
              <ul className="space-y-4">
                {favoriteClimbs.map((climb) => (
                  <li
                    key={climb.id}
                    className="flex flex-col p-4 space-y-2 bg-gray-100 rounded shadow"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{climb.name}</h3>
                      <button
                        onClick={() => removeFavoriteClimb(climb.id)}
                        className="text-2xl text-red-500 hover:text-red-700"
                        title="Remove from favorites"
                      >
                        ♥
                      </button>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Area Name:</strong> {climb.areaName}
                    </p>
                    <p className="text-sm text-gray-700">
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
                        <Link to="/add-friend" state={{userID: user.id}} className="px-3">
                          +
                      </Link>
                      {userRelations.length === 0 ? (
                          <p>You have no friends, haha, loser.</p>
                      ) : (
                          <ul>
                              {userRelations.map((userRelation, index) => (
                                  <li key={index} style={{ marginBottom: "1rem" }}>
                                      <strong>User1:</strong> {userRelation.User1Name} <br />
                                      <strong>User2:</strong> {userRelation.User2Name}<br />
                                      <strong>RelationType:</strong> {userRelation.RelationType}
                                      {(userRelation.RelationType == "pending_user1" && userRelation.User1Id == user.id) ||
                                          (userRelation.RelationType == "pending_user2" && userRelation.User2Id == user.id) ? (
                                              <div><button onClick={() => acceptFriendRequest(userRelation.User1Id, userRelation.User2Id)}>Accept</button>
                                                  <p> or </p>
                                                  <button onClick={() => rejectFriendRequest(userRelation.User1Id, userRelation.User2Id)}>reject</button></div> 
                                      ): (
                                          <div><button onClick={() => rejectFriendRequest(userRelation.User1Id, userRelation.User2Id)}>unfriend</button></div>
                                      )
                                  }
                                  </li>
                              ))}
                          </ul>
                      )}
                      <h2 className="text-xl font-bold text-gray-800">Groups</h2>
                        <Link to="/add-group" className="px-3" state={{ userID: user.id }} >
                          +
                      </Link>
                      {groupRelations.length === 0 ? (
                          <p>You are in no groups, haha, loser.</p>
                      ) : (
                          <ul>
                                  {groupRelations.map((groupRelation, index) => (
                                  <li key={index} style={{ marginBottom: "1rem" }}>
                                          <Link to="/group" state={{ group: groupRelation }} className="px-3">
                                          <strong>Name:</strong> {groupRelation.GroupName} <br />
                                              <strong>Description:</strong> {groupRelation.GroupDescription}
                                    </Link>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              )}
      </div>
        </div>
    )
  );
};

        export default MyProfilePage;
