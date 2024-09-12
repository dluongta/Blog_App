import React, { useState, useEffect } from "react";
import axios from "axios";
import "./settings.css";

const Settings = () => {
  const [image, setImage] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        console.error("No token found");
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axios.get(
          "https://node-express-conduit.appspot.com/api/user",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const user = response.data.user;
        setImage(user.image || "");
        setUsername(user.username || "");
        setBio(user.bio || "");
        setEmail(user.email || "");
      } catch (error) {
        console.error("Error fetching user data", error);
        if (error.response && error.response.status === 401) {
          window.location.href = "/login";
        } else {
          setErrors({
            body: ["Error fetching user data. Please try again later."],
          });
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password && password !== confirmPassword) {
      setErrors({ body: ["Passwords do not match."] });
      return;
    }

    const token = localStorage.getItem("jwt");
    try {
      const userUpdate = { image, username, bio, email };
      if (password) {
        userUpdate.password = password;
      }

      await axios.put(
        "https://node-express-conduit.appspot.com/api/user",
        {
          user: userUpdate,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setPassword("");
      setConfirmPassword("");
      window.location.href = `/profile/${username}`;
    } catch (error) {
      console.error("Update settings error", error);
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ body: ["Unexpected error occurred. Please try again."] });
      }
    }
  };

  const renderProfileSettings = () => (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="URL of profile picture"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </fieldset>
        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type="text"
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </fieldset>
        <fieldset className="form-group">
          <textarea
            className="form-control form-control-lg"
            rows="8"
            placeholder="Short bio about you"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          ></textarea>
        </fieldset>
        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </fieldset>
        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>
        <fieldset className="form-group">
          <input
            className="form-control form-control-lg"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </fieldset>
        <fieldset className="form-group show-pw-group">
          <label
            htmlFor="showPassword"
            className="showPW"
            onClick={() => {
              if (password !== "" || confirmPassword !== "") {
                setShowPassword(!showPassword);
              }
            }}
            style={{
              cursor:
                password !== "" || confirmPassword !== ""
                  ? "pointer"
                  : "not-allowed",
              opacity: password !== "" || confirmPassword !== "" ? 1 : 0.5,
            }}
          >
            <i className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}>
              {" "}
              Show password
            </i>
          </label>
        </fieldset>
        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-primary" type="submit">
            <i className="fa fa-sync-alt"></i> Update
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              localStorage.removeItem("jwt");
              window.location.href = "/";
            }}
          >
            <i className="fa fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </fieldset>
    </form>
  );

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            {errors.body && (
              <ul className="error-messages">
                {errors.body.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            {renderProfileSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
