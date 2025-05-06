// components/VotingSystem.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface VotingSystemProps {
  postId: string; 
  currentUpvotes: number;
  currentDownvotes: number;
  // Optional callback for when votes change
  onVoteChange?: (newUpvotes: number, newDownvotes: number) => void;
  // Indicator if this is for a comment (vs a post)
  isComment?: boolean;
  // If it's a comment, we need the comment ID
  commentId?: string;
}

const styles: Record<string, CSSProperties> = {
  votingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  voteItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
  },
  voteButton: {
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    backgroundColor: '#262525',
  },
  voteButtonHover: {
    backgroundColor: '#2A2A2A',
  },
  upvoteButton: {
    color: '#AAA',
  },
  upvoteActive: {
    color: '#00ff99',
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
  },
  upvoteIcon: {
    fontSize: '14px',
  },
  upvoteCount: {
    color: '#00ff99',
  },
  downvoteButton: {
    color: '#AAA',
  },
  downvoteActive: {
    color: '#ff6666',
    backgroundColor: 'rgba(255, 102, 102, 0.1)',
  },
  downvoteIcon: {
    fontSize: '14px',
  },
  downvoteCount: {
    color: '#ff6666',
  },
  voteCount: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#AAA',
  },
};

const VotingSystem: React.FC<VotingSystemProps> = ({ 
  postId, 
  currentUpvotes, 
  currentDownvotes,
  onVoteChange,
  isComment = false,
  commentId = '' 
}) => {
  const [upvotes, setUpvotes] = useState(currentUpvotes);
  const [downvotes, setDownvotes] = useState(currentDownvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverState, setHoverState] = useState<Record<string, boolean>>({});
  
  // Toggle hover state
  const toggleHover = (element: string, isHovered: boolean) => {
    setHoverState(prev => ({
      ...prev,
      [element]: isHovered
    }));
  };
  
  // Check if user has already voted when component mounts
  useEffect(() => {
    const checkUserVote = async () => {
      if (!auth.currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Path depends on whether this is for a post or comment
        const votePath = isComment 
          ? `posts/${postId}/comments/${commentId}/votes/${auth.currentUser.uid}`
          : `posts/${postId}/votes/${auth.currentUser.uid}`;
        
        const voteDoc = await getDoc(doc(db, votePath));
        
        if (voteDoc.exists()) {
          setUserVote(voteDoc.data().type);
        } else {
          setUserVote(null);
        }
      } catch (err) {
        console.error('Error checking user vote:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserVote();
  }, [postId, commentId, isComment]);
  
  // Handle vote action
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!auth.currentUser) return;
    
    // If already loading, don't allow more clicks
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const userId = auth.currentUser.uid;
      // Path depends on whether this is for a post or comment
      const votesPath = isComment
        ? `posts/${postId}/comments/${commentId}/votes`
        : `posts/${postId}/votes`;
      
      const mainDocPath = isComment
        ? `posts/${postId}/comments/${commentId}`
        : `posts/${postId}`;
      
      const mainDocRef = doc(db, mainDocPath);
      const userVoteRef = doc(db, `${votesPath}/${userId}`);
      
      // Get the current document first
      const mainDocSnap = await getDoc(mainDocRef);
      if (!mainDocSnap.exists()) {
        console.error('Post or comment not found');
        setIsLoading(false);
        return;
      }
      
      const currentData = mainDocSnap.data();
      let newUpvotes = currentData.upvotes || 0;
      let newDownvotes = currentData.downvotes || 0;
      
      // Check if user already voted
      const userVoteSnap = await getDoc(userVoteRef);
      const hasVoted = userVoteSnap.exists();
      const previousVote = hasVoted ? userVoteSnap.data().type : null;
      
      // Case 1: Clicking the same vote type - remove the vote
      if (previousVote === voteType) {
        // Remove the vote
        await deleteDoc(userVoteRef);
        
        // Update counts
        if (voteType === 'upvote') {
          newUpvotes--;
        } else {
          newDownvotes--;
        }
        
        // Update state
        setUserVote(null);
      }
      // Case 2: No previous vote - add new vote
      else if (!hasVoted) {
        // Add the vote
        await setDoc(userVoteRef, {
          userId,
          type: voteType,
          createdAt: new Date()
        });
        
        // Update counts
        if (voteType === 'upvote') {
          newUpvotes++;
        } else {
          newDownvotes++;
        }
        
        // Update state
        setUserVote(voteType);
      }
      // Case 3: Changing vote from one type to another
      else {
        // Update the vote
        await setDoc(userVoteRef, {
          userId,
          type: voteType,
          createdAt: new Date()
        });
        
        // Update counts
        if (voteType === 'upvote') {
          newUpvotes++;
          newDownvotes--;
        } else {
          newUpvotes--;
          newDownvotes++;
        }
        
        // Update state
        setUserVote(voteType);
      }
      
      // Update the main document with new counts
      await setDoc(mainDocRef, {
        ...currentData,
        upvotes: newUpvotes,
        downvotes: newDownvotes
      }, { merge: true });
      
      // Update local state
      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      
      // Callback if provided
      if (onVoteChange) {
        onVoteChange(newUpvotes, newDownvotes);
      }
    } catch (err) {
      console.error('Error updating vote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.votingContainer}>
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        style={{
          ...styles.voteButton,
          ...styles.upvoteButton,
          ...(hoverState.upvote ? styles.voteButtonHover : {}),
          ...(userVote === 'upvote' ? styles.upvoteActive : {})
        }}
        onMouseEnter={() => toggleHover('upvote', true)}
        onMouseLeave={() => toggleHover('upvote', false)}
      >
        <span style={styles.upvoteIcon}>↑</span>
        <span>{upvotes}</span>
      </button>
      
      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        style={{
          ...styles.voteButton,
          ...styles.downvoteButton,
          ...(hoverState.downvote ? styles.voteButtonHover : {}),
          ...(userVote === 'downvote' ? styles.downvoteActive : {})
        }}
        onMouseEnter={() => toggleHover('downvote', true)}
        onMouseLeave={() => toggleHover('downvote', false)}
      >
        <span style={styles.downvoteIcon}>↓</span>
        <span>{downvotes}</span>
      </button>
    </div>
  );
};

export default VotingSystem;