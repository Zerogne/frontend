import './home.css'
import "@fontsource/inter";
import Header from '../components/header.jsx'
import Side from '../components/side.jsx';
import PostList from '../components/PostList';
import MobileNav from '../components/MobileNav';
import { useState, useEffect } from 'react';

const Home = () => {
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

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Side isOpen={isSidebarOpen} onFilterChange={handleFilterChange} />
      <div className="main-content-wrapper">
        <div className="posts-container">
          <PostList schoolType={selectedSchoolType} />
        </div>
      </div>
      <MobileNav />
    </>
  )
}

export default Home
