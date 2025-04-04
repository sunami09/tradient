import { useState, useEffect, ReactNode } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export type OnboardingStep = {
  message: string;
  rightPaneContent: ReactNode;
  onNext?: (data?: any) => Promise<void> | void;
};

export interface OnboardingFlowProps {
  steps: OnboardingStep[];
  initialStep?: number;
  lottieUrl?: string;
  onComplete?: () => void;
  hasSelectedFile?: boolean;
}

export function OnboardingFlow({
  steps,
  initialStep = 0,
  lottieUrl = "https://lottie.host/f01e22fb-afdc-4931-b18c-9e2d77ee7a62/WiOUlj3C7l.lottie",
  onComplete,
  hasSelectedFile = false,
}: OnboardingFlowProps) {
  const [animationPhase, setAnimationPhase] = useState<
    "initial" | "growing" | "typing" | "content"
  >("initial");
  const [displayedText, setDisplayedText] = useState("");
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // Start growing animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase("growing");
      const typingTimer = setTimeout(() => {
        setAnimationPhase("typing");
      }, 2500);
      return () => clearTimeout(typingTimer);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset animation state when changing steps
  useEffect(() => {
    if (currentStep < steps.length && currentStep > 0) {
      setAnimationPhase("typing");
      setDisplayedText("");
    }
  }, [currentStep, steps.length]);

  // Text typing animation
  useEffect(() => {
    if (animationPhase === "typing" && currentStep < steps.length) {
      const message = steps[currentStep].message;
      let idx = 0;
      const typeNext = () => {
        if (idx < message.length) {
          setDisplayedText(message.substring(0, idx + 1));
          idx++;
          setTimeout(typeNext, 40);
        } else {
          setTimeout(() => setAnimationPhase("content"), 300);
        }
      };
      typeNext();
    }
  }, [animationPhase, currentStep, steps]);

  // Updated handleNext that always calls onNext if provided
  const handleNext = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (steps[currentStep].onNext) {
        await steps[currentStep].onNext();
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Error processing step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldAnimateButton = currentStep === 0 && hasSelectedFile;

  return (
    <div
      style={{
        display: "flex",
        height: "97vh",
        overflow: "hidden",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Left Pane */}
      <div
        style={{
          flex: 1,
          background: "#000",
          position: "relative",
          padding: "2rem",
          fontSize: "1.6rem",
          lineHeight: "1.8",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              height: "85vh",
              position: "relative",
            }}
          >
            <div
              className={
                animationPhase === "initial"
                  ? "lottie-initial"
                  : animationPhase === "growing"
                  ? "lottie-growing"
                  : "lottie-final"
              }
              style={{
                position: "absolute",
                top: "12%",
                left: "50%",
                transform: "translate(-50%, 0) scale(0.2)",
                width: "85%",
                zIndex: 1,
              }}
            >
              <DotLottieReact src={lottieUrl} loop autoplay style={{ width: "100%" }} />
            </div>
            <div
              style={{
                position: "absolute",
                top: "55%",
                width: "100%",
                minHeight: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  visibility: "hidden",
                  position: "absolute",
                  maxWidth: "80%",
                  fontSize: "35px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {currentStep < steps.length ? steps[currentStep].message : ""}
              </p>
              <p
                className="typing-text"
                style={{
                  maxWidth: "80%",
                  wordBreak: "break-word",
                  opacity: 0,
                  fontSize: "35px",
                  lineHeight: "1.4",
                  textAlign: "center",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {displayedText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div
        style={{
          flex: 1,
          background: "#121212",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {animationPhase === "content" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "2rem",
            }}
          >
            {currentStep < steps.length && steps[currentStep].rightPaneContent}
            <button
              className={shouldAnimateButton ? "next-button animated" : "next-button"}
              style={{
                position: "absolute",
                bottom: "6rem",
                right: "4rem",
                background: "#00ff99",
                color: "black",
                fontWeight: "bold",
                border: "none",
                padding: "0.7rem 1.5rem",
                borderRadius: "999px",
                cursor: isLoading ? "wait" : "pointer",
                opacity: 0,
                animation: "fadeIn 0.5s ease-in 0.3s forwards",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "7vw",
                minHeight: "5vh",
                fontSize: "20px",
                transition: "all 0.3s ease",
              }}
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : "Next"}
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes growAnimation {
            0% { 
              transform: translate(-50%, 0) scale(0.2);
              opacity: 0.2;
            }
            40% {
              opacity: 0.7;
            }
            100% { 
              transform: translate(-50%, 0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
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
          
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.1); }
            40% { transform: scale(1); }
            60% { transform: scale(1.1); }
          }
          
          .lottie-initial {
            transform: translate(-50%, 0) scale(0.2);
            opacity: 0.2;
          }
          
          .lottie-growing {
            animation: growAnimation 2s cubic-bezier(0.33, 1, 0.68, 1) forwards;
          }
          
          .lottie-final {
            transform: translate(-50%, 0) scale(1) !important;
            opacity: 1;
          }
          
          .typing-text {
            animation: fadeIn 1s ease-in forwards;
            font-size: 35px !important;
            min-height: 1.4em;
          }
          
          .typing-text span, 
          .typing-text * {
            font-size: 35px !important;
          }
          
          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            border-top-color: #000;
            animation: rotate 0.8s linear infinite;
          }
          
          .next-button.animated {
            animation: fadeIn 0.5s ease-in forwards, flutter 5s ease-in-out infinite;
            box-shadow: 0 0 15px rgba(0, 255, 153, 0.5);
          }
        `}
      </style>
    </div>
  );
}
