import React, { useEffect, useState } from "react";
import defaultProfilePic from "../../assets/default-profile.jpg"; // Import the default profile picture

const MyProfilePage = ({ user }) => {
  const [profilePic, setProfilePic] = useState(defaultProfilePic); // State for profile picture
  const [isHovered, setIsHovered] = useState(false); // State for hover effect
  const [bio, setBio] = useState(""); // State for bio
  const [activeTab, setActiveTab] = useState("editProfile"); // State for active tab
  const maxBioLength = 200; // Maximum character limit for bio

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result); // Update the profile picture
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (event) => {
    if (event.target.value.length <= maxBioLength) {
      setBio(event.target.value); // Update bio state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "editProfile"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("editProfile")}
          >
            Edit Profile
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "myClimbs"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("myClimbs")}
          >
            My Climbs
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "reviews"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "photos"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("photos")}
          >
            Photos
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "editProfile" && (
          <form>
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
              {/* ...existing code for first and last name... */}
            </div>

            {/* Email */}
            <div className="mb-6">{/* ...existing code for email... */}</div>

            {/* Phone Number */}
            <div className="mb-6">
              {/* ...existing code for phone number... */}
            </div>

            {/* Boulder Grade Range and Rope Climbing Grade Range */}
            <div className="flex mb-6 space-x-4">
              {/* ...existing code for grade ranges... */}
            </div>

            {/* Bio */}
            <div className="mb-6">{/* ...existing code for bio... */}</div>

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
            <p className="text-gray-600">List of reviews will go here.</p>
          </div>
        )}

        {activeTab === "photos" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800">Photos</h2>
            <p className="text-gray-600">Gallery of photos will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfilePage;
