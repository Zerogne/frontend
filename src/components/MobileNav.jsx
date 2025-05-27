import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileNav.css';
import CreatePostModal from './CreatePostModal';

const MobileNav = () => {
  const location = useLocation();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.className = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';
      setIsDarkTheme(savedTheme === 'dark');
    } else {
      // Set default theme to light if no theme is saved
      document.body.className = 'light-theme';
      localStorage.setItem('theme', 'light');
      setIsDarkTheme(false);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    document.body.className = newTheme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('theme', newTheme);
    setIsDarkTheme(!isDarkTheme);
  };

  const handleCreatePostClick = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  return (
    <>
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {isDarkTheme ? (
          <span className="theme-icon sun-icon" />
        ) : (
          <span className="theme-icon moon-icon" />
        )}
      </button>
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
        <Link to="/top-rated" className={`nav-item ${location.pathname === '/top-rated' ? 'active' : ''}`}>
          <span className="solar--medal-ribbon-bold"></span>
          <span>Top Rated</span>
        </Link>
        <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <span className="material-symbols--person-rounded"></span>
          <span>Profile</span>
        </Link>
        {showCreatePostModal && <CreatePostModal onClose={handleCloseCreatePostModal} />}
      </div>
    </>
  );
};

export default MobileNav; 