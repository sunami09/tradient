import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow, OnboardingStep } from "../components/OnboardingFlow";
import {
  ProfilePictureStep,
  NameInputStep,
  LastNameInputStep,
  DateOfBirthStep
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
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  
  // Validation states
  const [isFirstNameValid, setIsFirstNameValid] = useState(false);
  const [isLastNameValid, setIsLastNameValid] = useState(false);
  const [isDateOfBirthValid, setIsDateOfBirthValid] = useState(false);

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    setProfilePicFile(file);
  };

  // Handle first name input
  const handleNameChange = (name: string) => {
    setFirstName(name);
    setIsFirstNameValid(name.trim().length > 0);
  };

  // Handle last name input
  const handleLastNameChange = (name: string) => {
    setLastName(name);
    setIsLastNameValid(name.trim().length > 0);
  };
  
  // Handle date of birth input
  const handleDateOfBirthChange = (date: Date | null) => {
    setDateOfBirth(date);
    setIsDateOfBirthValid(!!date);
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
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
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
      isNextDisabled: false,
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
      isNextDisabled: !isFirstNameValid,
    },
    {
      message: "What is your last name?",
      rightPaneContent: (
        <LastNameInputStep
          profilePicUrl={profilePicUrl}
          lastName={lastName}
          onLastNameChange={handleLastNameChange}
        />
      ),
      onNext: async () => {},
      isNextDisabled: !isLastNameValid,
    },
    {
      message: "When were you born?",
      rightPaneContent: (
        <DateOfBirthStep
          profilePicUrl={profilePicUrl}
          dateOfBirth={dateOfBirth}
          onDateOfBirthChange={handleDateOfBirthChange}
        />
      ),
      onNext: async () => {
        await saveProfileData();
      },
      isNextDisabled: !isDateOfBirthValid,
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