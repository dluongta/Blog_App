import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { IoIosSettings, IoIosHeart } from "react-icons/io";

const API_BASE_URL = "https://node-express-conduit.appspot.com/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [activeTab, setActiveTab] = useState("my-articles");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const { username } = useParams();
  const [currentUser, setCurrentUser] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/${username}`);
      setProfile(response.data.profile);
      console.log("Profile data:", response.data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [username]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/user`, {
          headers: { Authorization: `Token ${token}` },
        });
        setCurrentUser(response.data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsLoggedIn(true);
    }

    const url = `${API_BASE_URL}/articles?author=${username}&limit=10&offset=${
      (page - 1) * 10
    }`;

    axios
      .get(url, {
        headers: isLoggedIn ? { Authorization: `Token ${token}` } : {},
      })
      .then((response) => {
        console.log("User articles:", response.data.articles);
        let sortedArticles = response.data.articles;
        if (sortOrder === "newest") {
          sortedArticles = sortedArticles.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else if (sortOrder === "oldest") {
          sortedArticles = sortedArticles.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        }

        setArticles(sortedArticles);
        setTotalPages(Math.ceil(response.data.articlesCount / 10));
        setTotalArticles(response.data.articlesCount);

        // Initialize favorites status
        const initialFavorites = {};
        response.data.articles.forEach((article) => {
          initialFavorites[article.slug] = article.favorited;
        });
        setFavorites(initialFavorites);
      })
      .catch((error) => {
        console.error("Error fetching user articles:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username, isLoggedIn, page, sortOrder]);

  const fetchFavoritedArticles = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsLoggedIn(true);
    }

    const url = `${API_BASE_URL}/articles?favorited=${username}&limit=10&offset=${
      (page - 1) * 10
    }`;

    axios
      .get(url, {
        headers: isLoggedIn ? { Authorization: `Token ${token}` } : {},
      })
      .then((response) => {
        console.log("Favorited articles:", response.data.articles);
        let sortedArticles = response.data.articles;
        if (sortOrder === "newest") {
          sortedArticles = sortedArticles.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        } else if (sortOrder === "oldest") {
          sortedArticles = sortedArticles.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        }

        setArticles(sortedArticles);
        setTotalPages(Math.ceil(response.data.articlesCount / 10));
        setTotalArticles(response.data.articlesCount);

        // Initialize favorites status
        const initialFavorites = {};
        response.data.articles.forEach((article) => {
          initialFavorites[article.slug] = article.favorited;
        });
        setFavorites(initialFavorites);
      })
      .catch((error) => {
        console.error("Error fetching favorited articles:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username, isLoggedIn, page, sortOrder]);

  useEffect(() => {
    fetchProfile();
    fetchCurrentUser();
    if (activeTab === "my-articles") {
      fetchArticles();
    } else if (activeTab === "favorited-articles") {
      fetchFavoritedArticles();
    }
  }, [
    fetchProfile,
    fetchArticles,
    fetchFavoritedArticles,
    fetchCurrentUser,
    activeTab,
    page,
  ]);

  const handleFavorite = (slug) => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    const token = localStorage.getItem("jwt");
    const isFavorited = favorites[slug];
    const method = isFavorited ? "delete" : "post";
    const url = `${API_BASE_URL}/articles/${slug}/favorite`;

    axios({
      method,
      url,
      headers: { Authorization: `Token ${token}` },
    })
      .then((response) => {
        console.log("Favorite response:", response.data);
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [slug]: !isFavorited,
        }));
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.slug === slug
              ? {
                  ...article,
                  favorited: !isFavorited,
                  favoritesCount: response.data.article.favoritesCount,
                }
              : article
          )
        );
      })
      .catch((error) => {
        console.error("Error favoriting/unfavoriting article:", error);
      });
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img
                src={profile.image}
                alt={profile.username}
                className="user-img"
              />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {currentUser && currentUser.username === profile.username && (
                <a
                  href="/settings"
                  className="btn btn-sm btn-outline-secondary action-btn"
                >
                  <IoIosSettings /> Edit Profile Settings
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "my-articles" ? "active" : ""
                    }`}
                    href="#"
                    onClick={() => {
                      setActiveTab("my-articles");
                      setPage(1);
                    }}
                  >
                    My Articles
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      activeTab === "favorited-articles" ? "active" : ""
                    }`}
                    href="#"
                    onClick={() => {
                      setActiveTab("favorited-articles");
                      setPage(1);
                    }}
                  >
                    Favorited Articles
                  </a>
                </li>
              </ul>
              <div className="sort-buttons">
                <button
                  onClick={() => setSortOrder("newest")}
                  className={`sort-button ${
                    sortOrder === "newest" ? "active" : ""
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortOrder("oldest")}
                  className={`sort-button ${
                    sortOrder === "oldest" ? "active" : ""
                  }`}
                >
                  Oldest
                </button>
              </div>
            </div>
            {isLoading ? (
              <p>Loading articles...</p>
            ) : articles.length ? (
              articles.map((article) => (
                <div className="article-preview" key={article.slug}>
                  <div className="article-meta">
                    <a href={`/profile/${article.author.username}`}>
                      <img
                        src={article.author.image}
                        alt={article.author.username}
                      />
                    </a>
                    <div className="info">
                      <a
                        href={`/profile/${article.author.username}`}
                        className="author"
                      >
                        {article.author.username}
                      </a>
                      <span className="date">
                        {new Date(article.createdAt).toDateString()}
                      </span>
                    </div>
                    <button
                      className={`btn btn-outline-primary btn-sm pull-xs-right ${
                        favorites[article.slug] ? "favorited" : ""
                      }`}
                      onClick={() => handleFavorite(article.slug)}
                    >
                      <IoIosHeart className="icon" /> {article.favoritesCount}
                    </button>
                  </div>
                  <a href={`/article/${article.slug}`} className="preview-link">
                    <h1>{article.title}</h1>
                    <p>{article.description}</p>
                    <span>Read more...</span>
                  </a>
                </div>
              ))
            ) : (
              <div
                className="no-article"
                style={{ marginTop: "10px", textAlign: "center" }}
              >
                No articles are here... yet.
              </div>
            )}
            {/* Pagination */}
            <div className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={
                    page === index + 1
                      ? "pagination-button active"
                      : "pagination-button"
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {/* Total Articles */}
            <div className="total-articles">
              <p>Total Articles: {totalArticles}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
