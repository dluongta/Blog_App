import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { IoCreateOutline, IoSettingsOutline } from "react-icons/io5";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userImage, setUserImage] = useState(""); // State for profile image

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("jwt");
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await axios.get(
            "https://node-express-conduit.appspot.com/api/user",
            {
              headers: { Authorization: `Token ${token}` },
            }
          );
          const user = response.data.user;
          console.log(user);
          setUsername(user.username || "");
          setUserImage(user.image || ""); // Set user profile image
        } catch (error) {
          console.error("Error fetching user data", error);
          if (error.response && error.response.status === 401) {
            // Token is invalid, log out the user
            handleLogout();
          }
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    setUsername("");
    setUserImage(""); // Clear user profile image
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/editor">
                  <IoCreateOutline className="icon" />
                  &nbsp;New Post
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/settings">
                  <IoSettingsOutline className="icon" />
                  &nbsp;Settings
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to={`/profile/${username}`}>
                  {userImage && (
                    <img
                      src={userImage}
                      className="user-pic"
                      alt={username}
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                  )}
                  &nbsp;{username}
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Sign in
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Sign up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
