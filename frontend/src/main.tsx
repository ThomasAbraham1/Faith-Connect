import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { LoginForm } from "./app/auth/login-form.tsx";
import { SignupForm } from "./app/auth/signup-form.tsx";
import { InputOTPControlled } from "./app/auth/otpPage.tsx";
import { OTPMethodSelection } from "./app/auth/otpMethodSelectionPage.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import FillerPage from "./app/dashboard/FillerPage.tsx";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { appRoutes } from "./routes.tsx";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // 👈 App is the parent layout
    children: [
      {
        index: true, // 👈 this means `/`
        element: <LoginForm />,
      },
      {
        path: "signup",
        element: <SignupForm />,
      },
      {
        path: "otp",
        element: <InputOTPControlled />,
      },
      {
        path: "otpMethod",
        element: <OTPMethodSelection />,
      },
      {
        path: "dashboard",
        element: <AppLayout />,
        // hydrateFallbackElement: <AppLayout />,
        children: [
          {
            index: true,
            element: <FillerPage />,
          },
          {
            path: appRoutes.members.label,
            element: appRoutes.members.element,
          },
        ],
      },
    ],
  },
]);

// queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ThemeProvider>
);
