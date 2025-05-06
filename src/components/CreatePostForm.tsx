// components/CreatePostForm.tsx
import React, { useState, CSSProperties } from 'react';
import { auth, db } from '../firebase';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';

// Define styles for the component
const styles: Record<string, CSSProperties> = {
  createPostCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: '8px',
    padding: '25px 30px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '48vw',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 500,
    marginBottom: '10px',
    color: '#FFF',
  },
  formGroup: {
    marginBottom: '10px',
  },
  inputField: {
    width: '96%',
    padding: '12px 15px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },
  inputFieldFocused: {
    outline: 'none',
    borderColor: '#00ff99',
    boxShadow: '0 0 0 2px rgba(0, 255, 153, 0.3)',
  },
  textareaField: {
    minHeight: '80px',
    resize: 'vertical',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ccff59',
    color: 'black',
    border: 'none',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: 500,
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
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '4px',
    color: '#ff6666',
    textAlign: 'center',
    fontSize: '14px',
  },
  successMessage: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'rgba(0, 255, 153, 0.1)',
    border: '1px solid rgba(0, 255, 153, 0.3)',
    borderRadius: '4px',
    color: '#00ff99',
    textAlign: 'center',
    fontSize: '14px',
  }
};

const CreatePostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredElements, setHoveredElements] = useState<Record<string, boolean>>({});

  // Helper function to handle hover state
  const handleHover = (element: string, isHovered: boolean) => {
    setHoveredElements(prev => ({
      ...prev,
      [element]: isHovered
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError('You must be signed in to create a post');
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Get user data
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      // Create post document
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        authorId: auth.currentUser.uid,
        authorUsername: userData?.displayUsername || 'Anonymous',
        authorProfilePic: userData?.profilePic || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
        commentCount: 0
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setSuccess('Post created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.message || 'Error creating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add keyframes animation to document
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes fadeOut {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div style={styles.createPostCard}>
      <h2 style={styles.cardTitle}>Create a Post</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Post Title"
            required
            style={{
              ...styles.inputField,
              ...(focusedField === 'title' ? styles.inputFieldFocused : {})
            }}
            onFocus={() => setFocusedField('title')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        
        <div style={styles.formGroup}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            required
            rows={5}
            style={{
              ...styles.inputField,
              ...styles.textareaField,
              ...(focusedField === 'content' ? styles.inputFieldFocused : {})
            }}
            onFocus={() => setFocusedField('content')}
            onBlur={() => setFocusedField(null)}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            ...styles.submitButton,
            ...(isSubmitting ? styles.submitButtonDisabled : {}),
            ...(hoveredElements.submitButton && !isSubmitting ? styles.submitButtonHover : {})
          }}
          onMouseEnter={() => handleHover('submitButton', true)}
          onMouseLeave={() => handleHover('submitButton', false)}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {success && (
          <div 
            style={{
              ...styles.successMessage,
              animation: 'fadeOut 3s forwards'
            }}
          >
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePostForm;