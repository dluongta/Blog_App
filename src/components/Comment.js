import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Comment.css';

const Comment = () => {
  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user information
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const response = await axios.get('https://node-express-conduit.appspot.com/api/user', {
            headers: { 'Authorization': `Token ${token}` }
          });
          setCurrentUser(response.data.user);
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (slug) {
      axios.get(`https://node-express-conduit.appspot.com/api/articles/${slug}/comments`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('jwt')
        }
      })
        .then(response => {
          setCommentList(response.data.comments);
        })
        .catch(error => {
          console.error('Fetch comments error', error);
        });
    }
  }, [slug]);

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('jwt');

    if (!token) {
      console.error('No token found. Please login.');
      return;
    }

    const newComment = {
      body: comment
    };

    try {
      const headers = { Authorization: `Token ${token}` };
      const response = await axios.post(`https://node-express-conduit.appspot.com/api/articles/${slug}/comments`, { comment: newComment }, { headers });
      setCommentList([...commentList, response.data.comment]);
      setComment('');
    } catch (error) {
      console.error('Post comment error', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      } else {
        console.error('Unexpected error occurred. Please try again.');
      }
    }
  };

  const handleDelete = async (commentId) => {
    const token = localStorage.getItem('jwt');

    if (!token) {
      console.error('No token found. Please login.');
      return;
    }

    try {
      const headers = { Authorization: `Token ${token}` };
      await axios.delete(`https://node-express-conduit.appspot.com/api/articles/${slug}/comments/${commentId}`, { headers });
      setCommentList(commentList.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Delete comment error', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      } else {
        console.error('Unexpected error occurred. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}/${day}/${month}/${year}`;
  };

  return (
    <div className="comments-section">
      <h3>Comments</h3>

      {}
      <div className="comment-form">
        <textarea
          id="comment-input"
          placeholder="Write a comment..."
          rows="4"
          value={comment}
          onChange={handleInputChange}
        />
        <div className="comment-submit-button">
          <button onClick={handleSubmit}>Post Comment</button>
        </div>
      </div>

      {}
      <div id="comments-list">
        {commentList.slice().reverse().map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-footer">
              <div className="user-info">
                <img src={comment.author.image} alt={comment.author.username} width="24" />
                <span className="username">{comment.author.username}</span>
                <span className="timestamp">{formatDate(comment.createdAt)}</span>
              </div>
              <div className="comment-body">
                {comment.body}
              </div>
            </div>
            {currentUser && currentUser.username === comment.author.username && (
              <button className="delete-button" onClick={() => handleDelete(comment.id)}>
                <i className="fa fa-trash"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comment;
