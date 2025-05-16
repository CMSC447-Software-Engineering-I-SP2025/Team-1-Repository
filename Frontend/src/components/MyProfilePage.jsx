import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import defaultProfilePic from "../../assets/default-profile.jpg";
import { Link } from "react-router-dom";
import { useUser } from "./UserProvider";
import axios from "axios";
import ClimbPage from "./ClimbPage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ibxxlcyqbpfmzohqrtma.supabase.co"; // Your Supabase URL
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhsY3lxYnBmbXpvaHFydG1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQwOTgzNCwiZXhwIjoyMDU4OTg1ODM0fQ.F0iyO-IUVv1aYNUymhQroI2EliHggHHoxUqY_1EnHQQ"; // Your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const MyProfilePage = ({
  onSave,
  currentUser,
  setCurrentUser,
  supabaseUser,
  setSelectedClimb,
  setCurrentPage,
}) => {
  const [activeTab, setActiveTab] = useState("editProfile"); // State for active tab
  const [emailError, setEmailError] = useState(""); // State for email error
  const [phoneError, setPhoneError] = useState(""); // State for phone error
  const [firstNameError, setFirstNameError] = useState(""); // State for first name error
  const [lastNameError, setLastNameError] = useState(""); // State for last name error
  const [reviews, setReviews] = useState([]); // Ensure reviews is initialized as an array
  const [reviewsError, setReviewsError] = useState(""); // State for error handling
  const [profilePic, setProfilePic] = useState(""); // State for profile picture
  const [climbNames, setClimbNames] = useState({}); // State for climb names
  const [editingReviewId, setEditingReviewId] = useState(null); // State for editing reviews
  const maxBioLength = 200; // Maximum character limit for bio

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [favoriteClimbs, setFavoriteClimbs] = useState([]); // State for favorite climbs
  const [friends, setFriends] = useState([]); // State for friends
  const [friendRequests, setFriendRequests] = useState([]); // State for friend requests
  const [groups, setGroups] = useState([]); // State for groups
  const [userRelations, setUserRelations] = useState([]);
  const [groupRelations, setGroupRelations] = useState([]);
  const [isAddFriendPopupOpen, setIsAddFriendPopupOpen] = useState(false); // State for popup visibility
  const [receiver, setReceiver] = useState(""); // State for receiver username
  const [addFriendError, setAddFriendError] = useState(""); // State for error handling
  const [user2ProfileImages, setUser2ProfileImages] = useState({}); // Cache for User2 profile images

  const [isAddGroupPopupOpen, setIsAddGroupPopupOpen] = useState(false); // State for group popup visibility
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupRequirements, setGroupRequirements] = useState("open");
  const [groupPrice, setGroupPrice] = useState(0);
  const [groupType, setGroupType] = useState("public");

  const climbCache = {};

  useEffect(() => {
    fetchFriends(currentUser.UserId);
  }, [isAddFriendPopupOpen]);

  const getUser = async (userId) => {
    try {
      const response = await axios.get(
        `https://localhost:7195/api/Database/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

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

  useEffect(() => {
    if (activeTab === "reviews" && currentUser) {
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
                const climbData = climbDetails.climbs.find(
                  (c) => c.id === climb.climbId
                );

                if (!climbData) {
                  console.warn(
                    "Climb not found in response.climbs:",
                    climb.climbId
                  );
                  return null;
                }

                // Log area details to the console
                console.log(`Climb ID: ${climb.id}`);
                console.log(`Area Name: ${climbDetails.areaName}`);
                console.log(
                  `Location: Lat: ${climbDetails.metadata.lat}, Lng: ${climbDetails.metadata.lng}`
                );

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

    if (activeTab === "reviews" && reviews.length > 0) {
      fetchClimbNames();
    }
  }, [activeTab, reviews]);

  const fetchFriends = async (userID) => {
    try {
      console.log("Fetching friends for user ID:", userID);
      const url = `https://localhost:7195/api/Database/userRelations/${encodeURIComponent(
        userID
      )}`;
      const response = await axios.get(url);
      console.log("Fetched friends:", response.data);
      setUserRelations(response.data);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFriends(currentUser.UserId);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchGroups = async (userID) => {
      try {
        console.log("Fetching groups for user ID:", userID);
        //const url1 = `https://localhost:7195/api/Database/groupsOwnedByUser/${encodeURIComponent(
        //   userID
         //)}`;
         //const response1 = await axios.get(url1);
        const url2 = `https://localhost:7195/api/Database/groupsByUser/${encodeURIComponent(
          userID
        )}`;
          const response2 = await axios.get(url2);
        const response = response2.data;
        //const response = response1.data.concat(response2.data);
        console.log("Fetched groups:", response);
        setGroupRelations(response);
      } catch (err) {
        console.error("Failed to fetch groups:", err);
      }
    };

    if (currentUser) {
      fetchGroups(currentUser.UserId);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUser2ProfileImages = async () => {
      const images = {};
      for (const relation of userRelations) {
        const userId =
          relation.User1Id === currentUser.UserId
            ? relation.User2Id
            : relation.User1Id;

        // Only fetch if the image is not already cached
        if (!user2ProfileImages[userId]) {
          try {
            const user = await getUser(userId);
            console.log("Fetched user:", user);
            images[userId] = user?.ProfileImage || defaultProfilePic;
          } catch (error) {
            console.error(
              `Error fetching profile image for user ${userId}:`,
              error
            );
            images[userId] = defaultProfilePic; // Fallback to default if error occurs
          }
        }
      }

      console.log("Fetched user2 profile images:", images);
      setUser2ProfileImages((prev) => ({ ...prev, ...images }));
    };

    if (userRelations.length > 0) {
      fetchUser2ProfileImages();
    }
  }, [userRelations]);

  const acceptFriendRequest = async (senderID, receiverID) => {
    try {
      console.log(
        "Accepting friend request from:",
        senderID,
        "to:",
        receiverID
      );
      const url = `https://localhost:7195/api/Database/acceptFriendRequest?senderUserId=${encodeURIComponent(
        senderID
      )}&receiverUserId=${encodeURIComponent(receiverID)}`;
      await axios.post(url);
      console.log("Friend request accepted.");
      fetchFriends(currentUser.UserId); // Refresh friends list
    } catch (err) {
      console.error("Failed to accept friend request:", err);
    }
  };

  const rejectFriendRequest = async (senderID, receiverID) => {
    try {
      console.log(
        "Rejecting friend request from:",
        senderID,
        "to:",
        receiverID
      );
      const url = `https://localhost:7195/api/Database/rejectFriendRequest?senderUserId=${encodeURIComponent(
        senderID
      )}&receiverUserId=${encodeURIComponent(receiverID)}`;
      await axios.delete(url);
      console.log("Friend request rejected.");
      fetchFriends(currentUser.UserId); // Refresh friends list
    } catch (err) {
      console.error("Failed to reject friend request:", err);
    }
  };

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

  const GetClimb = async (climbId) => {
    if (climbCache[climbId]) {
      return climbCache[climbId]; // Return cached climb name if available
    }
    try {
      console.log("Fetching climb with ID:", climbId);
      const response = await axios.post(
        `https://localhost:7195/Search/ClimbID/${climbId}`,
        { method: "POST" }
      );
      console.log("Fetched climb data:", response.data);
      climbCache[climbId] = response.data.name || "Unknown Climb"; // Cache the climb name
      return climbCache[climbId];
    } catch (error) {
      console.error("Error fetching climb:", error);
      return "Unknown Climb";
    }
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

  const sendFriendRequest = async (e) => {
    e.preventDefault();

    if (receiver === currentUser.UserName) {
      setAddFriendError("You cannot send a friend request to yourself.");
      return;
    }

    try {
      const url = `https://localhost:7195/api/Database/sendFriendRequest?receiverUserName=${encodeURIComponent(
        receiver
      )}&senderUserId=${encodeURIComponent(currentUser.UserId)}`;
      await axios.post(url);
      console.log("Friend request sent successfully.");
      setIsAddFriendPopupOpen(false); // Close popup on success
      setReceiver(""); // Reset input field
      setAddFriendError(""); // Clear any errors
    } catch (error) {
      console.error("Error sending friend request:", error);
      setAddFriendError("Failed to send friend request. Please try again.");
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    const groupData = {
      GroupId: 0,
      GroupName: groupName,
      GroupDescription: groupDescription,
      JoinRequirements: groupRequirements,
      Price: groupPrice,
      GroupType: groupType,
      GroupOwner: currentUser.UserId,
      GroupImage: "",
    };
    console.log("Creating group with data:", groupData);
    try {
      const url = `https://localhost:7195/api/Database/climbGroup`;
      const response = await axios.post(url, groupData);
        console.log("Created group successfully:", response.data);
        joinGroup(e);
        fetchGroups(e);
      setIsAddGroupPopupOpen(false); // Close popup on success
      setGroupName("");
      setGroupDescription("");
      setGroupRequirements("open");
      setGroupPrice(0);
      setGroupType("public");
    } catch (error) {
      console.error("Error creating group:", error);
    }
    };

    const joinGroup = async (e) => {
        e.preventDefault();

        // Prepare the data for the review
        /*
        const requestData = {
            Receiver: receiver,
            Sender: userID //change this to userID
        };*/

        try {
            const url = `https://localhost:7195/api/Database/joinGroup?userId=${encodeURIComponent(currentUser.UserId)}&groupName=${encodeURIComponent(groupName)}`;
            const response = await axios.post(url);
            console.log('joined group successfully:', response.data);
        } catch (error) {
            console.error('Error joining group:', error);
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
        const fileName = `${supabaseUser.id}-${Date.now()}.jpg`;
        const { data, error } = await supabase.storage
          .from("profile-pictures")
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

    console.log("Payload being sent to the server:", updatedUser); // For debugging

    onSave(updatedUser);
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
                }
              >
                <img
                  src={profilePic || defaultProfilePic}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
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
                          <div className="flex items-center mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                onClick={() =>
                                  setReviews((prev) =>
                                    prev.map((r) =>
                                      r.ReviewId === review.ReviewId
                                        ? { ...r, Rating: star * 2 }
                                        : r
                                    )
                                  )
                                }
                                xmlns="http://www.w3.org/2000/svg"
                                fill={
                                  review.Rating >= star * 2 ? "gold" : "gray"
                                }
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="cursor-pointer"
                              >
                                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.417 8.23L12 18.897l-7.417 4.603L6 15.27 0 9.423l8.332-1.268z" />
                              </svg>
                            ))}
                          </div>
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

        {/* Community Tab */}
        {activeTab === "community" && (
          <div>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Community</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Friends Box */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Friends
                  </h3>
                  <button
                    onClick={() => setIsAddFriendPopupOpen(true)} // Open popup
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Add Friend
                  </button>
                </div>
                {userRelations.length === 0 ? (
                  <p className="text-gray-600">You have no friends yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {userRelations.map((userRelation, index) => {
                      const isCurrentUserUser1 =
                        userRelation.User1Id === currentUser.UserId;
                      const displayedUserId = isCurrentUserUser1
                        ? userRelation.User2Id
                        : userRelation.User1Id;
                      const displayedUserName = isCurrentUserUser1
                        ? userRelation.User2Name
                        : userRelation.User1Name;
                      const displayedUserProfileImage =
                        user2ProfileImages[displayedUserId] ||
                        defaultProfilePic;

                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-100 rounded shadow"
                        >
                          <div className="flex items-center space-x-4">
                            {/* Display the other user's profile image */}
                            <img
                              src={displayedUserProfileImage}
                              alt="Profile"
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <p className="text-gray-800">
                                <strong>{displayedUserName}</strong>
                              </p>
                              <p className="text-sm text-gray-600">
                                {userRelation.RelationType ===
                                  "pending_user1" && "Pending..."}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {/* If currentUser is the sender (User1), show "Friend Request Sent" */}
                            {userRelation.User1Id === currentUser.UserId &&
                              userRelation.RelationType === "pending_user1" && (
                                <span className="px-3 py-1 text-sm text-center text-gray-700 bg-gray-200 rounded">
                                  Friend Request Sent
                                </span>
                              )}

                            {/* If currentUser is the receiver (User2), allow accept/reject */}
                            {userRelation.User2Id === currentUser.UserId &&
                              (userRelation.RelationType === "pending_user1" ||
                                userRelation.RelationType ===
                                  "pending_user2") && (
                                <>
                                  <button
                                    onClick={() =>
                                      acceptFriendRequest(
                                        userRelation.User1Id,
                                        userRelation.User2Id
                                      )
                                    }
                                    className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      rejectFriendRequest(
                                        userRelation.User1Id,
                                        userRelation.User2Id
                                      )
                                    }
                                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                            {/* Unfriend button for existing friends */}
                            {!(
                              userRelation.User2Id === currentUser.UserId &&
                              (userRelation.RelationType === "pending_user1" ||
                                userRelation.RelationType === "pending_user2")
                            ) && (
                              <button
                                onClick={() =>
                                  rejectFriendRequest(
                                    userRelation.User1Id,
                                    userRelation.User2Id
                                  )
                                }
                                className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                              >
                                Unfriend
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Groups Box */}
              <div className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Groups
                  </h3>
                  <button
                    onClick={() => setIsAddGroupPopupOpen(true)} // Open popup
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Add Group
                  </button>
                </div>
                {groupRelations.length === 0 ? (
                  <p className="text-gray-600">
                    You are not part of any groups yet.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {groupRelations.map((groupRelation, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-100 rounded shadow"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {groupRelation.GroupName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {groupRelation.GroupDescription}
                          </p>
                        </div>
                        <Link
                          to="/group"
                          state={{ group: groupRelation }}
                          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          View
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Friend Popup */}
        {isAddFriendPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Send Friend Request
              </h2>
              <form onSubmit={sendFriendRequest}>
                <div className="mb-4">
                  <label
                    htmlFor="receiver"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Friend's Username
                  </label>
                  <input
                    type="text"
                    id="receiver"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                {addFriendError && (
                  <p className="mb-4 text-sm text-red-500">{addFriendError}</p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddFriendPopupOpen(false)} // Close popup
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Group Popup */}
        {isAddGroupPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                          <h2 className="mb-4 text-xl font-bold text-gray-800">
                              Join Group
                          </h2>
                          <form onSubmit={joinGroup}>
                              <div className="mb-4">
                                  <label
                                      htmlFor="groupName"
                                      className="block mb-2 text-sm font-medium text-gray-700"
                                  >
                                      Group Name
                                  </label>
                                  <input
                                      type="text"
                                      id="groupName"
                                      value={groupName}
                                      onChange={(e) => setGroupName(e.target.value)}
                                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter group name"
                                  />
                              </div>
                              <div className="flex justify-end space-x-4">
                                  <button
                                      type="button"
                                      onClick={() => setIsAddGroupPopupOpen(false)} // Close popup
                                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                  >
                                      Cancel
                                  </button>
                                  <button
                                      type="submit"
                                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                                  >
                                      Join Group
                                  </button>
                              </div>
                          </form>
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Create Group
              </h2>
              <form onSubmit={createGroup}>
                <div className="mb-4">
                  <label
                    htmlFor="groupName"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="groupDescription"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Group Description
                  </label>
                  <textarea
                    id="groupDescription"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group description"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="groupRequirements"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Join Requirements
                  </label>
                  <select
                    id="groupRequirements"
                    value={groupRequirements}
                    onChange={(e) => setGroupRequirements(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="invite_only">Invite Only</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                {groupRequirements === "paid" && (
                  <div className="mb-4">
                    <label
                      htmlFor="groupPrice"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Price
                    </label>
                    <input
                      type="number"
                      id="groupPrice"
                      value={groupPrice}
                      onChange={(e) => setGroupPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter price"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="groupType"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Group Type
                  </label>
                  <select
                    id="groupType"
                    value={groupType}
                    onChange={(e) => setGroupType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddGroupPopupOpen(false)} // Close popup
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Create Group
                  </button>
                              </div>
                              
                          </form>
                          
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
