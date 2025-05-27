import React, { useState, useEffect } from 'react';
import PostBox from './PostBox';
import './PostContainer.css'; // Create this for styling
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    // TODO: Fetch posts from your backend
    // This is a temporary mock data
    const mockPosts = [
      {
        id: 1,
        author: 'John Doe',
        date: new Date().toISOString(),
        title: 'First Post',
        content: 'This is a sample post content.',
        likes: 5,
        comments: []
      },
      {
        id: 2,
        author: 'Jane Smith',
        date: new Date().toISOString(),
        title: 'Second Post',
        content: 'Another sample post content.',
        likes: 3,
        comments: []
      }
    ];
    setPosts(mockPosts);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: (post.likes || 0) + 1 }
        : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...(post.comments || []), comment] }
        : post
    ));
  };

  return (
    <div className="post-container">
      {posts.map(post => (
        <PostBox 
          key={post.id} 
          post={post}
          onLike={() => handleLike(post.id)}
          onComment={(comment) => handleComment(post.id, comment)}
        />
      ))}
    </div>
  );
};

export default PostContainer;
