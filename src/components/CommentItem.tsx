// components/CommentItem.tsx
import React, { useState, CSSProperties } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import VotingSystem from './VotingSystem';

// Define Comment type
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

interface CommentItemProps {
  comment: Comment;
  postId: string;
  replies?: Comment[];
  depth?: number;
}

// Define styles
const styles: Record<string, CSSProperties> = {
  commentCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: '6px',
    padding: '15px 20px',
    marginBottom: '12px',
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  profilePic: {
    width: '32px',
    height: '32px',
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
  commentDate: {
    fontSize: '12px',
    color: '#AAA',
  },
  commentContent: {
    fontSize: '15px',
    lineHeight: 1.5,
    color: '#CCC',
    marginTop: '5px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  commentFooter: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '12px',
    paddingTop: '8px',
    borderTop: '1px solid #333',
  },
  replyButton: {
    background: 'none',
    border: 'none',
    color: '#AAA',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginLeft: 'auto',
    backgroundColor: '#474747',
  },
  replyButtonHover: {
    backgroundColor: '#2A2A2A',
   
  },
  replyForm: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #333',
  },
  replyInput: {
    width: '96%',
    padding: '10px 12px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
  },
  replyControls: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '10px',
    gap: '10px',
  },
  replyCancel: {
    background: 'none',
    border: '1px solid #444',
    borderRadius: '20px',
    padding: '6px 12px',
    color: '#AAA',
    fontSize: '12px',
    cursor: 'pointer',
  },
  replySubmit: {
    backgroundColor: '#ccff59',
    color: 'black',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },
};

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
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
    });
  }
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  replies = [],
  depth = 0,
}) => {
  const [hoverState, setHoverState] = useState<Record<string, boolean>>({});
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [currentComment, setCurrentComment] = useState(comment);

  const toggleHover = (element: string, isHovered: boolean) =>
    setHoverState(prev => ({ ...prev, [element]: isHovered }));

  const handleVoteChange = (newUpvotes: number, newDownvotes: number) => {
    setCurrentComment({
      ...currentComment,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    });
  };

  const toggleReplyForm = () => {
    if (!auth.currentUser) return;
    setShowReplyForm(!showReplyForm);
    setReplyContent('');
  };

  const handleReplySubmit = async () => {
    if (!auth.currentUser || !replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      await addDoc(collection(db, 'posts', postId, 'comments'), {
        content: replyContent,
        authorId: auth.currentUser.uid,
        authorUsername: userData?.displayUsername || 'Anonymous',
        authorProfilePic: userData?.profilePic || '',
        parentId: currentComment.id,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
      });

      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1),
      });

      setShowReplyForm(false);
      setReplyContent('');
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div style={styles.commentCard}>
      <div style={styles.commentHeader}>
        {currentComment.authorProfilePic && depth === 0 && (
          <img
            src={currentComment.authorProfilePic}
            alt={`${currentComment.authorUsername}'s profile`}
            style={styles.profilePic}
          />
        )}
        <div style={styles.authorInfo}>
          <span style={styles.authorName}>
            {currentComment.authorUsername}
          </span>
          {depth == 0 && (<span style={styles.commentDate}>
            {formatDate(currentComment.createdAt)}
          </span>)}
        </div>
      </div>

      <div style={styles.commentContent}>{currentComment.content}</div>

      <div style={styles.commentFooter}>
        <VotingSystem
          postId={postId}
          commentId={currentComment.id}
          currentUpvotes={currentComment.upvotes}
          currentDownvotes={currentComment.downvotes}
          onVoteChange={handleVoteChange}
          isComment={true}
        />

        {depth === 0 && (
          <button
            style={{
              ...styles.replyButton,
              ...(hoverState.reply ? styles.replyButtonHover : {}),
            }}
            onClick={toggleReplyForm}
            onMouseEnter={() => toggleHover('reply', true)}
            onMouseLeave={() => toggleHover('reply', false)}
          >
            Reply
          </button>
        )}
      </div>

      {showReplyForm && (
        <div style={styles.replyForm}>
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            style={styles.replyInput}
          />
          <div style={styles.replyControls}>
            <button
              style={styles.replyCancel}
              onClick={toggleReplyForm}
              disabled={submittingReply}
            >
              Cancel
            </button>
            <button
              style={styles.replySubmit}
              onClick={handleReplySubmit}
              disabled={submittingReply || !replyContent.trim()}
            >
              {submittingReply ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div style={{ marginLeft: depth * 20 + 20 }}>
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              replies={[]}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
