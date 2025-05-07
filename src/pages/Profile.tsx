// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface ProfileData {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  profilePic?: string;
  dateOfBirth?: any; // Using any to handle Firestore timestamp
  lastUpdated?: any; // Using any to handle Firestore timestamp
  // Community profile fields
  username?: string;
  displayUsername?: string;
  bio?: string;
  communityJoinDate?: any; // Using any to handle Firestore timestamp
}

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [hasCommunityProfile, setHasCommunityProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        const userUid = auth.currentUser.uid;
        const docRef = doc(db, "users", userUid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as ProfileData;
          setProfile(userData);
          
          // Check if user has a firstName, if not redirect to update profile
          if (!userData.firstName || userData.firstName.trim() === "") {
            navigate("/update-profile");
          }
          
          // Check if user has community profile data
          setHasCommunityProfile(!!(userData.username && userData.displayUsername));
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Helper function to safely format Firebase timestamp or string date
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "Not provided";
    
    try {
      // Check if it's a Firebase Timestamp (has seconds and nanoseconds)
      if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
        // Convert Firebase timestamp to JS Date
        const date = new Date(dateValue.seconds * 1000);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } 
      // Regular string date
      else if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      // For other cases like already processed Date objects
      else if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Fallback
      return String(dateValue);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  // Loading State
  if (loading) {
    return (
      <div
        style={{
          padding: "1rem",
          color: "white",
          background: "#0d0d0d",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If no profile data, show fluttering button
// No profile section in Profile.tsx
// If no profile data, show enhanced fluttering button with animation
if (!profile) {
  return (
    <div
      style={{
        padding: "2rem",
        color: "white",
        background: "#0d0d0d",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
        backgroundImage: "radial-gradient(circle at center, rgba(0, 255, 153, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
      }}
    >
      {/* Animated Icon */}
      <div style={{ 
        position: "relative", 
        width: 120, 
        height: 120, 
        marginBottom: "2rem",
        animation: "float 6s ease-in-out infinite"
      }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "150px",
          height: "150px",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: "2px solid rgba(0, 255, 153, 0.3)",
          boxShadow: "0 0 30px rgba(0, 255, 153, 0.2)",
          animation: "pulse 3s infinite"
        }} />
        
        <div style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#1a1a1a",
          border: "2px solid #333",
          boxShadow: "0 0 20px rgba(0, 255, 153, 0.4)",
          zIndex: 1,
          position: "relative"
        }}>
          <DotLottieReact 
            src="https://lottie.host/05653f91-2f08-4552-91c9-899633608186/zQ7ugLVcHo.lottie" 
            loop 
            autoplay 
            style={{ width: "180%", height: "180%" }} 
          />
        </div>
      </div>
      
      {/* Welcome Message */}
      <h1 style={{ 
        color: "#00ff99", 
        marginBottom: "1.5rem", 
        textAlign: "center",
        fontSize: "2rem",
        textShadow: "0 0 10px rgba(0, 255, 153, 0.5)"
      }}>
        Welcome!
      </h1>
      
      <p style={{ 
        color: "#aaa", 
        marginBottom: "2.5rem", 
        textAlign: "center",
        maxWidth: "500px",
        lineHeight: "1.6"
      }}>
        Let's get started by setting up your profile. This will help us personalize your experience.
      </p>
      
      <Link
        to="/update-profile"
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "inline-block",
        }}
      >
        <button className="flutter-button" style={{ 
          width: "auto",
          minWidth: "220px",
          padding: "1rem 2.5rem",
          background: "#00ff99",
          color: "black",
          fontWeight: "bold",
          border: "none",
          borderRadius: "999px",
          cursor: "pointer",
          fontSize: "1.2rem",
          boxShadow: "0 0 20px rgba(0, 255, 153, 0.5)",
        }}>
          Create Your Profile
        </button>
      </Link>
      
      <style>{`
        @keyframes flutter {
          0%, 100% { transform: scale(1) translateY(0); }
          10% { transform: scale(1.02) translateY(-2px) rotate(1deg); }
          20% { transform: scale(1.04) translateY(-4px) rotate(-1deg); }
          30% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
          40% { transform: scale(1.02) translateY(-2px) rotate(-1deg); }
          50% { transform: scale(1.01) translateY(-1px); }
          60% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
          70% { transform: scale(1.04) translateY(-4px) rotate(-1deg); }
          80% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
          90% { transform: scale(1.02) translateY(-2px) rotate(-1deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
        }
        
        .flutter-button {
          animation: flutter 3s ease-in-out infinite;
          transition: all 0.3s ease;
        }
        
        .flutter-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 0 30px rgba(0, 255, 153, 0.7);
        }
      `}</style>
    </div>
  );
}

  // If we have profile data
  return (
    <div
      style={{
        color: "white",
        background: "#0d0d0d",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        alignItems: "center",
        padding: "2rem 1rem",
        position: "relative",
        marginTop: "5vh"
      }}
    >
      {/* Profile Picture with Halo */}
      <div style={{ position: "relative", marginBottom: "2rem" }}>
        <div className="halo" />
        {profile.profilePic ? (
          <img
            src={profile.profilePic}
            alt="Profile"
            style={{
              width: 150,
              height: 150,
              objectFit: "cover",
              borderRadius: "50%",
              zIndex: 1,
              position: "relative",
              border: "2px solid #333",
            }}
          />
        ) : (
          <div style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            zIndex: 1,
            position: "relative",
            overflow: "hidden",
            border: "2px solid #333",
            background: "#1a1a1a",
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <DotLottieReact 
                src="https://lottie.host/05653f91-2f08-4552-91c9-899633608186/zQ7ugLVcHo.lottie" 
                loop 
                autoplay 
                style={{ width: "180%", height: "180%" }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Typing text: "Hey {firstName}, how is it going?" */}
      <div className="typing-container" style={{ marginBottom: "2rem" }}>
        <span className="typing">
          Hey {profile.firstName}, how is it going?
        </span>
      </div>

      {/* Cards Container */}
      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        width: "100%", 
        maxWidth: "1200px", 
        gap: "2rem",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        {/* Community Profile Card */}
        <div className="profile-card community-card">
          <h2 style={{ color: "#00ff99", marginBottom: "1.5rem", textAlign: "center" }}>
            Community Profile
          </h2>
          
          {hasCommunityProfile ? (
            <>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
                {profile.profilePic ? (
                  <img 
                    src={profile.profilePic} 
                    alt="Community Profile" 
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      marginRight: "1rem",
                      border: "2px solid #333"
                    }}
                  />
                ) : (
                  <div style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    marginRight: "1rem",
                    overflow: "hidden",
                    border: "2px solid #333",
                    background: "#1a1a1a",
                  }}>
                    <div style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}>
                      <DotLottieReact 
                        src="https://lottie.host/05653f91-2f08-4552-91c9-899633608186/zQ7ugLVcHo.lottie" 
                        loop 
                        autoplay 
                        style={{ width: "180%", height: "180%" }} 
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>
                    @{profile.displayUsername || "username"}
                  </h3>
                  <p style={{ margin: 0, color: "#888" }}>
                    {profile.bio || "No bio yet"}
                  </p>
                </div>
              </div>
              
              <div style={{ borderTop: "1px solid #333", paddingTop: "1rem" }}>
                <div className="profile-info-row">
                  <span style={{ color: "#888" }}>Username:</span>
                  <span>{profile.username || "Not available"}</span>
                </div>
                <div className="profile-info-row">
                  <span style={{ color: "#888" }}>Display Name:</span>
                  <span>{profile.displayUsername || "Not available"}</span>
                </div>
                <div className="profile-info-row">
                  <span style={{ color: "#888" }}>Joined:</span>
                  <span>{profile.communityJoinDate ? formatDate(profile.communityJoinDate) : "Not available"}</span>
                </div>
                <div className="profile-info-row">
                  <span style={{ color: "#888" }}>Last Updated:</span>
                  <span>{profile.lastUpdated ? formatDate(profile.lastUpdated) : "Not available"}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              padding: "2rem 0"
            }}>
              <p style={{ 
                color: "#888", 
                textAlign: "center", 
                marginBottom: "1.5rem"
              }}>
                You don't have a community profile yet. Join the community to connect with others!
              </p>
              
              <button 
                className="community-button"
                style={{
                  background: "#333",
                  color: "white",
                  border: "1px solid #00ff99",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  boxShadow: "0 0 10px rgba(0, 255, 153, 0.3)",
                }}
                onClick={() => navigate("/community")}
              >
                Create Community Profile
              </button>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="profile-card user-card">
          <h2 style={{ color: "#00ff99", marginBottom: "1.5rem", textAlign: "center" }}>
            Personal Information
          </h2>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: "1.5rem" 
          }}>
            {profile.profilePic ? (
              <img 
                src={profile.profilePic} 
                alt="Personal Profile" 
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "2px solid #333",
                  boxShadow: "0 0 10px rgba(0, 255, 153, 0.3)"
                }}
              />
            ) : (
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #333",
                background: "#1a1a1a",
                boxShadow: "0 0 10px rgba(0, 255, 153, 0.3)"
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <DotLottieReact 
                    src="https://lottie.host/05653f91-2f08-4552-91c9-899633608186/zQ7ugLVcHo.lottie" 
                    loop 
                    autoplay 
                    style={{ width: "180%", height: "180%" }} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <div style={{ borderTop: "1px solid #333", paddingTop: "1rem" }}>
            <div className="profile-info-row">
              <span style={{ color: "#888" }}>First Name:</span>
              <span>{profile.firstName || "Not provided"}</span>
            </div>
            
            <div className="profile-info-row">
              <span style={{ color: "#888" }}>Last Name:</span>
              <span>{profile.lastName || "Not provided"}</span>
            </div>
            
            <div className="profile-info-row">
              <span style={{ color: "#888" }}>Date of Birth:</span>
              <span>{formatDate(profile.dateOfBirth)}</span>
            </div>
          </div>
          
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
            <Link
              to="/update-profile"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "inline-block",
              }}
            >
              <button 
                style={{
                  background: "#333",
                  color: "white",
                  border: "1px solid #555",
                  padding: "0.7rem 1.5rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#444";
                  e.currentTarget.style.borderColor = "#00ff99";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#333";
                  e.currentTarget.style.borderColor = "#555";
                }}
              >
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style>
        {`
          /* Halo animation */
          .halo {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 180px;
            height: 180px;
            transform: translate(-50%, -50%);
            border: 3px solid #00ff99;
            border-radius: 50%;
            animation: haloPulse 2.5s infinite;
            z-index: 0;
          }
          @keyframes haloPulse {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.6;
            }
          }

          /* Container for typed text (centered) */
          .typing-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 1rem;
          }

          /* Typing animation */
          .typing {
            font-size: 1.4rem;
            color: #00ff99;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            border-right: 2px solid #00ff99;
            box-sizing: border-box;
            animation: typing 3s steps(40, end) forwards, blink 0.8s step-end infinite;
          }
          @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
          }
          @keyframes blink {
            0%, 100% { border-color: #00ff99; }
            50% { border-color: transparent; }
          }
          
          /* Flutter button animation */
          @keyframes flutter {
            0%, 100% { transform: scale(1) translateY(0); }
            10% { transform: scale(1.02) translateY(-2px) rotate(1deg); }
            20% { transform: scale(1.04) translateY(-4px) rotate(-1deg); }
            30% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
            40% { transform: scale(1.02) translateY(-2px) rotate(-1deg); }
            50% { transform: scale(1.01) translateY(-1px); }
            60% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
            70% { transform: scale(1.04) translateY(-4px) rotate(-1deg); }
            80% { transform: scale(1.03) translateY(-3px) rotate(1deg); }
            90% { transform: scale(1.02) translateY(-2px) rotate(-1deg); }
          }
          .flutter-button {
            background: #00ff99;
            color: black;
            font-weight: bold;
            border: none;
            padding: 1rem 2rem;
            border-radius: 999px;
            cursor: pointer;
            font-size: 1.2rem;
            animation: flutter 3s ease-in-out infinite;
            box-shadow: 0 0 15px rgba(0, 255, 153, 0.5);
          }
          
          /* Community button */
          .community-button {
            animation: pulse 2s ease-in-out infinite;
          }
          .community-button:hover {
            background: #444 !important;
            box-shadow: 0 0 20px rgba(0, 255, 153, 0.7) !important;
            transform: translateY(-2px);
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 255, 153, 0.7); }
          }
          
          /* Loading spinner */
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 255, 153, 0.3);
            border-radius: 50%;
            border-top-color: #00ff99;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Profile cards */
          .profile-card {
            background: rgba(20, 20, 20, 0.8);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(10px);
            flex: 1;
            min-width: 300px;
            max-width: 500px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeInUp 0.5s ease-out forwards;
            opacity: 0;
          }
          .profile-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
          }
          .community-card {
            border: 1px solid #333;
            animation-delay: 0.1s;
          }
          .user-card {
            border: 1px solid #333;
            animation-delay: 0.3s;
          }
          
          /* Fade in animation for cards */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* Profile info rows */
          .profile-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.8rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid #333;
          }
          .profile-info-row:last-child {
            border-bottom: none;
          }
        `}
      </style>
    </div>
  );
}

export default Profile;