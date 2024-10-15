import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Comment from '../components/Comment';
import { IoIosCreate, IoIosTrash } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

    // Fetch current user and article details
    const fetchData = async () => {
      if (token) {
        setIsLoggedIn(true);
        try {
          const userResponse = await axios.get(`${API_BASE_URL}/user`, { headers: { Authorization: `Token ${token}` } });
          setCurrentUser(userResponse.data.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      try {
        const articleResponse = await axios.get(`${API_BASE_URL}/articles/${slug}`);
        setArticle(articleResponse.data.article);

        // Fetch follow status
        const followResponse = await axios.get(`${API_BASE_URL}/profiles/${articleResponse.data.article.author.username}`, {
          headers: { Authorization: token ? `Token ${token}` : undefined },
        });
        setIsFollowing(followResponse.data.profile.following);

        // Fetch favorite status
          const favoriteResponse = await axios.get(`${API_BASE_URL}/articles/${slug}`, {
            headers: { Authorization: `Token ${token}` },
          });

          setIsFavorited(favoriteResponse.data.article.favorited);
        
      } catch (error) {
        console.error('Error fetching article or follow status:', error);
      }

      // Fetch comments for the article
      try {
        const commentsResponse = await axios.get(`${API_BASE_URL}/articles/${slug}/comments`);
        setComments(commentsResponse.data.comments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchData();
  }, [slug]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('jwt');
    return token ? { Authorization: `Token ${token}` } : {};
  };

  const handleFollow = () => {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thực hiện hành động này.");
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
        toast.success(`Bạn đã ${isFollowing ? 'bỏ theo dõi' : 'theo dõi'} ${article.author.username}`);
      })
      .catch(error => {
        console.error('Error following/unfollowing user:', error);
      });
  };

  const handleFavorite = () => {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    const method = isFavorited ? 'delete' : 'post';
    const url = `${API_BASE_URL}/articles/${slug}/favorite`;

    axios({ method, url, headers: getAuthHeader() })
      .then(response => {
        setIsFavorited(!isFavorited);
        setArticle(prevArticle => ({
          ...prevArticle,
          favorited: !isFavorited,
          favoritesCount: response.data.article.favoritesCount
        }));
        toast.success(`Bạn đã ${isFavorited ? 'bỏ thích' : 'thích'} bài viết`);
      })
      .catch(error => {
        console.error('Error favoriting/unfavoriting article:', error);
      });
  };

  const handleDelete = () => {
    if (!isLoggedIn) {
      toast.error("Bạn cần đăng nhập để thực hiện hành động này.");
      return;
    }

    axios.delete(`${API_BASE_URL}/articles/${slug}`, { headers: getAuthHeader() })
      .then(() => {
        navigate('/');
        toast.success("Bài viết đã được xóa.");
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
      <div className="banner" style={{ backgroundColor: 'antiquewhite', color: '#373a3c' }}>
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <Link to={`/profile/${article.author.username}`}>
              <img src={article.author.image} alt={article.author.username} />
            </Link>
            <div className="info">
              <Link to={`/profile/${article.author.username}`} className="author" style={{ color: '#373a3c' }}>
                {article.author.username}
              </Link>
              <span className="date">{new Date(article.createdAt).toDateString()}</span>
            </div>
            {isLoggedIn ? (
              <div className="actions">
                {isArticleAuthor ? (
                  <>
                    <Link to={`/editor/${slug}`} className="btn btn-outline-secondary btn-sm">
                      <IoIosCreate /> Edit Article
                    </Link>
                    <button onClick={handleDelete} className="btn btn-outline-danger btn-sm">
                      <IoIosTrash /> Delete Article
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
      <ToastContainer />
    </div>
  );
};

export default ArticlePage;
