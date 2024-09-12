import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Editor = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [tagList, setTagList] = useState("");
  const [errors, setErrors] = useState({});
  const { slug } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    if (slug) {
      axios
        .get(`https://node-express-conduit.appspot.com/api/articles/${slug}`)
        .then((response) => {
          const article = response.data.article;
          setTitle(article.title);
          setDescription(article.description);
          setBody(article.body);
          setTagList(article.tagList.join(" "));
        })
        .catch((error) => {
          console.error("Fetch article error", error);
        });
    }
  }, [slug]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setErrors({ body: ["No token found. Please login."] });
      return;
    }

    const article = {
      title,
      description,
      body,
      tagList: tagList.split(" ").filter((tag) => tag.trim() !== ""),
    };

    try {
      const headers = { Authorization: `Token ${token}` };
      let response;
      if (slug) {
        response = await axios.put(
          `https://node-express-conduit.appspot.com/api/articles/${slug}`,
          { article },
          { headers }
        );
        navigate("/", {
          state: { message: "Article published successfully!" },
        });

        toast.success("Article published successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        response = await axios.post(
          "https://node-express-conduit.appspot.com/api/articles",
          { article },
          { headers }
        );
        navigate("/", {
          state: { message: "Article published successfully!" },
        });

        toast.success("Article published successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Publish article error", error);
      if (error.response) {
        setErrors(
          error.response.data.errors || {
            body: ["Unexpected error occurred. Please try again."],
          }
        );
      } else {
        setErrors({ body: ["Unexpected error occurred. Please try again."] });
      }
    }
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <h1 className="text-xs-center">Editor</h1>
            {errors.body && (
              <ul className="error-messages">
                {errors.body.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Article Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  ></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags (Tags are separated by space)"
                    value={tagList}
                    onChange={(e) => setTagList(e.target.value)}
                  />
                </fieldset>
                <button
                  className="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Editor;
