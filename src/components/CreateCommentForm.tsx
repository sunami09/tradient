// components/CreateCommentForm.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { auth } from '../firebase';

interface CreateCommentFormProps {
  onSubmit: (content: string) => Promise<boolean>;
}

// Define styles
const styles: Record<string, CSSProperties> = {
  commentFormCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '8px',
    padding: '20px 25px',
    marginBottom: '25px',
  },
  commentFormTitle: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '5px',
    color: '#FFF',
  },
  textareaWrapper: {
    position: 'relative',
  },
  commentTextarea: {
    width: '96%',
    padding: '12px 15px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '15px',
    minHeight: '100px',
    resize: 'vertical',
    transition: 'all 0.2s ease',
  },
  commentTextareaFocused: {
    outline: 'none',
    borderColor: '#00ff99',
    boxShadow: '0 0 0 2px rgba(0, 255, 153, 0.2)',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',

  },
  submitButton: {
    padding: '8px 10px',
    backgroundColor: '#ccff59',
    color: 'black',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 500,
    width: '20%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButtonHover: {
    backgroundColor: '#b8e550',
    transform: 'translateY(-1px)',
  },
  submitButtonDisabled: {
    backgroundColor: '#555',
    color: '#999',
    cursor: 'not-allowed',
  },
  errorMessage: {
    color: '#ff6666',
    fontSize: '14px',
    marginTop: '10px',
  },
  characterCount: {
    position: 'absolute',
    bottom: '10px',
    right: '15px',
    fontSize: '12px',
    color: '#888',
  },
  characterCountWarning: {
    color: '#ffaa00',
  },
  characterCountError: {
    color: '#ff4444',
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '20px',
    color: '#AAA',
    fontSize: '15px',
  },
};

const MAX_COMMENT_LENGTH = 1000;

const CreateCommentForm: React.FC<CreateCommentFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [hoverState, setHoverState] = useState<Record<string, boolean>>({});
  
  // Toggle hover state for buttons
  const toggleHover = (element: string, isHovered: boolean) => {
    setHoverState(prev => ({
      ...prev,
      [element]: isHovered
    }));
  };
  
  // Character count styling
  const getCharCountStyle = () => {
    const length = content.length;
    
    if (length > MAX_COMMENT_LENGTH) {
      return styles.characterCountError;
    } else if (length > MAX_COMMENT_LENGTH * 0.9) {
      return styles.characterCountWarning;
    }
    
    return {};
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError('You must be signed in to post a comment');
      return;
    }
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`Comment is too long (maximum ${MAX_COMMENT_LENGTH} characters)`);
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const success = await onSubmit(content);
      
      if (success) {
        setContent('');
      } else {
        setError('Failed to post comment');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If user isn't logged in, show login prompt
  if (!auth.currentUser) {
    return (
      <div style={styles.commentFormCard}>
        <div style={styles.loginPrompt}>
          You need to be signed in to post comments.
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.commentFormCard}>
      <h3 style={styles.commentFormTitle}>Add a Comment</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.textareaWrapper}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are your thoughts?"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              ...styles.commentTextarea,
              ...(focused ? styles.commentTextareaFocused : {})
            }}
          />
          <div style={{
            ...styles.characterCount,
            ...getCharCountStyle()
          }}>
            {content.length}/{MAX_COMMENT_LENGTH}
          </div>
        </div>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <div style={styles.buttonContainer}>
          <button
            type="submit"
            disabled={isSubmitting || content.length > MAX_COMMENT_LENGTH}
            style={{
              ...styles.submitButton,
              ...(isSubmitting || content.length > MAX_COMMENT_LENGTH ? styles.submitButtonDisabled : {}),
              ...(hoverState.submit && !isSubmitting && content.length <= MAX_COMMENT_LENGTH ? styles.submitButtonHover : {})
            }}
            onMouseEnter={() => toggleHover('submit', true)}
            onMouseLeave={() => toggleHover('submit', false)}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommentForm;