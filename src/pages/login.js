import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ history }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://node-express-conduit.appspot.com/api/users/login', {
        user: { email, password }
      });
      localStorage.setItem('jwt', response.data.user.token);
      window.location.href = '/';
    } catch (error) {
      if (error.response ) {
        // Handle unauthorized error
        setErrors({ body: ['Invalid email or password'] });
      } else if (error.response && error.response.status === 422) {
        // Handle validation errors
        setErrors(error.response.data.errors);
      } else {
        // Handle unexpected errors
        console.error('Login error', error);
        setErrors({ body: ['Unexpected error occurred. Please try again.'] });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign In</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>
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
                  Sign in
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
