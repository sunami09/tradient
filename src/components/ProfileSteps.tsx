import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Props interfaces
export interface ProfilePictureStepProps {
  onFileChange: (file: File | null) => void;
  hasFile: boolean;
}

export interface NameInputStepProps {
  profilePicUrl: string | null;
  firstName: string;
  onNameChange: (name: string) => void;
}

export interface LastNameInputStepProps {
  profilePicUrl: string | null;
  lastName: string;
  onLastNameChange: (lastName: string) => void;
}

export interface DateOfBirthStepProps {
  profilePicUrl: string | null;
  dateOfBirth: Date | null;
  onDateOfBirthChange: (date: Date | null) => void;
}

// Profile picture step
export function ProfilePictureStep({
  onFileChange,
  hasFile,
}: ProfilePictureStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setFileName(file.name);
    onFileChange(file);
  };
  const handleButtonClick = () => fileInputRef.current?.click();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: 0, animation: "fadeIn 0.5s ease-in forwards" }}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        onClick={handleButtonClick}
        className={hasFile ? "upload-button file-selected" : "upload-button"}
        style={{
          background: hasFile ? "#444" : "#333",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "6px",
          border: hasFile ? "1px solid #00ff99" : "1px solid #555",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "bold",
          transition: "all 0.3s ease",
          boxShadow: hasFile ? "0 0 15px rgba(0, 255, 153, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseOver={(e) => {
          if (!hasFile) {
            e.currentTarget.style.background = "#444";
            e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.3)";
          }
        }}
        onMouseOut={(e) => {
          if (!hasFile) {
            e.currentTarget.style.background = "#333";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.2)";
          }
        }}
      >
        {hasFile ? "Picture Captured ✓" : "Upload Profile Picture"}
      </button>
      {hasFile && fileName && (
        <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "#00ff99", opacity: 0, animation: "fadeIn 0.5s ease-in forwards" }}>
          {fileName}
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pulse { 0% { transform: scale(1) } 50% { transform: scale(1.05) } 100% { transform: scale(1) } }
        @keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-5px) } 100% { transform: translateY(0) } }
        .upload-button.file-selected { animation: pulse 1.5s infinite ease-in-out, float 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
}

// First name step
export function NameInputStep({
  profilePicUrl,
  firstName,
  onNameChange,
}: NameInputStepProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onNameChange(value);
    
    if (value.trim() === "") {
      setError("First name is required");
    } else {
      setError(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: 0, animation: "fadeIn 0.5s ease-in forwards" }}>
      {profilePicUrl && (
        <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 30px", border: "2px solid #333", boxShadow: "0 0 15px rgba(0, 255, 153, 0.3)" }}>
          <img src={profilePicUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <input
        autoFocus
        type="text"
        placeholder="First name*"
        value={firstName}
        onChange={handleChange}
        className="minimal-input"
      />
      
      {error && (
        <div style={{ color: "#ff4757", fontSize: "0.9rem", marginTop: "5px", animation: "fadeIn 0.3s ease-in forwards" }}>
          {error}
        </div>
      )}
      
      <style>{`
        .minimal-input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          width: 80%;
          margin-bottom: 20px;
          font-size: 2rem;
          caret-color: #555;
          text-align: center;
        }
        .minimal-input::placeholder {
          color: #555;
          font-size: 2rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Last name step
export function LastNameInputStep({
  profilePicUrl,
  lastName,
  onLastNameChange,
}: LastNameInputStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onLastNameChange(value);
    
    if (value.trim() === "") {
      setError("Last name is required");
    } else {
      setError(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: 0, animation: "fadeIn 0.5s ease-in forwards" }}>
      {profilePicUrl && (
        <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 30px", border: "2px solid #333", boxShadow: "0 0 15px rgba(0, 255, 153, 0.3)" }}>
          <img src={profilePicUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <input
        autoFocus
        type="text"
        placeholder="Last name*"
        value={lastName}
        onChange={handleChange}
        className="minimal-input"
      />
      
      {error && (
        <div style={{ color: "#ff4757", fontSize: "0.9rem", marginTop: "5px", animation: "fadeIn 0.3s ease-in forwards" }}>
          {error}
        </div>
      )}
      
      <style>{`
        .minimal-input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          width: 80%;
          margin-bottom: 20px;
          font-size: 2rem;
          caret-color: #555;
          text-align: center;
        }
        .minimal-input::placeholder {
          color: #555;
          font-size: 2rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

// Date of Birth step
export function DateOfBirthStep({
  profilePicUrl,
  dateOfBirth,
  onDateOfBirthChange,
}: DateOfBirthStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value) {
      const date = new Date(value);
      onDateOfBirthChange(date);
      setError(null);
    } else {
      onDateOfBirthChange(null);
      setError("Date of birth is required");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", opacity: 0, animation: "fadeIn 0.5s ease-in forwards" }}>
      {profilePicUrl && (
        <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 30px", border: "2px solid #333", boxShadow: "0 0 15px rgba(0, 255, 153, 0.3)" }}>
          <img src={profilePicUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      
      <div style={{ width: "80%", textAlign: "center", marginBottom: "30px" }}>
        <div style={{ color: "#555", fontSize: "2rem", marginBottom: "20px" }}>
          Date of Birth*
        </div>
        <input
          autoFocus
          type="date"
          value={dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : ''}
          onChange={handleChange}
          className="date-input"
          max={new Date().toISOString().split('T')[0]} // Set max date to today
        />
      </div>
      
      {error && (
        <div style={{ color: "#ff4757", fontSize: "0.9rem", marginTop: "5px", animation: "fadeIn 0.3s ease-in forwards" }}>
          {error}
        </div>
      )}
      
      <style>{`
        .date-input {
          background: #333;
          border: 1px solid #555;
          outline: none;
          color: white;
          width: 100%;
          padding: 12px;
          border-radius: 6px;
          font-size: 1.2rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        .date-input:focus {
          border-color: #00ff99;
          box-shadow: 0 0 10px rgba(0, 255, 153, 0.3);
        }
      `}</style>
    </div>
  );
}