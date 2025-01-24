"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Colors from "@/data/Colors";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import { Download, Rocket, LogOut } from "lucide-react";
import { ActionContext } from "../../../context/ActionContext";
import { useSidebar } from "../ui/sidebar";
import { User } from "lucide-react";

function Header() {
  const { userDetails, handleLogout } = useContext(UserDetailsContext); 
  const { toggleSidebar } = useSidebar();
  const { action, setAction } = useContext(ActionContext);

  const onActionBtn = (actionType) => {
    setAction({
      actionType,
      timeStamp: Date.now(),
    });
  };

  const renderUserAvatar = () => {
    if (!userDetails?.name) {
      return <User className="w-8 h-8 text-gray-500" />;
    }

    if (userDetails?.picture) {
      return (
        <div className="flex items-center gap-2">
          <Image 
            src={userDetails.picture} 
            alt="Profile" 
            width={40} 
            height={40} 
            className="rounded-full cursor-pointer"
            onClick={toggleSidebar}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-[40px] h-[40px] rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
          onClick={toggleSidebar}
        >
          <User className="w-6 h-6 text-gray-500" />
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 flex justify-between items-center">
      {/* Logo with default values */}
      <Image 
        src={"/pngwing.com.png"}
        alt="Logo" 
        width={40} 
        height={40} 
        priority
      />
      <div className="flex gap-5 items-center">
        <Button variant="ghost" onClick={() => onActionBtn('download')}>
          <Download /> Download
        </Button>
        <Button
          onClick={() => onActionBtn('deploy')}
          className="text-white"
          style={{ backgroundColor: Colors.BLUE }}
        >
          <Rocket /> Deploy
        </Button>
        {renderUserAvatar()}
      </div>
    </div>
  );
}

export default Header;
