
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Comments from '../components/Comments';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const Article = () => {
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const { slug } = useParams();

  useEffect(() => {
    axios.get(`https://conduit.productionready.io/api/articles/${slug}`)
      .then(response => setArticle(response.data.article));

    axios.get(`https://conduit.productionready.io/api/articles/${slug}/comments`)
      .then(response => setComments(response.data.comments.map(cmt => cmt.body)));
  }, [slug]);

  const handleAddComment = async (newComment) => {
    const token = localStorage.getItem('jwt');
    try {
      const response = await axios.post(
        `https://conduit.productionready.io/api/articles/${slug}/comments`,
        { comment: { body: newComment } },
        { headers: { Authorization: `Token ${token}` } }
      );
      setComments([...comments, response.data.comment.body]);
    } catch (error) {
      console.error('Add comment error', error);
    }
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          <div className="article-meta">
            <a href={`/profile/${article.author.username}`}><img src={article.author.image} alt={article.author.username} /></a>
            <div className="info">
              <a href={`/profile/${article.author.username}`} className="author">{article.author.username}</a>
              <span className="date">{new Date(article.createdAt).toDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: md.render(article.body) }}></div>
            <ul className="tag-list">
              {article.tagList.map(tag => (
                <li className="tag-default tag-pill tag-outline" key={tag}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-12">
            <Comments comments={comments} onAddComment={handleAddComment} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Article;
