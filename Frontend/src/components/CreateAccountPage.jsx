import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./css/CreateAccountPage.css";

const CreateAccountPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState(""); // Default empty string
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState(null);

  const checkPasswordRules = (password) => {
    const rules = {
      length: password.length >= 10,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*]/.test(password),
    };

    const metCriteria = [
      rules.lowercase,
      rules.uppercase,
      rules.number,
      rules.specialChar,
    ].filter(Boolean).length;

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

    if (!passwordRules.valid) {
      alert("Password does not meet the required criteria.");
      return;
    }

    // Check if user already exists
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
      console.log("Account created for user:", user);
      // Insert user data into the "users" table
      const { error: insertError } = await supabase.from("users").insert({
        user_id: user.id, // Ensure this matches auth.uid()
        name: user.user_metadata.full_name || username, // Fallback to username if full_name is not available
        email: user.email,
        account_type: accountType || "private", // Default to "standard" if accountType is empty
      });

      if (insertError) {
        alert(`Error inserting user data: ${insertError.message}`);
        return;
      }
    }

    // MAKE SURE THIS MATCHES THE SCHEMA IN THE DATABASE
    const accountData = {
      UserId: user.id,
      UserName: username,
      FirstName: "",
      LastName: "",
      Email: email,
      PhoneNumber: "",
      Bio: "",
      ProfileImage: "",
      BoulderGradeLowerLimit: "",
      BoulderGradeUpperLimit: "",
      RopeClimberLowerLimit: "",
      RopeClimberUpperLimit: "",
    };
    console.log("Account Data:", accountData);

    try {
      const response = await fetch("http://localhost:5091/api/Database/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorInfo = await response.json();
        console.error("Error creating account:", errorInfo);
        alert("Error creating account");
        return;
      }

      const responseData = await response.json();
      alert(`Account created for ${username}`);
      console.log("Response Data:", responseData);
    } catch (error) {
      console.error("Network error while creating account:", error);
      alert("Network error while creating account");
    }
  };

  return (
    <div className="signup-container">
      <div className={`signup-card ${passwordTouched ? "expanded" : ""}`}>
        <div className="website-title">Boulder Buddy</div>
        <h2>New User</h2>
        <p>Sign up to continue</p>
        <form onSubmit={handleCreateAccount}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group password-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordTouched(e.target.value.length > 0); // Show criteria when user starts typing
                }}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {passwordTouched && (
              <div className="password-requirements">
                <p>Your password must contain:</p>
                <ul>
                  <li className={passwordRules.length ? "valid" : ""}>
                    At least 10 characters
                  </li>
                  <li className={passwordRules.valid ? "valid" : ""}>
                    At least 1 of the following:
                  </li>
                  <li className={passwordRules.lowercase ? "valid" : ""}>
                    {" "}
                    - Lower case letters (a-z)
                  </li>
                  <li className={passwordRules.uppercase ? "valid" : ""}>
                    {" "}
                    - Upper case letters (A-Z)
                  </li>
                  <li className={passwordRules.number ? "valid" : ""}>
                    {" "}
                    - Numbers (0-9)
                  </li>
                  <li className={passwordRules.specialChar ? "valid" : ""}>
                    {" "}
                    - Special characters (e.g. !@#$%^&*)
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button type="submit">Continue</button>
        </form>
        <p className="login-text">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;
