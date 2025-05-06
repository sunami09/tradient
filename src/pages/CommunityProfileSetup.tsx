// pages/CommunityProfileSetup.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, Timestamp, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Define styles outside the component to avoid TypeScript issues
const styles : Record<string, CSSProperties> = {
  communityProfilePage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '20px',
  },
  communityProfileContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: '8px',
    maxWidth: '650px',
    width: '100%',
    color: 'white',
    padding: '40px 50px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  profileTitle: {
    fontSize: '24px',
    fontWeight: 500,
    marginBottom: '16px',
    textAlign: 'center',
  },
  profileDescription: {
    textAlign: 'center',
    color: '#BBB',
    marginBottom: '30px',
    fontSize: '15px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 0',
    gap: '15px',
  },
  loadingIndicator: {
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTop: '2px solid #00ff99',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 1s linear infinite',
  },
  profileFormContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  formField: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#BBB',
  },
  profilePicSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  profilePicCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#2A2A2A',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    color: '#777',
    fontSize: '14px',
  },
  profilePicImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  chooseImageBtn: {
    display: 'inline-block',
    padding: '10px 15px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#FFF',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  chooseImageBtnHover: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  inputWrapper: {
    position: 'relative',
  },
  formInput: {
    width: '95%',
    padding: '12px',
    backgroundColor: '#2A2A2A',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '15px',
    transition: 'all 0.2s ease',
  },
  inputValid: {
    borderColor: '#00ff99',
  },
  inputInvalid: {
    borderColor: '#ff4444',
  },
  formTextarea: {
    minHeight: '100px',
    resize: 'vertical',
  },
  inputStatus: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
  },
  statusChecking: {
    color: '#BBB',
  },
  statusAvailable: {
    color: '#00ff99',
  },
  inputError: {
    color: '#ff4444',
    fontSize: '14px',
    marginTop: '6px',
  },
  inputHelp: {
    color: '#777',
    fontSize: '13px',
    marginTop: '6px',
  },
  createProfileBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#ccff59',
    color: 'black',
    border: 'none',
    borderRadius: '30px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
  createProfileBtnHover: {
    backgroundColor: '#b8e550',
    transform: 'translateY(-1px)',
  },
  btnDisabled: {
    backgroundColor: '#555',
    color: '#999',
    cursor: 'not-allowed',
  },
  submissionError: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '4px',
    color: '#ff6666',
    textAlign: 'center',
    fontSize: '14px',
  },
  hiddenInput: {
    display: 'none',
  },
  inputFocused: {
    outline: 'none',
    borderColor: '#00ff99',
    boxShadow: '0 0 0 2px rgba(0, 255, 153, 0.3)',
  },
};

// Add the keyframes animation to the document
const addKeyframesStyleToDocument = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

const CommunityProfileSetup = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredElements, setHoveredElements] = useState<Record<string, boolean>>({});
  
  // Cache of all usernames - loaded once when component mounts
  const [usernameCache, setUsernameCache] = useState<Set<string>>(new Set());
  const [cacheLoaded, setCacheLoaded] = useState(false);

  // Add keyframes animation when component mounts
  useEffect(() => {
    addKeyframesStyleToDocument();
  }, []);

  // Check if user already has a community profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().username) {
          // User already has a profile, redirect to community
          navigate('/community');
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      }
    };
    
    checkExistingProfile();
  }, [navigate]);
  
  // Load all usernames into cache when component mounts
  useEffect(() => {
    const loadUsernameCache = async () => {
      try {
        const usernamesSnapshot = await getDocs(collection(db, 'usernames'));
        const usernamesSet = new Set<string>();
        
        usernamesSnapshot.forEach(doc => {
          usernamesSet.add(doc.id);
        });
        
        setUsernameCache(usernamesSet);
        setCacheLoaded(true);
      } catch (err) {
        console.error('Error loading username cache:', err);
        setCacheLoaded(true); // Set loaded anyway to allow checks
      }
    };
    
    loadUsernameCache();
  }, []);

  // Handle profile pic preview
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check username availability using local cache
  useEffect(() => {
    // Don't check until cache is loaded
    if (!cacheLoaded || !username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError('');
      return;
    }
    
    // Basic validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setUsernameAvailable(false);
      return;
    }
    
    // Check against cache immediately - no need for debounce
    setIsCheckingUsername(true);
    const lowercaseUsername = username.toLowerCase();
    const isAvailable = !usernameCache.has(lowercaseUsername);
    
    setUsernameAvailable(isAvailable);
    setUsernameError(isAvailable ? '' : 'Username is already taken');
    setIsCheckingUsername(false);
    
  }, [username, cacheLoaded, usernameCache]);

  // Helper function to handle hover state
  const handleHover = (element: string, isHovered: boolean) => {
    setHoveredElements(prev => ({
      ...prev,
      [element]: isHovered
    }));
  };

  // Submit the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    
    if (!username || !usernameAvailable) {
      setError('Please choose a valid username');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert username to lowercase for storage and checks
      const lowercaseUsername = username.toLowerCase();
      
      // Check one more time to be safe (in case another user just took it)
      const usernameDoc = await getDoc(doc(db, 'usernames', lowercaseUsername));
      if (usernameDoc.exists()) {
        setError('This username was just taken. Please choose another.');
        setUsernameAvailable(false);
        setIsSubmitting(false);
        return;
      }
      
      let profilePicUrl = '';
      
      // Upload profile pic if provided
      if (profilePic) {
        const storageRef = ref(storage, `profile_pics/${auth.currentUser.uid}/avatar`);
        await uploadBytes(storageRef, profilePic);
        profilePicUrl = await getDownloadURL(storageRef);
      }
      
      // Get existing user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Use a transaction to ensure atomicity when creating username
      await runTransaction(db, async (transaction) => {
        // 1. Create entry in usernames collection
        transaction.set(doc(db, 'usernames', lowercaseUsername), {
          uid: auth.currentUser!.uid,
          createdAt: Timestamp.now()
        });
        
        // 2. Update user document with profile info
        transaction.set(doc(db, 'users', auth.currentUser!.uid), {
          ...userData,
          username: lowercaseUsername,
          displayUsername: username, // Preserve original casing for display
          bio: bio,
          profilePic: profilePicUrl,
          communityJoinDate: Timestamp.now(),
        }, { merge: true });
      });
      
      // Redirect to community
      navigate('/community');
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Error creating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.communityProfilePage}>
      <div style={styles.communityProfileContainer}>
        <h1 style={styles.profileTitle}>Create Community Profile</h1>
        
        {!cacheLoaded ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingIndicator}></div>
            <span>Loading username database...</span>
          </div>
        ) : (
          <>
            <p style={styles.profileDescription}>
              Before you can participate in the community, you need to create a unique username.
            </p>
            
            <div style={styles.profileFormContainer}>
              <form onSubmit={handleSubmit}>
                {/* Profile Picture Upload */}
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Profile Picture</label>
                  <div style={styles.profilePicSection}>
                    <div style={styles.profilePicCircle}>
                      {profilePicPreview ? (
                        <img 
                          src={profilePicPreview} 
                          alt="Profile preview" 
                          style={styles.profilePicImg}
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="profilePic"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        style={styles.hiddenInput}
                      />
                      <label 
                        htmlFor="profilePic"
                        style={{
                          ...styles.chooseImageBtn,
                          ...(hoveredElements.chooseImage ? styles.chooseImageBtnHover : {})
                        }}
                        onMouseEnter={() => handleHover('chooseImage', true)}
                        onMouseLeave={() => handleHover('chooseImage', false)}
                      >
                        Choose Image
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Username Input */}
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Username*</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      style={{
                        ...styles.formInput,
                        ...(usernameAvailable === true ? styles.inputValid : {}),
                        ...(usernameAvailable === false ? styles.inputInvalid : {}),
                        ...(focusedField === 'username' ? styles.inputFocused : {}),
                      }}
                      placeholder="Choose a unique username"
                      required
                      minLength={3}
                      maxLength={20}
                    />
                    {isCheckingUsername && (
                      <div style={{...styles.inputStatus, ...styles.statusChecking}}>
                        Checking...
                      </div>
                    )}
                    {!isCheckingUsername && usernameAvailable === true && (
                      <div style={{...styles.inputStatus, ...styles.statusAvailable}}>
                        Available
                      </div>
                    )}
                  </div>
                  {usernameError && (
                    <div style={styles.inputError}>{usernameError}</div>
                  )}
                  <div style={styles.inputHelp}>
                    Username must be 3-20 characters and can only contain letters, numbers, and underscores.
                  </div>
                </div>
                
                {/* Bio Input */}
                <div style={styles.formField}>
                  <label style={styles.formLabel}>Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...styles.formInput, 
                      ...styles.formTextarea, 
                      ...(focusedField === 'bio' ? styles.inputFocused : {})
                    }}
                    placeholder="Tell the community about yourself (optional)"
                    maxLength={300}
                  />
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !usernameAvailable}
                  style={{
                    ...styles.createProfileBtn,
                    ...(!usernameAvailable || isSubmitting ? styles.btnDisabled : {}),
                    ...(hoveredElements.submitButton && usernameAvailable && !isSubmitting ? styles.createProfileBtnHover : {})
                  }}
                  onMouseEnter={() => handleHover('submitButton', true)}
                  onMouseLeave={() => handleHover('submitButton', false)}
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                </button>
                
                {error && (
                  <div style={styles.submissionError}>{error}</div>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityProfileSetup;