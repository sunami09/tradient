// components/CommunityGuard.tsx
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Community from '../pages/Community';

const CommunityGuard = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [hasUsername, setHasUsername] = useState(false);
  
  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Check if user has a community profile
  useEffect(() => {
    const checkCommunityProfile = async () => {
      try {
        if (!user) {
          setCheckingProfile(false);
          return;
        }
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // Check if the user has a username set up
        if (userDoc.exists() && userDoc.data().username) {
          setHasUsername(true);
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      } finally {
        setCheckingProfile(false);
      }
    };
    
    if (user) {
      checkCommunityProfile();
    } else {
      setCheckingProfile(false);
    }
  }, [user]);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (checkingProfile) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 100px)',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }
  
  // If user doesn't have a username, redirect to setup page
  if (!hasUsername) {
    return <Navigate to="/community-setup" replace />;
  }
  
  // User has username, show community page
  return <Community />;
};

export default CommunityGuard;