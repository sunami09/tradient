// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Link } from "react-router-dom";

interface ProfileData {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  profilePic?: string;
  income?: string;
  investingCapacity?: string;
  totalAssets?: string;
}

function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

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
          setProfile(docSnap.data() as ProfileData);
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
  }, []);

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
        Loading...
      </div>
    );
  }

  // If no profile data, show fluttering button
  if (!profile) {
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
          flexDirection: "column",
          fontFamily: "sans-serif",
        }}
      >
        <button className="flutter-button">
          <Link
            to="/update-profile"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Update Your Profile
          </Link>
        </button>

        <style>
          {`
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
          `}
        </style>
      </div>
    );
  }

  // If we have profile data
  return (
    <div
      style={{
        color: "white",
        background: "#0d0d0d",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Profile Picture with Halo */}
      {profile.profilePic && (
        <div style={{ position: "relative", marginBottom: "2rem" }}>
          <div className="halo" />
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
        </div>
      )}

      {/* Typing text: "Hey {firstName}, how is it going?" */}
      <div className="typing-container">
        <span className="typing">
          Hey {profile.firstName}, how is it going?
        </span>
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
        `}
      </style>
    </div>
  );
}

export default Profile;
