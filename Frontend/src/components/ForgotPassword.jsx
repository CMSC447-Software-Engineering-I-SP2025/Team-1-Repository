import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // added import
import { supabase } from "../lib/supabaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("confirm");
  const [linkSent, setLinkSent] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate(); // added navigation hook

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

  // Stage 1: Confirm email and name then send reset link
  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      console.log("Checking user with email:", email, "and username:", name); // Debugging log

      const { data, error } = await supabase.from("users").select("*");
      console.log("Users data:", data); // Debugging log

      console.log("Supabase response:", { data, error }); // Debugging log

      if (error) {
        console.error("Supabase error:", error); // Log error
        setMessage("An error occurred while checking user.");
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        setMessage("User not found. Please check your email and username.");
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: "http://localhost:5173/reset-password", // Adjust to your frontend URL
        }
      );

      if (resetError) {
        console.error("Supabase resetPasswordForEmail error:", resetError); // Debugging log
        setMessage("Failed to send reset link. Please try again.");
      } else {
        console.log("Reset link sent successfully to:", email); // Debugging log
        setMessage("Reset link sent to your email.");
        setLinkSent(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err); // Log unexpected errors
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToReset = () => {
    setStage("update");
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!passwordRules.valid) {
      setMessage("Password does not meet the required criteria.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setMessage("Failed to update password. Please try again.");
        setLoading(false);
        return;
      }

      setMessage(
        "Password updated successfully. Please log in with your new password."
      );
      console.log("Password updated successfully.");
      navigate("/login"); // Redirect to the login page
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-center text-blue-600">
          Forgot your Password?
        </h2>
        {message && (
          <p className="mb-4 text-sm text-center text-red-500">{message}</p>
        )}

        {stage === "confirm" && (
          <form onSubmit={handleConfirmSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {linkSent && stage === "confirm" && (
          <div className="mt-4 text-center">
            <button
              onClick={handleProceedToReset}
              className="px-4 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              Proceed to Reset Password
            </button>
          </div>
        )}

        {stage === "update" && (
          <form onSubmit={handleUpdateSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {passwordTouched && (
              <div className="mb-4 text-sm text-gray-600">
                <p>Your password must contain:</p>
                <ul className="list-disc list-inside">
                  <li className={passwordRules.length ? "text-blue-500" : ""}>
                    At least 10 characters
                  </li>
                  <li
                    className={passwordRules.lowercase ? "text-blue-500" : ""}
                  >
                    Lowercase letters (a-z)
                  </li>
                  <li
                    className={passwordRules.uppercase ? "text-blue-500" : ""}
                  >
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
              disabled={loading}
              className="w-full py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
