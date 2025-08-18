import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

// Define authentication stages as a union type
type AuthStage = "initial" | "awaitingOTPSelectMethod" | "awaitingOTP" | "authenticated";


interface AuthContextType {
  loginToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  submitLoginForm: () => void;
  isAwaitingOTP: () => boolean; // Helper to check if in OTP stage
  isAwaitingOTPSelectMethod: () => boolean;
  transitionTo: (stage: AuthStage) => void;
  setAuthStage: Dispatch<SetStateAction<AuthStage>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loginToken, setLoginToken] = useState<string | null>(null);
  const [authStage, setAuthStage] = useState<AuthStage>("initial");




  const transitionTo = (stage: AuthStage) => {
  const validTransitions: Record<AuthStage, AuthStage[]> = {
    initial: ["awaitingOTPSelectMethod"],
    awaitingOTPSelectMethod: ["awaitingOTP"],
    awaitingOTP: ["authenticated"],
    authenticated: ["initial"], // logout
  };

  console.log(authStage)
  if (validTransitions[authStage]?.includes(stage)) {
    setAuthStage(stage);
  } else {
    console.warn(`Invalid transition from ${authStage} to ${stage}`);
  }
};

  // Action to handle login form submission (moves to OTP stage)
  const submitLoginForm = () => {
    setAuthStage("awaitingOTPSelectMethod");
  };



  const login = (token: string) => {
    setLoginToken(token);
    setAuthStage("authenticated");
  };

  const logout = () => {
    setLoginToken(null);
    setAuthStage("initial");
  };

  // Check if user is fully authenticated
  const isAuthenticated = () => !!loginToken && authStage === "authenticated";

  // Check if user is in OTP verification stage
  const isAwaitingOTP = () => authStage === "awaitingOTP";

  // Check if user is in OTP method selection stage
  const isAwaitingOTPSelectMethod = () => authStage === "awaitingOTPSelectMethod";

  return (
    <AuthContext.Provider
      value={{
        loginToken,
        login,
        logout,
        isAuthenticated,
        isAwaitingOTP,
        submitLoginForm,
        isAwaitingOTPSelectMethod,
        transitionTo,
        setAuthStage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
