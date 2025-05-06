// components/PostItem.tsx
import React, { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import VotingSystem from './VotingSystem';

// Define the Post type to match your Firestore schema
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfilePic: string;
  createdAt: any; // Firestore timestamp
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

interface PostItemProps {
  post: Post;
}

// Define styles for the component
const styles: Record<string, CSSProperties> = {
  postCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  postCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  profilePic: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '10px',
    backgroundColor: '#2A2A2A',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFF',
  },
  postDate: {
    fontSize: '12px',
    color: '#AAA',
  },
  postTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#FFF',
    margin: '10px 0',
  },
  postContent: {
    fontSize: '14px',
    color: '#CCC',
    marginBottom: '15px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  postFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #333',
    paddingTop: '12px',
    marginTop: '5px',
  },
  commentCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#AAA',
    fontSize: '13px',
  },
  commentIcon: {
    marginRight: '3px',
    fontSize: '14px',
  },
};

// Helper function to format date
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'Just now';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
    });
  }
};

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  
  // Truncate content for preview
  const truncatedContent = currentPost.content.length > 150 
    ? currentPost.content.substring(0, 150) + '...' 
    : currentPost.content;
  
  // Handle vote changes
  const handleVoteChange = (newUpvotes: number, newDownvotes: number) => {
    setCurrentPost({
      ...currentPost,
      upvotes: newUpvotes,
      downvotes: newDownvotes
    });
  };
  
  // Handle click to view post details
  const handleClick = () => {
    navigate(`/community/post/${currentPost.id}`);
  };
  
  // Handle click on voting system to prevent navigation
  const handleVotingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      style={{
        ...styles.postCard,
        ...(isHovered ? styles.postCardHover : {})
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.postHeader}>
        {currentPost.authorProfilePic ? (
          <img 
            src={currentPost.authorProfilePic} 
            alt={`${currentPost.authorUsername}'s profile`} 
            style={styles.profilePic}
          />
        ) : (
          <div style={styles.profilePic} />
        )}
        <div style={styles.authorInfo}>
          <span style={styles.authorName}>{currentPost.authorUsername}</span>
          <span style={styles.postDate}>{formatDate(currentPost.createdAt)}</span>
        </div>
      </div>
      
      <h3 style={styles.postTitle}>{currentPost.title}</h3>
      <p style={styles.postContent}>{truncatedContent}</p>
      
      <div style={styles.postFooter}>
        <div onClick={handleVotingClick}>
          <VotingSystem 
            postId={currentPost.id} 
            currentUpvotes={currentPost.upvotes}
            currentDownvotes={currentPost.downvotes}
            onVoteChange={handleVoteChange}
          />
        </div>
        
        <div style={styles.commentCount}>
          <span style={styles.commentIcon}>💬</span>
          {currentPost.commentCount} {currentPost.commentCount === 1 ? 'comment' : 'comments'}
        </div>
      </div>
    </div>
  );
};

export default PostItem;