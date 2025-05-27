import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/header';
import Side from '../components/side';
import PostList from '../components/PostList';
import './home.css';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const query = searchParams.get('q');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <Header onMenuClick={toggleSidebar} />
            <Side isOpen={isSidebarOpen} />
            <div className="main-content-wrapper">
                <div className="posts-container">
                    <h2 className="search-results-title">Search Results for "{query}"</h2>
                    <PostList searchQuery={query} />
                </div>
            </div>
        </>
    );
}

export default SearchResults; 