import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Header from '../components/header.jsx';
import Side from '../components/side.jsx';
import MobileNav from '../components/MobileNav';
import './home.css';
import './TopRated.css';

const TopRated = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedSchoolType, setSelectedSchoolType] = useState('All Schools');

  useEffect(() => {
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    setIsSidebarOpen(!isMobile);

    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setIsSidebarOpen(!isMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (schoolType) => {
    setSelectedSchoolType(schoolType);
  };

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/posts/schools');
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        
        // Fetch ratings for each school
        const schoolsWithRatings = await Promise.all(
          data.map(async (school) => {
            try {
              const ratingsResponse = await fetch(`http://localhost:3000/api/posts/school-ratings/${school.name}`);
              if (!ratingsResponse.ok) {
                throw new Error('Failed to fetch ratings');
              }
              const ratingsData = await ratingsResponse.json();
              return {
                ...school,
                averageRating: ratingsData.averageRating || 0,
                totalReviews: ratingsData.totalReviews || 0
              };
            } catch (error) {
              console.error(`Error fetching ratings for ${school.name}:`, error);
              return {
                ...school,
                averageRating: 0,
                totalReviews: 0
              };
            }
          })
        );
        
        // After fetching and combining schools with their ratings
        const sortedSchools = schoolsWithRatings.sort((a, b) => {
          return (b.averageRating || 0) - (a.averageRating || 0);
        });
        
        setSchools(sortedSchools);
      } catch (err) {
        console.error('Error fetching schools:', err);
        setError('Failed to load schools');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = selectedSchoolType === 'All Schools'
    ? schools
    : schools.filter(school => school.type === selectedSchoolType);

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Side isOpen={isSidebarOpen} onFilterChange={handleFilterChange} />
      <div className="main-content-wrapper">
        <div className="top-rated-container">
          <h1>Schools</h1>
          <div className="schools-grid">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <div key={school._id} className="school-card">
                  <div className="school-header">
                    <h2>{school.name}</h2>
                    <div className="school-type">
                      <span className={`type-badge ${school.type.toLowerCase()}`}>
                        {school.type}
                      </span>
                    </div>
                  </div>
                  <div className="school-info">
                    <p className="school-description">{school.description}</p>
                    <p className="school-location">
                      <span className="location-icon">📍</span> {school.location}
                    </p>
                    <div className="school-rating">
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${star <= Math.round(school.averageRating) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="rating-info">
                        <span className="rating-value">{school.averageRating.toFixed(1)}</span>
                        <span className="rating-count">({school.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-schools-message">
                <p>No schools found</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
};

export default TopRated; 