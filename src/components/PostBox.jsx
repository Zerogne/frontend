import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostBox.css'; // Create this for styling
import { auth } from '../firebase';

const PostBox = ({ post, onEditClick, onDeleteClick, currentUserId, onPostUpdated, fetchUserInfo }) => {
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(post.likes || 0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentUserNames, setCommentUserNames] = useState({});

  // Check if the current user has upvoted this post
  const hasUpvoted = post.upvotedBy?.includes(currentUserId);

  // Effect to fetch commenter names when post.comments changes
  useEffect(() => {
    const fetchNamesForComments = async () => {
        const namesToFetch = new Set();
        if (post.comments) {
            post.comments.forEach(comment => {
                // Only fetch if name is not already known
                if (comment.userId && !commentUserNames[comment.userId]) {
                    namesToFetch.add(comment.userId);
                }
            });
        }

        const newNames = {};
        for (const userId of namesToFetch) {
            try {
                // Use the fetchUserInfo prop passed from the parent
                const userName = await fetchUserInfo(userId);
                newNames[userId] = userName;
            } catch (error) {
                console.error(`Error fetching commenter info for ${userId}:`, error);
                newNames[userId] = 'User'; // Default if fetch fails
            }
        }

        setCommentUserNames(prevNames => ({ ...prevNames, ...newNames }));
    };

    if (post.comments && post.comments.length > 0 && fetchUserInfo) {
        fetchNamesForComments();
    }
  }, [post.comments, fetchUserInfo]); // Removed currentUserId from dependencies

  const handleUpvote = async () => {
    if (!currentUserId) {
       console.error('User not logged in for upvote');
       return;
    }

    try {
      // Get the Firebase ID token
      const token = await auth.currentUser.getIdToken();
      
      const response = await fetch(`http://localhost:3000/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            type: 'upvote',
            userId: currentUserId 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to update upvotes:', error);
        return;
      }

      const data = await response.json();
      console.log('Upvote successful, backend response:', data);

      // Update the local state with the new upvote count
      setUpvotes(data.upvotes);

      // Call parent handler to update the post data
      if (onPostUpdated) {
        const updatedPost = { 
          ...post, 
          upvotes: data.upvotes, 
          upvotedBy: data.upvotedBy 
        };
        onPostUpdated(updatedPost);
      }

    } catch (error) {
      console.error('Error during upvote API call:', error);
    }
  };

  const handleCommentButtonClick = () => {
    setShowCommentInput(!showCommentInput);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      console.error('Comment Submit Error: User not logged in.');
      return;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText) {
      console.log('Comment Submit Info: Comment text is empty, not submitting.');
      return;
    }

    setIsSubmittingComment(true);
    console.log('Comment Submit Info: Attempting to submit comment...');
    console.log('Comment Submit Data: Post ID:', post._id, 'Comment Text:', trimmedText, 'User ID:', currentUserId);

    try {
      const token = await auth.currentUser.getIdToken();
      const requestBody = {
        type: 'comment',
        userId: currentUserId,
        text: trimmedText // Changed from commentText to text to match backend expectation
      };

      console.log('Comment Submit API Request:', { url: `http://localhost:3000/api/posts/${post._id}`, method: 'PUT', body: requestBody });

      const response = await fetch(`http://localhost:3000/api/posts/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Comment Submit API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Comment Submit API Error Response:', errorData);
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const resultData = await response.json();
      console.log('Comment Submit API Success Response:', resultData);

      if (resultData.comment && onPostUpdated) {
        const updatedPost = {
          ...post,
          comments: [...(post.comments || []), resultData.comment]
        };
        onPostUpdated(updatedPost);
        console.log('Comment Submit Info: Post state updated with new comment.');
      }

      setCommentText('');
      console.log('Comment Submit Info: Comment input cleared.');

    } catch (error) {
      console.error('Comment Submit Error: An error occurred during submission.', error);
    } finally {
      setIsSubmittingComment(false);
      console.log('Comment Submit Info: Submission process finished.');
    }
  };

  // Function to get the display name for a comment author
  const getCommentAuthorName = (comment) => {
      if (comment.userId === currentUserId) {
          return 'You';
      }
      return commentUserNames[comment.userId] || 'Loading...';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick(post);
    }
    setShowDropdown(false);
  };

  const handleDelete = () => {
    if (onDeleteClick) {
      onDeleteClick(post._id);
    }
    setShowDropdown(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if the current user is the author to show edit/delete options
  const isAuthor = currentUserId && post.userId === currentUserId;

  return (
    <div className="post-box">
      <div className="post-header">
        <div className="post-author-info">
          <div className="author-avatar">
            {post.author?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="author-details">
            <span className="post-author">{post.author || 'Anonymous'}</span>
            {post.schoolName && <span className="post-school">{post.schoolName}</span>}
            <span className="post-date">{formatDate(post.date)}</span>
          </div>
        </div>
        
        {isAuthor && (
          <div className="post-actions" onClick={e => e.stopPropagation()}>
            <button className="action-button" onClick={toggleDropdown}>
              <i className="fas fa-ellipsis-v"></i>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <button key={`edit-${post._id}`} onClick={handleEdit}>Edit</button>
                <button key={`delete-${post._id}`} onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.feedback}</p>
        {post.image && (
          <div className="post-image">
            <img src={post.image} alt="Post content" />
          </div>
        )}
      </div>

      {/* Post footer now contains only comments and share */} 
      <div className="post-footer" onClick={e => e.stopPropagation()}>
        {/* Row for stats and rating */} 
        <div className="footer-stats-row">
          {/* Original post stats */} 
          <div className="post-stats">
            <button 
                className={`stat-button ${hasUpvoted ? 'upvoted' : ''}`}
                onClick={handleUpvote}
            >
              <i className="fas fa-arrow-up"></i>
              <span>{post.upvotes || 0}</span>
            </button>
            <button 
                className={`stat-button ${showCommentInput ? 'active' : ''}`}
                onClick={handleCommentButtonClick}
            >
              <i className="fas fa-comment"></i>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          {/* Star rating display in footer */} 
          {post.rating > 0 && (
              <div className="post-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={`star-${post._id}-${star}`}
                    className={`star ${star <= post.rating ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
          )}
        </div>

        {/* Comment input and list - conditionally rendered below stats */} 
        {showCommentInput && (
            <div className="comment-section">
                <h4 className="comment-count-heading">{post.comments?.length || 0} Comments</h4>
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows="2"
                        disabled={isSubmittingComment}
                    ></textarea>
                    <button type="submit" disabled={isSubmittingComment}>
                        {isSubmittingComment ? 'Posting...' : 'Comment'}
                    </button>
                </form>
                
                 <div className="existing-comments">
                     {post.comments?.map(comment => (
                         <div key={comment._id} className="comment">
                             <div className="comment-header">
                                 <span className="comment-author">
                                     {getCommentAuthorName(comment)}
                                  </span>
                                  <span className="comment-date">
                                      {formatDate(comment.createdAt)}
                                  </span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                          </div>
                      ))}
                  </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default PostBox;
