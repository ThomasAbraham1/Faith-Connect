import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

import { setNavigation } from "./api/navigationRef";
import { useNavigate } from "react-router";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    // setTimeout(() => {
    //   const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)') 
    //   const root = window.document.documentElement
    //   root.classList.remove('dark', 'light','darkk') 
    //   // root.classList.add('light')
    //   console.log(root.classList)

    // }, 1000); 
    setNavigation(navigate), [navigate];
  });
  return (
    <>
      {/* Color theme toggler */}
      <div className="fixed top-4 right-4 z-[9999] print:hidden">
        <ModeToggle />
      </div>
      <Outlet></Outlet>
    </>
  );
}

export default App;
