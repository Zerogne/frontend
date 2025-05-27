import React from 'react';
import './TopRated.css';

const TopRated = () => {
  return (
    <div className="top-rated-container">
      <h1>Top Rated Posts</h1>
      <div className="posts-grid">
        {/* Posts will be mapped here */}
        <div className="no-posts-message">
          <p>No top rated posts yet</p>
        </div>
      </div>
    </div>
  );
};

export default TopRated; 