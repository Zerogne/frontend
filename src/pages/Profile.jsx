import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import PostBox from '../components/PostBox';
import './Profile.css';

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const navigate = useNavigate();

  const fetchUserInfo = async (userId) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const userData = await response.json();
      return `${userData.firstName} ${userData.lastName}`;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return 'User';
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`http://localhost:3000/api/users/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          setEditedInfo({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            role: data.role || ''
          });
        } else {
          throw new Error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to load profile information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      setPostsError('');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const token = await user.getIdToken();
      console.log('Fetching user posts for:', user.uid);
      console.log('Using token:', token ? 'Token present' : 'No token');

      const response = await fetch(`http://localhost:3000/api/posts/user/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your posts');
        } else if (response.status === 404) {
          throw new Error('User posts not found');
        } else if (response.status === 500) {
          throw new Error(data.message || 'Server error while fetching posts');
        }
        throw new Error(data.message || 'Failed to fetch user posts');
      }

      setPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPostsError(error.message || 'Failed to load your posts');
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };

  const handleEditClick = (post) => {
    navigate(`/edit-post/${post._id}`);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortOptions(false);
    
    const sortedPosts = [...posts];
    switch (option) {
      case 'newest':
        sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest-rated':
        sortedPosts.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-rated':
        sortedPosts.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    setPosts(sortedPosts);
  };

  const handleDeleteClick = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }

        setPosts(posts.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        setPostsError('Failed to delete post');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editedInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!editedInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!editedInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editedInfo.email)) {
      errors.email = 'Email is invalid';
    }
    if (!editedInfo.role.trim()) {
      errors.role = 'Role is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      email: userInfo.email || '',
      role: userInfo.role || ''
    });
    setValidationErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3000/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedInfo)
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserInfo(updatedData);
        setIsEditing(false);
        setValidationErrors({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const getInitials = () => {
    if (!userInfo) return '';
    return `${userInfo.firstName?.[0] || ''}${userInfo.lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading || isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <span className="back-icon">←</span> Back
      </button>

      <div className="profile-content">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials()}
          </div>
          <h1>{`${userInfo?.firstName} ${userInfo?.lastName}`}</h1>
          <p className="profile-role">{userInfo?.role}</p>
        </div>

        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={editedInfo.firstName}
                onChange={handleInputChange}
                className={validationErrors.firstName ? 'error' : ''}
              />
              {validationErrors.firstName && (
                <span className="error-message">{validationErrors.firstName}</span>
              )}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={editedInfo.lastName}
                onChange={handleInputChange}
                className={validationErrors.lastName ? 'error' : ''}
              />
              {validationErrors.lastName && (
                <span className="error-message">{validationErrors.lastName}</span>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editedInfo.email}
                onChange={handleInputChange}
                className={validationErrors.email ? 'error' : ''}
              />
              {validationErrors.email && (
                <span className="error-message">{validationErrors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                name="role"
                value={editedInfo.role}
                onChange={handleInputChange}
                className={validationErrors.role ? 'error' : ''}
              />
              {validationErrors.role && (
                <span className="error-message">{validationErrors.role}</span>
              )}
            </div>
            <div className="profile-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>First Name</label>
              <p>{userInfo?.firstName}</p>
            </div>
            <div className="info-group">
              <label>Last Name</label>
              <p>{userInfo?.lastName}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{userInfo?.email}</p>
            </div>
            <div className="info-group">
              <label>Role</label>
              <p>{userInfo?.role}</p>
            </div>
            <div className="profile-actions">
              <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        )}
      </div>

      <div className="user-posts-section">
        <div className="posts-header">
          <h2>Your Posts</h2>
          <div className="posts-actions">
            <div className="sort-container">
              <button 
                className="sort-button"
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                Sort by: {sortOption.replace('-', ' ')}
                <span className="sort-icon">▼</span>
              </button>
              {showSortOptions && (
                <div className="sort-options">
                  <button onClick={() => handleSortChange('newest')}>Newest</button>
                  <button onClick={() => handleSortChange('oldest')}>Oldest</button>
                  <button onClick={() => handleSortChange('highest-rated')}>Highest Rated</button>
                  <button onClick={() => handleSortChange('lowest-rated')}>Lowest Rated</button>
                </div>
              )}
            </div>
            <button 
              className="refresh-button"
              onClick={fetchUserPosts}
              disabled={loadingPosts}
            >
              {loadingPosts ? 'Refreshing...' : 'Refresh Posts'}
            </button>
          </div>
        </div>
        {loadingPosts ? (
          <div className="posts-loading">Loading your posts...</div>
        ) : postsError ? (
          <div className="posts-error">{postsError}</div>
        ) : posts.length === 0 ? (
          <div className="no-posts-message">You haven't made any posts yet.</div>
        ) : (
          <div className="user-posts">
            {posts.map(post => (
              <PostBox
                key={post._id}
                post={{
                  ...post,
                  author: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'You',
                  date: post.createdAt
                }}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                currentUserId={user?.uid}
                onPostUpdated={handlePostUpdated}
                fetchUserInfo={fetchUserInfo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 