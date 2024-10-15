import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoIosHeart } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./home.css";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://node-express-conduit.appspot.com/api";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [tags, setTags] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState("");
  const [feedType, setFeedType] = useState("global");
  const [favorites, setFavorites] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsLoggedIn(true);
      axios
        .get(`${API_BASE_URL}/user`, {
          headers: { Authorization: `Token ${token}` },
        })
        .then((response) => {
          setCurrentUser(response.data.user);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
    navigate('/');
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [location.state]);

  useEffect(() => {
    setIsLoading(true);

    let url;
    if (feedType === "your" && currentUser) {
      url = `${API_BASE_URL}/articles?author=${currentUser.username}&limit=10&page=${page}`;
    } else if (selectedTag) {
      url = `${API_BASE_URL}/articles?tag=${selectedTag}&limit=10&page=${page}`;
    } else {
      url = `${API_BASE_URL}/articles?limit=10&page=${page}`;
    }

    axios
      .get(url, {
        headers: isLoggedIn
          ? { Authorization: `Token ${localStorage.getItem("jwt")}` }
          : {},
      })
      .then((response) => {
        setArticles(response.data.articles);
        setTotalPages(Math.ceil(response.data.articlesCount / 10));

        const initialFavorites = {};
        response.data.articles.forEach((article) => {
          initialFavorites[article.slug] = article.favorited;
        });
        setFavorites(initialFavorites);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    axios
      .get(`${API_BASE_URL}/tags`)
      .then((response) => {
        setTags(response.data.tags);
      })
      .catch((error) => {
        console.error("Error fetching tags:", error);
      });
  }, [page, selectedTag, feedType, isLoggedIn, currentUser]);

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

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(tagSearch.toLowerCase()) && tag.trim() !== ''
  ).slice(0, 10);

  return (
    <div className="home-page">
      <div className="banner">
        <div className="container">
          <h1 className="logo-font">conduit</h1>
          <p>A place to share your knowledge.</p>
        </div>
      </div>
      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isLoggedIn && (
                  <li className="nav-item">
                    <a
                      className={`nav-link ${feedType === "your" ? "active" : ""}`}
                      href="#"
                      onClick={() => {
                        setFeedType("your");
                        setSelectedTag("");
                        setPage(1);
                      }}
                    >
                      Your Feed
                    </a>
                  </li>
                )}
                <li className="nav-item">
                  <a
                    className={`nav-link ${feedType === "global" && !selectedTag ? "active" : ""}`}
                    href="#"
                    onClick={() => {
                      setFeedType("global");
                      setSelectedTag("");
                      setPage(1);
                    }}
                  >
                    Global Feed
                  </a>
                </li>
                {selectedTag && (
                  <li className="nav-item">
                    <a className="nav-link active" href="#">
                      # {selectedTag}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            {isLoading ? (
              <p>Loading articles...</p>
            ) : articles.length === 0 ? (
              <p>No articles are here... yet.</p>
            ) : (
              articles.map((article) => (
                <div className="article-preview" key={article.slug}>
                  <div className="article-meta">
                    <a href={`/profile/${article.author.username}`}>
                      <img src={article.author.image} alt={article.author.username} />
                    </a>
                    <div className="info">
                      <a href={`/profile/${article.author.username}`} className="author">
                        {article.author.username}
                      </a>
                      <span className="date">
                        {new Date(article.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </span>
                    </div>
                    <button
                      className={`btn btn-outline-primary btn-sm pull-xs-right ${favorites[article.slug] ? "favorited" : ""}`}
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
            )}
            <div className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={page === index + 1 ? "pagination-button active" : "pagination-button"}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            <div className="sidebar">
              <p className="sidebar-title">Popular Tags</p>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="tag-list">
                {filteredTags.map((tag) => (
                  <a
                    href="#"
                    className="tag-pill"
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      setFeedType("global");
                      setPage(1);
                    }}
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
