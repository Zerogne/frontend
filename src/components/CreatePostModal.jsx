import React, { useState, useEffect } from 'react';
import './CreatePostModal.css';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const CreatePostModal = ({ onClose, postToEdit, onPostUpdated }) => {
  const [schoolName, setSchoolName] = useState('');
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user] = useAuthState(auth);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/posts/schools');
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        setSchools(data);
      } catch (error) {
        console.error('Error fetching schools:', error);
        setError('Failed to load schools. Please try again.');
      } finally {
        setLoadingSchools(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    if (postToEdit) {
      // Populate form fields if in edit mode
      setSchoolName(postToEdit.schoolName || '');
      setTitle(postToEdit.title || '');
      setFeedback(postToEdit.feedback || '');
      setRating(postToEdit.rating || 0);
      setPostAnonymously(postToEdit.postAnonymously || false);
    } else {
      // Reset form fields if in create mode
      setSchoolName('');
      setTitle('');
      setFeedback('');
      setRating(0);
      setPostAnonymously(false);
    }
  }, [postToEdit]); // Re-run effect when postToEdit changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!user) {
      setError('You must be logged in to create/edit a post');
      setIsSubmitting(false);
      return;
    }

    const postData = {
      userId: user.uid,
      schoolName,
      title,
      feedback,
      rating,
      postAnonymously,
    };

    const method = postToEdit ? 'PUT' : 'POST';
    const url = postToEdit 
      ? `http://localhost:3000/api/posts/${postToEdit._id}` 
      : 'http://localhost:3000/api/posts';

    try {
      // Get the Firebase ID token
      const token = await user.getIdToken();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${postToEdit ? 'update' : 'create'} post`);
      }

      console.log(`Post ${postToEdit ? 'updated' : 'created'} successfully:`, data);
      
      if (onPostUpdated) {
        onPostUpdated();
      }
      onClose();

    } catch (err) {
      console.error(`Error ${postToEdit ? 'updating' : 'creating'} post:`, err);
      setError(err.message || `Failed to ${postToEdit ? 'update' : 'create'} post. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{postToEdit ? 'Edit Post' : 'Create a Post'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>School Name</label>
              <select
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                disabled={isSubmitting || loadingSchools}
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school.name} value={school.name}>
                    {school.name} ({school.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your headline?"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Your Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience..."
                rows="5"
                required
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Rate Your Experience</label>
              <div className="rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? 'filled' : ''}`}
                    onClick={() => !isSubmitting && setRating(star)}
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <div className="anonymous-toggle">
                <label htmlFor="postAnonymously">Post Anonymously</label>
                <input
                  id="postAnonymously"
                  type="checkbox"
                  checked={postAnonymously}
                  onChange={(e) => setPostAnonymously(e.target.checked)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (postToEdit ? 'Update Post' : 'Submit Post')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal; 