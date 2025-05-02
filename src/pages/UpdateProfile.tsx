import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow, OnboardingStep } from "../components/OnboardingFlow";
import {
  ProfilePictureStep,
  NameInputStep,
  LastNameInputStep,
} from "../components/ProfileSteps";
import { auth, db, storage } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function UpdateProfilePage() {
  const navigate = useNavigate();
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    setProfilePicFile(file);
  };

  // Handle first name input
  const handleNameChange = (name: string) => {
    setFirstName(name);
  };

  // Handle last name input
  const handleLastNameChange = (name: string) => {
    setLastName(name);
  };

  // Upload profile picture to Firebase Storage
  const uploadProfilePicture = async (): Promise<string> => {
    if (!auth.currentUser || !profilePicFile) {
      return "";
    }
    const userUid = auth.currentUser.uid;
    const storageRef = ref(storage, `profile-pictures/${userUid}`);
    try {
      await uploadBytes(storageRef, profilePicFile);
      const downloadUrl = await getDownloadURL(storageRef);
      setProfilePicUrl(downloadUrl);
      return downloadUrl;
    } catch (err) {
      console.error("Image upload failed", err);
      throw err;
    }
  };

  // Save profile data to Firestore
  const saveProfileData = async () => {
    if (!auth.currentUser) {
      alert("No user logged in!");
      return;
    }
    const userUid = auth.currentUser.uid;
    const docRef = doc(db, "users", userUid);
    try {
      await setDoc(
        docRef,
        {
          firstName,
          lastName,
          profilePic: profilePicUrl,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      message: "Let's start with how you'd like to present yourself.",
      rightPaneContent: (
        <ProfilePictureStep
          onFileChange={handleFileChange}
          hasFile={!!profilePicFile}
        />
      ),
      onNext: async () => {
        const url = await uploadProfilePicture();
        setProfilePicUrl(url);
      },
    },
    {
      message: "So, what should we call you?",
      rightPaneContent: (
        <NameInputStep
          profilePicUrl={profilePicUrl}
          firstName={firstName}
          onNameChange={handleNameChange}
        />
      ),
      onNext: async () => {},
    },
    {
      message: "What is your last name?",
      rightPaneContent: (
        <LastNameInputStep
          profilePicUrl={profilePicUrl}
          onLastNameChange={handleLastNameChange}
        />
      ),
      onNext: async () => {
        await saveProfileData();
      },
    },
  ];

  // After all steps
  const handleComplete = () => {
    navigate("/profile");
  };

  return (
    <OnboardingFlow
      steps={steps}
      onComplete={handleComplete}
      hasSelectedFile={!!profilePicFile}
    />
  );
}

export default UpdateProfilePage;
