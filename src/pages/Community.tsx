// pages/Community.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import CreatePostForm from '../components/CreatePostForm';
import PostItem from '../components/PostItem';

// Define Post type
interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorProfilePic: string;
  createdAt: any;
  upvotes: number;
  downvotes: number;
  commentCount: number;
}

// Define styles
const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '900px',
    margin: '100px auto 40px',
    padding: '0 1rem',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#FFF',
    margin: 0,
  },
  subTitle: {
    fontSize: '16px',
    color: '#AAA',
    marginTop: '10px',
    marginBottom: '30px',
  },
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#FFF',
    margin: '30px 0 15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
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
  emptyStateContainer: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#888',
  },
  emptyStateText: {
    fontSize: '15px',
    marginBottom: '15px',
  },
  tabsContainer: {
    display: 'flex',
    marginBottom: '25px',
    borderBottom: '1px solid #333',
  },
  tab: {
    padding: '10px 16px',
    marginRight: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#AAA',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#ccff59',
    borderBottom: '2px solid #ccff59',
  },
};

// Add the keyframes animation to the document
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

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  
  // Add animation keyframes
  useEffect(() => {
    const cleanup = addKeyframesToDocument();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);
  
  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Create query based on active tab
        let postsQuery;
        if (activeTab === 'recent') {
          postsQuery = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        } else if (activeTab === 'popular') {
          postsQuery = query(
            collection(db, 'posts'),
            orderBy('upvotes', 'desc'),
            limit(10)
          );
        } else {
          // Default to recent
          postsQuery = query(
            collection(db, 'posts'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
        }
        
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts: Post[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({
            id: doc.id,
            ...doc.data()
          } as Post);
        });
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Community</h1>
      </div>
      
      <p style={styles.subTitle}>
        Share your thoughts, ask questions, and connect with other traders.
      </p>
      
      {/* Create Post Form */}
      <CreatePostForm />
      
      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <div 
          style={{
            ...styles.tab,
            ...(activeTab === 'recent' ? styles.activeTab : {})
          }}
          onClick={() => handleTabChange('recent')}
        >
          Recent
        </div>
        <div 
          style={{
            ...styles.tab,
            ...(activeTab === 'popular' ? styles.activeTab : {})
          }}
          onClick={() => handleTabChange('popular')}
        >
          Popular
        </div>
      </div>
      
      
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingIndicator}></div>
        </div>
      ) : posts.length > 0 ? (
        <div style={styles.feedContainer}>
          {posts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div style={styles.emptyStateContainer}>
          <p style={styles.emptyStateText}>
            No posts yet. Be the first to start a discussion!
          </p>
        </div>
      )}
    </div>
  );
};

export default Community;