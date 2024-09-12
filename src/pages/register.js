import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://node-express-conduit.appspot.com/api/users', {
        user: { username, email, password }
      });
      console.log(response);
      localStorage.setItem('jwt', response.data.user.token);
      window.location.href = '/';
    } catch (error) {
      if (error.response) {
        // Ensure errors is always an object with arrays for each key
        setErrors(error.response.data.errors || {});
      } else {
        // Handle unexpected errors
        console.error('Register error', error);
        setErrors({ body: ['Unexpected error occurred. Please try again.'] });
      }
    }
  };

  const renderErrorMessages = (errorMessages) => {
    if (Array.isArray(errorMessages)) {
      return (
        <ul className="error-messages">
          {errorMessages.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      );
    }
    return null;
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign Up</h1>
            <p className="text-xs-center">
              <Link to="/login">Have an account?</Link>
            </p>
            {renderErrorMessages(errors.body)}
            {renderErrorMessages(errors.email && [`email ${errors.email}`])}
            {renderErrorMessages(errors.username && [`username ${errors.username}`])}
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
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
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">
                  Sign up
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
