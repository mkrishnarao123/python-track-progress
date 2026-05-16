import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { login } from '../../services/auth_api';
import { setAuthData } from '../../utils/authUtils';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.username.trim()) {
      nextErrors.username = 'Username is required';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
      };
      const response = await login(payload);
      const { token, user } = response.data;

      setAuthData(token, user);

      if (onLoginSuccess) {
        onLoginSuccess(user, token);
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-background-shape login-shape-one" />
      <div className="login-background-shape login-shape-two" />

      <section className="login-card" aria-label="Login form">
        <p className="login-kicker">Welcome Back</p>
        <h1>Sign in to your learning dashboard</h1>
        <p className="login-subtitle">Use your username and password to continue your progress.</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {errors.username && <small className="login-error">{errors.username}</small>}
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <small className="login-error">{errors.password}</small>}
          </div>

          {apiError && <p className="login-api-error">{apiError}</p>}

          <button type="submit" className="login-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>

          <p className="login-footer-text">
            New user? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
