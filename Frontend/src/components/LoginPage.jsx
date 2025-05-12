import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserProvider";

const LoginPage = ({ OnLoginClick, setCurrentPage, setCurrentUser = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password,
    });

    if (error) {
      alert(`Login failed: ${error.message}`);
    } else {
      alert("Logged in successfully");
      console.log("User ID:", data.user.id);
      console.log("Session:", data.session);

      const { user } = data;

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setCurrentUser(profileData); // Update currentUser state
        setCurrentPage("profile"); // Navigate to the profile page
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <form
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
        onSubmit={handleLogin}
      >
        <div className="mb-4 text-2xl font-bold text-center text-blue-600">
          Boulder Buddy
        </div>
        <h2 className="mb-2 text-xl font-semibold text-center">Welcome Back</h2>
        <p className="mb-6 text-sm text-center text-gray-600">
          Log in to continue
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <button
          type="submit"
          className="w-full py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
        <div className="mt-4 text-sm text-center text-gray-600">
          <p>
            Don't have an account?{" "}
            <a
              onClick={() => setCurrentPage("signup")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Sign up
            </a>
          </p>
          <p>
            <a
              onLoginClick={() => setCurrentPage("forgot-password")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Forgot Password?
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;