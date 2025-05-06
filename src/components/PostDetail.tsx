// pages/PostDetail.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';
import CommentItem from '../components/CommentItem';
import CreateCommentForm from '../components/CreateCommentForm';
import VotingSystem from '../components/VotingSystem';

// Define types
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfilePic: string;
  createdAt: any;
  updatedAt: any;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfilePic: string;
  createdAt: any;
  upvotes: number;
  downvotes: number;
  parentId?: string;
}

// Define styles
const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '100px auto 40px',
    padding: '0 1rem',
    color: '#fff',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#AAA',
    fontSize: '14px',
    marginBottom: '20px',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  backButtonHover: {
    color: '#FFF',
  },
  backIcon: {
    marginRight: '8px',
  },
  postCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '8px',
    padding: '25px 30px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  profilePic: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: '15px',
    backgroundColor: '#2A2A2A',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#FFF',
  },
  postDate: {
    fontSize: '14px',
    color: '#AAA',
    marginTop: '3px',
  },
  postTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#FFF',
    margin: '0 0 20px',
  },
  postContent: {
    fontSize: '16px',
    lineHeight: 1.6,
    color: '#DDD',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  postFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #333',
    paddingTop: '15px',
    marginTop: '25px',
  },
  commentHeader: {
    fontSize: '18px',
    fontWeight: 500,
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  },
  commentCount: {
    color: '#AAA',
    fontWeight: 'normal',
    marginLeft: '5px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px 0',
  },
  loadingIndicator: {
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTop: '3px solid #00ff99',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '4px',
    padding: '15px',
    color: '#ff6666',
    textAlign: 'center',
    marginBottom: '20px',
  },
  commentList: {
    marginTop: '25px',
  },
  noComments: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#888',
    fontSize: '15px',
  },
};

// Add the keyframes animation
const addKeyframesToDocument = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }
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

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState<Record<string, boolean>>({});
  
  // Add animation keyframes
  useEffect(() => {
    const cleanup = addKeyframesToDocument();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  
  // Toggle hover state for elements
  const toggleHover = (element: string, isHovered: boolean) => {
    setHoverState(prev => ({
      ...prev,
      [element]: isHovered
    }));
  };
  
  // Fetch post and comments
  useEffect(() => {
    if (!postId) {
      setError('Post ID is missing');
      setLoading(false);
      return;
    }
    
    const fetchPostAndComments = async () => {
      setLoading(true);
      try {
        // Fetch post data
        const postDoc = await getDoc(doc(db, 'posts', postId));
        
        if (!postDoc.exists()) {
          setError('Post not found');
          setLoading(false);
          return;
        }
        
        const postData = {
          id: postDoc.id,
          ...postDoc.data()
        } as Post;
        
        setPost(postData);
        
        // Fetch comments
        const commentsQuery = query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'desc')
        );
        
        const commentsSnapshot = await getDocs(commentsQuery);
        const fetchedComments: Comment[] = [];
        
        commentsSnapshot.forEach((doc) => {
          fetchedComments.push({
            id: doc.id,
            ...doc.data()
          } as Comment);
        });
        
        setComments(fetchedComments);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostAndComments();
  }, [postId]);
  
  // Handle vote change
  const handleVoteChange = (newUpvotes: number, newDownvotes: number) => {
    if (post) {
      setPost({
        ...post,
        upvotes: newUpvotes,
        downvotes: newDownvotes
      });
    }
  };
  
  // Add a new comment
  const handleAddComment = async (content: string) => {
    if (!auth.currentUser || !post) return false;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      
      // Add comment to Firestore
      const commentRef = await addDoc(collection(db, 'posts', post.id, 'comments'), {
        content,
        authorId: auth.currentUser.uid,
        authorUsername: userData?.displayUsername || 'Anonymous',
        authorProfilePic: userData?.profilePic || '',
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0
      });
      
      // Get the new comment with ID
      const newCommentDoc = await getDoc(commentRef);
      const newComment = {
        id: newCommentDoc.id,
        ...newCommentDoc.data()
      } as Comment;
      
      // Update comment count on post
      await updateDoc(doc(db, 'posts', post.id), {
        commentCount: increment(1)
      });
      
      // Update the post
      const updatedPostDoc = await getDoc(doc(db, 'posts', post.id));
      setPost({
        id: updatedPostDoc.id,
        ...updatedPostDoc.data()
      } as Post);
      
      // Add to local state
      setComments([newComment, ...comments]);
      
      return true;
    } catch (err) {
      console.error('Error adding comment:', err);
      return false;
    }
  };
  
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingIndicator}></div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          {error || 'Post not found'}
        </div>
        <div 
          style={{
            ...styles.backButton,
            ...(hoverState.backButton ? styles.backButtonHover : {})
          }}
          onClick={() => navigate('/community')}
          onMouseEnter={() => toggleHover('backButton', true)}
          onMouseLeave={() => toggleHover('backButton', false)}
        >
          <span style={styles.backIcon}>←</span> Back to Community
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      {/* Back button */}
      <div 
        style={{
          ...styles.backButton,
          ...(hoverState.backButton ? styles.backButtonHover : {})
        }}
        onClick={() => navigate('/community')}
        onMouseEnter={() => toggleHover('backButton', true)}
        onMouseLeave={() => toggleHover('backButton', false)}
      >
        <span style={styles.backIcon}>←</span> Back to Community
      </div>
      
      {/* Post */}
      <div style={styles.postCard}>
        <div style={styles.postHeader}>
          {post.authorProfilePic ? (
            <img 
              src={post.authorProfilePic} 
              alt={`${post.authorUsername}'s profile`} 
              style={styles.profilePic}
            />
          ) : (
            <div style={styles.profilePic} />
          )}
          <div style={styles.authorInfo}>
            <span style={styles.authorName}>{post.authorUsername}</span>
            <span style={styles.postDate}>{formatDate(post.createdAt)}</span>
          </div>
        </div>
        
        <h1 style={styles.postTitle}>{post.title}</h1>
        <div style={styles.postContent}>{post.content}</div>
        
        <div style={styles.postFooter}>
          <VotingSystem 
            postId={post.id}
            currentUpvotes={post.upvotes}
            currentDownvotes={post.downvotes}
            onVoteChange={handleVoteChange}
          />
        </div>
      </div>
      
      {/* Comment form */}
      <CreateCommentForm onSubmit={handleAddComment} />
      
      {/* Comments */}
      <div style={styles.commentHeader}>
        Comments <span style={styles.commentCount}>({post.commentCount})</span>
      </div>
      
      <div style={styles.commentList}>
        {comments.length > 0 ? (
          comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={post.id}
            />
          ))
        ) : (
          <div style={styles.noComments}>
            No comments yet. Be the first to join the discussion!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;