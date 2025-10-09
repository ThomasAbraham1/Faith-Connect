import axios, { AxiosError, type AxiosResponse } from "axios";
import api from "@/api/api";
import { getNavigation } from "@/api/navigationRef";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface response {
  data: Record<"isOtpValid", boolean>;
}
export const verifyOtpRequest = async (value: string): Promise<void> => {
  try {
    console.log(value.length);
    const navigate = getNavigation();
    if (value.length == 6) {
      const result = await api.post(`/auth/verifyOtp`, {
        otpToken: value,
      });
      console.log(result);
      if (navigate) {
        if (result.data.isOtpValid) navigate("/dashboard");
      }
      console.log(result.data.isOtpValid);
    }
  } catch (e) {
    console.error(e);
  }
};

interface updatedDbDocument {
  _id: string;
  churchName: string;
  userName: string;
  password: string;
  roles: string[];
  __v: string;
  refresh_token: string;
}

interface loginResponse {
  access_token: string;
  refresh_token: string;
  updated_db_document: updatedDbDocument;
}

export const handleSignupFormSubmitService = (
  username: string,
  churchname: string,
  password: string,
  phoneInE164: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  // e.preventDefault();

  // let navigate = useNavigate();
  // const { transitionTo } = useAuth();

  const phone = phoneInE164;
  const apiURL = import.meta.env.VITE_APP_API_URL;
  const payload = {
    userName: username,
    churchName: churchname,
    password: password,
    phone: phone,
    email: email,
    firstName: firstName,
    lastName: lastName
  };

  


};
// OTP request method
export const selectOTPMethod = (method: string) => {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: (data: string) => api.post(`/auth/otpRequest`, { method: data }),
    onSuccess: (data) => {
      console.log("OTP Sent successfully:", data.data);
      navigate(`/otp/${method}`)
    },
    onError: (error: any) => console.error("Error posting data:", error.response.data)
  });
  return mutation
};


// Logout
export const logout = async () => {
  try {
    const result = await api.post("/auth/logout");
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const twofaMemoryChecker = async () => {
  return api.post("/auth/twofaMemoryCheck");
};
