import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // added import
import { supabase } from "../lib/supabaseClient";
import "./css/ForgotPassword.css";

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
      valid: rules.length && rules.lowercase && rules.uppercase && rules.number && rules.specialChar,
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

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:5173/reset-password", // Adjust to your frontend URL
      });

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

      setMessage("Password updated successfully. Please log in with your new password.");
      console.log("Password updated successfully.");
      navigate("/login"); // Redirect to the login page
    } catch (err) {
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2 className="website-title">Forgot your Password?</h2>
        {message && <p className="info-box">{message}</p>}

        {stage === "confirm" && (
          <form onSubmit={handleConfirmSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span>Email</span>
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <span>Username</span>
              </div>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {linkSent && stage === "confirm" && (
          <div className="info-box">
            <button onClick={handleProceedToReset}>
              Proceed to Reset Password
            </button>
          </div>
        )}

        {stage === "update" && (
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <label>New Password:</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>
              {confirmPassword && newPassword === confirmPassword && (
                <div className="match-check" style={{ color: "green" }}>
                  ✔ Passwords match
                </div>
              )}
            </div>
            {passwordTouched && (
              <div className="info-box">
                <p>Your password must contain:</p>
                <ul>
                  <li className={passwordRules.length ? "valid" : ""}>At least 10 characters</li>
                  <li className={passwordRules.valid ? "valid" : ""}>At least 1 of the following:</li>
                  <li className={passwordRules.lowercase ? "valid" : ""}> - Lower case letters (a-z)</li>
                  <li className={passwordRules.uppercase ? "valid" : ""}> - Upper case letters (A-Z)</li>
                  <li className={passwordRules.number ? "valid" : ""}> - Numbers (0-9)</li>
                  <li className={passwordRules.specialChar ? "valid" : ""}> - Special characters (e.g. !@#$%^&*)</li>
                </ul>
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
