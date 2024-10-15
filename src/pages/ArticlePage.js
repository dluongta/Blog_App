import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Comment from '../components/Comment';
import { IoIosCreate, IoIosTrash } from "react-icons/io";

const API_BASE_URL = 'https://node-express-conduit.appspot.com/api';

const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsLoggedIn(true);
      axios.get(`${API_BASE_URL}/user`, { headers: getAuthHeader() })
        .then(response => {
          setCurrentUser(response.data.user);
        })
        .catch(error => {
          console.error('Error fetching current user:', error);
        });
    }

    // Fetch article details
    axios.get(`${API_BASE_URL}/articles/${slug}`)
      .then(response => {
        setArticle(response.data.article);
        setIsFollowing(response.data.article.author.following);
        setIsFavorited(response.data.article.favorited);
      })
      .catch(error => {
        console.error('Error fetching article:', error);
      });

    // Fetch comments for the article
    axios.get(`${API_BASE_URL}/articles/${slug}/comments`)
      .then(response => {
        setComments(response.data.comments);
      })
      .catch(error => {
        console.error('Error fetching comments:', error);
      });
  }, [slug]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('jwt');
    return token ? { 'Authorization': `Token ${token}` } : {};
  };

  const handleFollow = () => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    const method = isFollowing ? 'delete' : 'post';
    const url = `${API_BASE_URL}/profiles/${article.author.username}/follow`;

    axios({ method, url, headers: getAuthHeader() })
      .then(response => {
        setIsFollowing(!isFollowing);
        setArticle(prevArticle => ({
          ...prevArticle,
          author: {
            ...prevArticle.author,
            following: !isFollowing
          }
        }));
      })
      .catch(error => {
        console.error('Error following/unfollowing user:', error);
      });
  };

  const handleFavorite = () => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    const method = isFavorited ? 'delete' : 'post';
    const url = `${API_BASE_URL}/articles/${slug}/favorite`;

    axios({ method, url, headers: getAuthHeader() })
      .then(response => {
        if (response.data && response.data.article) {
          setIsFavorited(!isFavorited);
          setArticle(prevArticle => ({
            ...prevArticle,
            favorited: !isFavorited,
            favoritesCount: response.data.article.favoritesCount
          }));
        }
      })
      .catch(error => {
        console.error('Error favoriting/unfavoriting article:', error);
      });
  };

  const handleDelete = () => {
    if (!isLoggedIn) {
      alert("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    axios.delete(`${API_BASE_URL}/articles/${slug}`, { headers: getAuthHeader() })
      .then(() => {
        navigate('/');
      })
      .catch(error => {
        console.error('Error deleting article:', error);
      });
  };

  const addComment = (comment) => {
    setComments([...comments, comment]);
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  const isArticleAuthor = currentUser && article.author.username === currentUser.username;

  return (
    <div className="article-page">
      <div className="banner" style={{ backgroundColor: 'antiquewhite', color:'#373a3c' }}>
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image} alt={article.author.username} />
            </Link>
            <div className="info">
              <Link to={`/profile/${article.author.username}`} className="author" style={{color:'#373a3c' }}>
                {article.author.username}
              </Link>
              <span className="date">{new Date(article.createdAt).toDateString()}</span>
            </div>
            {isLoggedIn ? (
              <div className="actions">
                {isArticleAuthor ? (
                  <>
                    <Link to={`/editor/${slug}`} className="btn btn-outline-secondary btn-sm">
                      <IoIosCreate/> Edit Article
                    </Link>
                    <button onClick={handleDelete} className="btn btn-outline-danger btn-sm">
                      <IoIosTrash/> Delete Article
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-outline-secondary'}`}
                    >
                      <span className="icon">+</span>
                      {isFollowing ? 'Unfollow' : 'Follow'} {article.author.username}
                    </button>
                    <button
                      onClick={handleFavorite}
                      className={`btn btn-sm ${isFavorited ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                      <span className="icon">❤️</span>
                      {isFavorited ? 'Unfavorite Article' : 'Favorite Article'} ({article.favoritesCount})
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="actions">
                <Link to="/login" className="btn btn-sm btn-outline-secondary">Sign in to follow or favorite</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: article.body }}></div>
            <ul className="tag-list">
              {article.tagList.map(tag => (
                <li className="tag-default tag-pill tag-outline" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <hr />
        {/* Comment section */}
        <Comment comments={comments} addComment={addComment} />
      </div>
    </div>
  );
};

export default ArticlePage;
