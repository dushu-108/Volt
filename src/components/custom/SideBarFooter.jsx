"use client";

import { HelpCircle, LogOut, Settings } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation"; 
import { useContext } from "react";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import Cookies from "js-cookie";

function SideBarFooter() {
  const router = useRouter(); 
  const { setUserDetails } = useContext(UserDetailsContext); 

  const handleLogout = () => {
     Cookies.remove("authToken"); 
     setUserDetails(null); 
     console.log("User logged out.");
     router.push("/"); 
   };

  const options = [
    {
      name: "Settings",
      icon: Settings,
      action: null, 
    },
    {
      name: "Help Center",
      icon: HelpCircle,
      action: null, 
    },
    {
      name: "Sign Out",
      icon: LogOut,
      action: handleLogout, 
    },
  ];

  return (
    <div>
      {options.map((option, index) => (
        <Button
          variant="ghost"
          className="w-full flex justify-start"
          key={index}
          onClick={option.action} 
        >
          <option.icon className="mr-2" />
          {option.name}
        </Button>
      ))}
    </div>
  );
}

export default SideBarFooter;

