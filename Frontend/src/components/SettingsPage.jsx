import React from "react";
import { useEffect } from "react";
import { useUser } from "./UserProvider";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SettingsPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem("theme") || "light");
  const [fontSize, setFontSize] = React.useState(() => localStorage.getItem("fontSize") || "text-base");
  const [activeTab, setActiveTab] = React.useState("account");
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordMessage, setPasswordMessage] = React.useState("");
  const [passwordTouched, setPasswordTouched] = React.useState(false);
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleteMessage, setDeleteMessage] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [showDeletePassword, setShowDeletePassword] = React.useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = React.useState(false); // Track secondary confirmation
  const [accountType, setAccountType] = React.useState("public"); // Track account type
  const [reviewComments, setReviewComments] = React.useState("enabled"); // Track review comments setting
  const [groupInvites, setGroupInvites] = React.useState("enabled"); // Initialize groupInvites state

  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const handleDeleteAccount = async () => {
    setDeleteMessage("");

    if (!deletePassword) {
      setDeleteMessage("Current password is required.");
      return;
    }

    // Verify the user's password with Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: deletePassword,
    });

    if (signInError) {
      setDeleteMessage("Incorrect password. Please try again.");
      return;
    }

    // If password is correct, prompt for secondary confirmation
    if (!isDeleteConfirmed) {
      setIsDeleteConfirmed(true);
      setDeleteMessage("Please confirm account deletion.");
      return;
    }

    // Delete the user's account from Supabase
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(user.id);
    if (supabaseError) {
      setDeleteMessage("Failed to delete account from Supabase. Please try again.");
      return;
    }

    // Delete the user's account from the local database
    try {
      const response = await fetch(`http://localhost:5091/api/Database/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete account from the local database.");
      }

      setDeleteMessage("Account deleted successfully.");
      setShowDeleteModal(false);
      setDeletePassword("");
      setIsDeleteConfirmed(false); // Reset confirmation state

      // Debugging navigation
      console.log("Navigating to sign up...");
      navigate("/signup");
    } catch (error) {
      setDeleteMessage(error.message || "An error occurred while deleting the account.");
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    const settings = {
      userID: user.id,
      accountType: accountType,
      enableReviewCommentNotifications: reviewComments === "enabled" ? "enable" : "disable",
      enableGroupInviteNotifications: groupInvites === "enabled" ? "enable" : "disable",
    };

    console.log("Settings payload:", settings); // Log the payload being sent

    try {
      const response = await axios.post("https://localhost:7195/api/Database/UpdateUserSettings", settings);

      if (response.status !== 200) throw new Error("Failed to save settings.");
      alert("Settings saved successfully!");
    } catch (err) {
      alert(err.message || "An error occurred while saving settings.");
    }
  };

  const menuItems = [
    { key: "account", label: "Account & Security" },
    { key: "appearance", label: "Appearance" },
    { key: "notifications", label: "Notifications" },
    //{ key: "support", label: "Feedback & Support" },
  ];

  const checkPasswordRules = (password) => {
    const rules = {
      length: password.length >= 10,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
    };
    return {
      ...rules,
      valid:
        rules.length &&
        rules.lowercase &&
        rules.uppercase &&
        rules.number &&
        rules.specialChar,
    };
  };

  const passwordRules = checkPasswordRules(newPassword);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword) {
      setPasswordMessage("Current password is required.");
      return;
    }

    // Validate the current password with Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordMessage("Incorrect current password. Please try again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    if (!passwordRules.valid) {
      setPasswordMessage("Password does not meet the required criteria.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMessage("Failed to update password. Please try again.");
    } else {
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <>
            {/* Privacy Settings */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Privacy Settings</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            {/* Change Password */}
            {!showPasswordForm ? (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate}>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 cursor-pointer"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{ height: "100%" }}
                    >
                      {showCurrentPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 cursor-pointer"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ height: "100%" }}
                    >
                      {showNewPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 cursor-pointer"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ height: "100%" }}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </span>
                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                      <div className="match-check" style={{ color: "green" }}>
                      ✔ Passwords match
                    </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/forgot-password");
                      }}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  {passwordTouched && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Your password must contain:</p>
                      <ul className="list-disc list-inside">
                        <li className={passwordRules.length ? "text-green-600" : "text-red-600"}>At least 10 characters</li>
                        <li className={passwordRules.lowercase ? "text-green-600" : "text-red-600"}>Lowercase letters</li>
                        <li className={passwordRules.uppercase ? "text-green-600" : "text-red-600"}>Uppercase letters</li>
                        <li className={passwordRules.number ? "text-green-600" : "text-red-600"}>Numbers</li>
                        <li className={passwordRules.specialChar ? "text-green-600" : "text-red-600"}>Special characters (!@#$%^&*)</li>
                      </ul>
                    </div>
                  )}
                  {passwordMessage && <p className="mt-2 text-sm text-red-500">{passwordMessage}</p>}
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            )}
            {/* Delete Account Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </>
        );
      case "appearance":
        return (
          <>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Font Size</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
              >
                <option value="text-sm">Small</option>
                <option value="text-base">Medium</option>
                <option value="text-lg">Large</option>
              </select>
            </div>
          </>
        );
      case "notifications":
        return (
          <>
            {/* Group Invite Notifications */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Group Invite Notifications</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={groupInvites}
                onChange={(e) => setGroupInvites(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            {/* Review Comments Notifications */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Receive Review Comments Notifications</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded"
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
              >
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </>
        );
      //case "support":
        //return (
          //<>
            //<div className="mb-6">
              //<a
                //href="https://forms.gle/your-form-link"
                //target="_blank"
                //rel="noopener noreferrer"
                //className="text-blue-500 hover:underline"
              //>
                //Report a Bug
              //</a>
            //</div>
          //</>
        //);
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${fontSize}`}>
      <div className="flex max-w-6xl mx-auto mt-10 bg-white rounded-lg shadow-md">
        {/* Sidebar */}
        <div className="w-1/4 p-6 border-r">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Settings</h2>
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.key}>
                <button
                  className={`w-full text-left px-4 py-2 rounded ${
                    activeTab === item.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="w-3/4 p-10 flex flex-col justify-between h-full">
          {renderContent()}
          <div className="flex justify-end mt-10">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-lg w-96">
            <h2 className="mb-4 text-lg font-bold text-gray-800">
              {isDeleteConfirmed ? "Confirm Final Deletion" : "Confirm Account Deletion"}
            </h2>
            <p className="mb-4 text-gray-600">
              {isDeleteConfirmed
                ? "Are you sure you want to permanently delete your account? This action cannot be undone."
                : "Please enter your current password to confirm account deletion."}
            </p>
            {!isDeleteConfirmed && (
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  placeholder="Current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 cursor-pointer"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  style={{ height: "100%" }}
                >
                  {showDeletePassword ? "🙈" : "👁️"}
                </span>
              </div>
            )}
            {deleteMessage && <p className="mb-4 text-sm text-red-500">{deleteMessage}</p>}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteMessage("");
                  setIsDeleteConfirmed(false); // Reset confirmation state
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className={`px-4 py-2 text-sm text-white ${
                  isDeleteConfirmed ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                } rounded`}
              >
                {isDeleteConfirmed ? "Confirm Deletion" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
