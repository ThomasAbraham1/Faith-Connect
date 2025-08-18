import axios, { AxiosError, type AxiosResponse } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import PhoneInput, { type Value } from "react-phone-number-input";

interface response {
  data: Record<"isOtpValid", boolean>;
}
export const verifyOtpRequest = async (value: string): Promise<void> => {
  console.log(value.length);
  if (value.length == 6) {
    axios
      .post(
        `${import.meta.env.VITE_APP_API_URL}/auth/verifyOtp`,
        {
          otpToken: value,
        },
        {
          withCredentials: true,
        }
      )
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
    const response = await axios.post(`${apiURL}/auth/signup`, payload, {
      withCredentials: true,
    });
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
    await fetch(`${apiURL}/auth/otpRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
      credentials: "include",
    });
  } catch (error) {
    console.error("Failed to select OTP method:", error);
  }
};
