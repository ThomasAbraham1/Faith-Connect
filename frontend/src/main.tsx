// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { LoginForm } from "./components/login-form.tsx";
import { SignupForm } from "./components/signup-form.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

let router = createBrowserRouter([
  {
    path: "/",
    Component: LoginForm,
    // loader: loadRootData,
  },
  {
    path: "/signup",
    Component: SignupForm,
    // loader: loadRootData,
  },
]);
createRoot(document.getElementById("root")!).render(
  <>
    <AuthProvider>
      <RouterProvider router={router} />
      <App />
    </AuthProvider>
  </>
);
