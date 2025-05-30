import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNav.css';
import CreatePostModal from './CreatePostModal';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const MobileNav = () => {
  const location = useLocation();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [user] = useAuthState(auth);

  const handleCreatePostClick = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  return (
    <>
      <div className="mobile-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <span className="fa-solid--home"></span>
          <span>Home</span>
        </Link>
        <Link to="/popular" className={`nav-item ${location.pathname === '/popular' ? 'active' : ''}`}>
          <span className="tabler--flame-filled"></span>
          <span>Popular</span>
        </Link>
        <button className="create-post-btn" onClick={handleCreatePostClick}>
          <span className="line-md--plus"></span>
          <span>Create</span>
        </button>
        <Link to="/topRated" className={`nav-item ${location.pathname === '/topRated' ? 'active' : ''}`}>
          <span className="solar--medal-ribbon-bold"></span>
          <span>Top Rated</span>
        </Link>
          {user ? (
          <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
            <span className="material-symbols--person-rounded"></span>
            <span>Profile</span>
          </Link>
          ) : (
          <Link to="/login" className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
            <i className="fas fa-sign-in-alt"></i>
            <span>Account</span>
          </Link>
          )}
        {showCreatePostModal && <CreatePostModal onClose={handleCloseCreatePostModal} />}
      </div>
    </>
  );
};

export default MobileNav; 