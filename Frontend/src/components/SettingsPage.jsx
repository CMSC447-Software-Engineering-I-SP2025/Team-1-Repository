import React from "react";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl p-6 mx-auto mt-10 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Settings</h1>
        <form>
          {/* Notification Preferences */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email Notifications
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Privacy Settings */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Privacy Settings
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
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
      </div>
    </div>
  );
};

export default SettingsPage;
