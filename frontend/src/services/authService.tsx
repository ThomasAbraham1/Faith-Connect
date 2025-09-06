import axios, { AxiosError, type AxiosResponse } from "axios";
import { useNavigate } from "react-router";
import PhoneInput, { type Value } from "react-phone-number-input";
import api from "@/api/api";

interface response {
  data: Record<"isOtpValid", boolean>;
}
export const verifyOtpRequest = async (value: string): Promise<void> => {
  console.log(value.length);
  if (value.length == 6) {
    api
      .post(`/auth/verifyOtp`, {
        otpToken: value,
      })
      .then((response: response) => {
        console.log(response.data.isOtpValid);
      })
      .catch((err) => console.error(err));
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

export const handleSignupFormSubmitService = async (
  username: string,
  churchname: string,
  password: string,
  phoneInE164: string,
  email: string
): Promise<AxiosResponse<any, any>> => {
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
  };
  try {
    const response = await api.post(`/auth/signup`, payload);
    console.log("Post successful:", response.data);
    return response as AxiosResponse<any, any>;
  } catch (error: any) {
    console.error("Error posting data:", error.response.data);
    return error as AxiosResponse<any, any>;
  }
};
// OTP request method
export const selectOTPMethod = async (method: "sms" | "email") => {
  const apiURL = import.meta.env.VITE_APP_API_URL;
  try {
    const response = await api.post(`/auth/otpRequest`, { method: method });
    console.log("OTP Sent successfully:", response.data);
    return response as AxiosResponse<any, any>;
  } catch (error: any) {
    console.error("Error posting data:", error.response.data);
    // return error as AxiosResponse<any, any>;
  }
};

// Logout
export const logout = async () => {
  try {
    const result = await api.post("/auth/logout");
    console.log(result)
    return result
  } catch (error) {
    console.log(error)
    return error
  }
};

export const twofaMemoryChecker = async () => {
  return api.post("/auth/twofaMemoryCheck");
};
