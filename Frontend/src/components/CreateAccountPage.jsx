import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import axios from "axios";

const CreateAccountPage = ({ setCurrentPage, setCurrentUser }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState(""); // Added state for first name
  const [lastName, setLastName] = useState(""); // Added state for last name
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);

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

  const passwordRules = checkPasswordRules(password);

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!passwordRules.valid) {
      setShowPasswordCriteria(true);
      return;
    }

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      alert(`Error checking existing user: ${fetchError.message}`);
      return;
    }

    if (existingUser) {
      alert("An account with this email already exists.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert(`Error creating account: ${error.message}`);
      return;
    }

    const user = data.user;

    if (user) {
      const userData = {
        UserId: user.id,
        UserName: username,
        ProfileImage: "",
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        PhoneNumber: phoneNumber,
        BoulderGradeLowerLimit: "",
        BoulderGradeUpperLimit: "",
        RopeClimberLowerLimit: "",
        RopeClimberUpperLimit: "",
        Bio: "",
        AccountType: "public",
        EnableReviewCommentNotifications: "enable",
        EnableGroupInviteNotifications: "enable",
      };
      console.log("User data to be sent:", userData);
      try {
        await axios.post("https://localhost:7195/api/Database/user", userData);
        setCurrentUser(userData);
        setCurrentPage("profile");
      } catch (error) {
        console.error("Error adding user to Database:", error);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-center text-blue-600">
          Create Your Account
        </h2>
        <p className="mb-6 text-sm text-center text-gray-600">
          Join us and start your climbing journey!
        </p>
        <form onSubmit={handleCreateAccount} autoComplete="off">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
                required
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
                required
              />
              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              required
            />
          </div>
          {showPasswordCriteria && (
            <div className="mb-4 text-sm text-gray-600">
              <p>Your password must contain:</p>
              <ul className="list-disc list-inside">
                <li className={passwordRules.length ? "text-blue-500" : ""}>
                  At least 10 characters
                </li>
                <li className={passwordRules.lowercase ? "text-blue-500" : ""}>
                  Lowercase letters (a-z)
                </li>
                <li className={passwordRules.uppercase ? "text-blue-500" : ""}>
                  Uppercase letters (A-Z)
                </li>
                <li className={passwordRules.number ? "text-blue-500" : ""}>
                  Numbers (0-9)
                </li>
                <li
                  className={passwordRules.specialChar ? "text-blue-500" : ""}
                >
                  Special characters (e.g. !@#$%^&*)
                </li>
              </ul>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a
            onClick={() => setCurrentPage("login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;
