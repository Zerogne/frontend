import React, { useState, useEffect } from 'react';
import './PostList.css';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostBox from './PostBox';
import CreatePostModal from './CreatePostModal';

const PostList = ({ searchQuery, schoolType }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, loadingUser, errorUser] = useAuthState(auth);
  const [userNames, setUserNames] = useState({});
  const [postToEdit, setPostToEdit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else if (schoolType) {
      fetchFilteredPosts();
    } else {
      fetchPosts();
    }
  }, [searchQuery, schoolType]);

  useEffect(() => {
    const fetchNames = async () => {
      const userNamesMap = {};
      for (const post of posts) {
        if (!post.postAnonymously && post.userId && !userNamesMap[post.userId]) {
          try {
            const userName = await fetchUserInfo(post.userId);
            userNamesMap[post.userId] = userName;
          } catch (err) {
            console.error(`Error fetching user info for ${post.userId}:`, err?.stack || err?.message || err);
            userNamesMap[post.userId] = 'User';
          }
        }
      }
      setUserNames(userNamesMap);
    };

    if (posts.length > 0) {
      fetchNames();
    }
  }, [posts]);

  const fetchUserInfo = async (userId) => {
    try {
      console.log('Fetching user info for:', userId);
      const response = await fetch(`http://localhost:3000/api/users/${userId}`);
      console.log('User info response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch user info:', errorData);
        throw new Error(errorData.message || 'Failed to fetch user info');
      }

      const userData = await response.json();
      console.log('Received user data:', userData);

      if (!userData?.firstName || !userData?.lastName) {
        console.error('User data incomplete or missing:', userData);
        return 'User';
      }

      return `${userData.firstName} ${userData.lastName}`;
    } catch (err) {
      console.error('Error fetching user info:', err?.stack || err?.message || err);
      return 'User';
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/posts');
      const data = await response.json().catch(() => null);

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || 'Failed to fetch posts');
      }

      console.log('Received posts:', data);
      const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err?.stack || err?.message || err);
      setError(err.message || 'Failed to load posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPosts = async () => {
    try {
      console.log('Fetching filtered posts for school type:', schoolType);
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:3000/api/posts/filter?schoolType=${encodeURIComponent(schoolType)}`);
      console.log('Filter response status:', response.status);
      
      const data = await response.json();
      console.log('Filter response data:', data);
      
      if (!response.ok) {
        console.error('Filter error response:', data);
        throw new Error(data?.message || 'Failed to fetch filtered posts');
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedPosts);

    } catch (err) {
      console.error('Error fetching filtered posts:', err?.message || err);
      setError(err?.message || 'Failed to load filtered posts. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = async () => {
    try {
      console.log('Fetching search results...');
      setLoading(true);
      setError('');

      const response = await fetch(
        `http://localhost:3000/api/posts/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json().catch(() => null);

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || 'Failed to fetch search results');
      }

      console.log('Received search results:', data);
      const sortedPosts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching search results:', err?.stack || err?.message || err);
      setError(err.message || 'Failed to load search results. Please try again.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(post => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handleEditClick = (post) => {
    setPostToEdit(post);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (postId) => {
    if (!user) {
      setError('You must be logged in to delete a post');
      return;
    }

    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `http://localhost:3000/api/posts/${postId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.message || 'Failed to delete post');
        }

        console.log('Post deleted successfully:', postId);
        setPosts(posts.filter(post => post._id !== postId));
        if (postToEdit?._id === postId) {
          setIsModalOpen(false);
          setPostToEdit(null);
        }
      } catch (err) {
        console.error('Error deleting post:', err?.stack || err?.message || err);
        setError(err.message || 'Failed to delete post. Please try again.');
      }
    }
  };

  const getUserDisplayName = (post) => {
    if (post.postAnonymously) return 'Anonymous';
    if (user?.uid && post.userId === user.uid) return 'You';
    return userNames[post.userId] || 'Loading...';
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPostToEdit(null);
  };

  if (loading || loadingUser) return <div>Loading posts...</div>;
  if (error || errorUser) return <div className="error-message">Error: {error || errorUser?.message}</div>;

  return (
    <div className="post-list-container">
      {posts.map(post => (
        <PostBox
          key={post._id}
          post={{
            ...post,
            author: getUserDisplayName(post),
            date: post.createdAt
          }}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          currentUserId={user?.uid}
          onPostUpdated={handlePostUpdated}
          fetchUserInfo={fetchUserInfo}
        />
      ))}

      {isModalOpen && (
        <CreatePostModal
          onClose={handleModalClose}
          postToEdit={postToEdit}
          onPostUpdated={fetchPosts}
        />
      )}
    </div>
  );
};

export default PostList;