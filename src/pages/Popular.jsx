import './home.css'
import "@fontsource/inter";
import Header from '../components/header.jsx'
import Side from '../components/side.jsx';
import PostList from '../components/PostList';
import MobileNav from '../components/MobileNav';
import { useState, useEffect } from 'react';

function Popular() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <>
      <Header onMenuClick={toggleSidebar} />
      <Side isOpen={isSidebarOpen} />
      <MobileNav />
    </>
  )
}

export default Popular
