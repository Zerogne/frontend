import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase'; // 

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Student');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Add theme handling
  useEffect(() => {
    const isLightTheme = document.body.classList.contains('light-theme');
    if (isLightTheme) {
      document.body.classList.add('light-theme');
    }
  }, []);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const auth = getAuth(app);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user created:', user.uid);

      // 2. Save profile info in MongoDB via your backend
      const userData = {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        role,
      };
      console.log('Sending user data to backend:', userData);

      const backendResponse = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!backendResponse.ok) {
        console.warn('Backend failed to save user details, user created in Firebase only:', user.uid);
        const backendError = await backendResponse.json();
        throw new Error(`Failed to save user details: ${backendError.message || backendResponse.statusText}`);
      }

      const savedUser = await backendResponse.json();
      console.log('User saved in backend:', savedUser);

      // 3. Verify the user was saved by fetching all users
      const verifyResponse = await fetch('http://localhost:3000/api/users');
      const allUsers = await verifyResponse.json();
      console.log('All users in database:', allUsers);

      // 4. Both steps successful
      alert('Account created successfully!');
      navigate('/');

    } catch (error) {
      console.error('Signup error:', error);
      // Handle specific Firebase errors or general fetch errors
      if (error.code === 'auth/email-already-in-use') {
        alert('This email address is already in use.');
      } else if (error.message.startsWith('Failed to save user details:')) {
        alert(error.message);
      } else {
        alert('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container card signup-card">
      <button className="close-btn" aria-label="Close" onClick={() => navigate('/')}>
        &times;
      </button>
      <h2>Sign Up</h2>
      <hr className="auth-title-separator" />
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="signup-names-row">
          <div className="signup-name-field">
            <label>First Name</label>
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="signup-name-field">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <label>Email</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={handlePasswordChange}
            required
            disabled={isLoading}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={0}
            role="button"
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        {password && (
          <>
        <div className="password-strength">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`strength-bar ${index < passwordStrength ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="password-requirements-summary">
              <div className="strength-label">Strong</div>
              <div className="requirements-row">
                <span className={password.length >= 8 ? 'requirement-met' : ''}>• 8+ chars</span>
                <span className={/[A-Z]/.test(password) ? 'requirement-met' : ''}>• A-Z</span>
                <span className={/[a-z]/.test(password) ? 'requirement-met' : ''}>• a-z</span>
                <span className={/[0-9]/.test(password) ? 'requirement-met' : ''}>• 0-9</span>
                <span className={/[^A-Za-z0-9]/.test(password) ? 'requirement-met' : ''}>• !@#$</span>
              </div>
               {/* Info icon placeholder - styling needed in CSS */}
              <span className="info-icon">ℹ️</span>
            </div>
          </>
        )}
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={0}
            role="button"
            aria-label="Toggle password visibility"
          >
            {showConfirmPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <label>I am a:</label>
        <select value={role} onChange={e => setRole(e.target.value)} disabled={isLoading}>
          <option>Select</option>
          <option>Student</option>
          <option>Teacher</option>
          <option>Parent</option>
          <option>Other</option>
        </select>
        <label className="terms-label">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            required
          />
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>
        <button type="submit" className="login-btn" style={{ width: '100%' }} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="signup-link">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
};

export default Signup;
