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
import { ToasterProvider } from "./providers/ToasterProvider.tsx";
import { ContextProvider } from './context/Context.tsx'
import React from "react";

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
        path: "Signup",
        element: <SignupForm />,
      },
      {
        path: "monkey",
        element: <SignupForm />,
      },
      {
        path: "otp/:otpMethod",
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
          {
            path: appRoutes.attendance.label,
            element: appRoutes.attendance.element,
          },
          {
            path: appRoutes.settings.label,
            element: appRoutes.settings.element,
          },
          {
            path: appRoutes.calendar.label,
            element: appRoutes.calendar.element,
          },
          {
            path: appRoutes.events.label,
            element: appRoutes.events.element,
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
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ContextProvider>
      <ThemeProvider>
        <ToasterProvider>
          <RouterProvider router={router} />
        </ToasterProvider>
      </ThemeProvider>
    </ContextProvider>
  </QueryClientProvider>
  // </React.StrictMode>
);
