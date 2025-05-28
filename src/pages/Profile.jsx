import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import './Profile.css';

const Profile = () => {
  const [user] = useAuthState(auth);
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
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      email: userInfo.email || '',
      role: userInfo.role || ''
    });
  };

  const handleSave = async () => {
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
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
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

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {userInfo?.firstName?.charAt(0)}{userInfo?.lastName?.charAt(0)}
        </div>
        <h1>{userInfo?.firstName} {userInfo?.lastName}</h1>
        <p className="profile-role">{userInfo?.role}</p>
      </div>

      <div className="profile-content">
        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={editedInfo.firstName}
                onChange={(e) => setEditedInfo({...editedInfo, firstName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={editedInfo.lastName}
                onChange={(e) => setEditedInfo({...editedInfo, lastName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editedInfo.email}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={editedInfo.role}
                disabled
              />
            </div>
            <div className="profile-actions">
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
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
    </div>
  );
};

export default Profile; 