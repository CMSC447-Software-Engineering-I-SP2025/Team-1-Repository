import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import defaultProfilePic from "../../assets/default-profile.jpg";
import { Link } from "react-router-dom";
import axios from "axios";

const MyProfilePage = ({ onSave, currentUser }) => {
  const [activeTab, setActiveTab] = useState("editProfile"); // State for active tab
  const [emailError, setEmailError] = useState(""); // State for email error
  const [phoneError, setPhoneError] = useState(""); // State for phone error
  const [reviews, setReviews] = useState([]); // Ensure reviews is initialized as an array
  const [reviewsError, setReviewsError] = useState(""); // State for error handling
  const maxBioLength = 200; // Maximum character limit for bio

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (activeTab === "reviews" && currentUser) {
      const fetchReviews = async () => {
        try {
          console.log("Fetching reviews for user ID:", currentUser.UserId);
          const response = await axios.get(
            `/api/Database/reviewsByUser/${currentUser.UserId}`
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
    if (currentUser) {
      setFirstName(currentUser.FirstName || "");
      setLastName(currentUser.LastName || "");
      setEmail(currentUser.Email || "");
      setPhone(currentUser.PhoneNumber || "");
      setBio(currentUser.Bio || "");
      setUsername(currentUser.UserName || "");
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
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
            <h2 className="text-xl font-bold text-gray-800">My Climbs</h2>
            <p className="text-gray-600">List of climbs will go here.</p>
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
