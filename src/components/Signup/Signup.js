import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import { mockSignup } from '../../services/auth_api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
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
    } else if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(formData.username.trim())) {
      nextErrors.username = 'Username must be 3-20 chars and use letters, numbers, _, ., -';
    }

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      nextErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      nextErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.password) {
      nextErrors.confirmPassword = 'Passwords do not match';
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
        fullName: formData.fullName.trim(),
        password: formData.password,
        mobileNumber: formData.mobileNumber.trim(),
      };

      await mockSignup(payload);
      navigate('/login', { replace: true });
    } catch (error) {
      setApiError(error.message || 'Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-background-shape signup-shape-one" />
      <div className="signup-background-shape signup-shape-two" />

      <section className="signup-card" aria-label="Create account form">
        <p className="signup-kicker">Join the Journey</p>
        <h1>Create your learner account</h1>
        <p className="signup-subtitle">Start tracking Python progress with your personal dashboard.</p>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
            />
            {errors.username && <small className="signup-error">{errors.username}</small>}
          </div>

          <div className="signup-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
            {errors.fullName && <small className="signup-error">{errors.fullName}</small>}
          </div>

          <div className="signup-field">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              id="mobileNumber"
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              autoComplete="tel"
              maxLength={10}
            />
            {errors.mobileNumber && <small className="signup-error">{errors.mobileNumber}</small>}
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
            />
            {errors.password && <small className="signup-error">{errors.password}</small>}
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <small className="signup-error">{errors.confirmPassword}</small>}
          </div>

          {apiError && <p className="signup-api-error">{apiError}</p>}

          <button type="submit" className="signup-primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="signup-footer-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
