"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Header from "@/components/custom/Header";
import { MessagesContext } from "../../context/MessagesContext";
import { UserDetailsContext } from "../../context/UserDetailsContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useConvex } from "convex/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/custom/AppSideBar";
import { ActionContext } from "../../context/ActionContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Provider({ children }) {
  const [messages, setMessages] = useState();
  const [userDetails, setUserDetails] = useState(null);
  const [action, setAction] = useState();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    restoreUserDetails();
  }, []);

  const restoreUserDetails = async () => {
    try {
      const storedData = localStorage.getItem('userData');
      if (!storedData) {
        setLoading(false);
        return;
      }

      const userData = JSON.parse(storedData);
      
      if (!userData.accessToken) {
        handleLogout();
        return;
      }

      try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${userData.accessToken}` }
        });
        
        if (response.status === 200) {
          setUserDetails(userData);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        handleLogout();
      }
    } catch (error) {
      console.error("Error restoring user details:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserDetails(null);
    router.push("/");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <UserDetailsContext.Provider value={{ userDetails, setUserDetails, handleLogout }}>
          <MessagesContext.Provider value={{ messages, setMessages }}>
            <ActionContext.Provider value={{ action, setAction }}>
              <NextThemesProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <SidebarProvider defaultOpen={false} className="flex flex-col">
                  <Header />
                  {userDetails && (
                    <div className="absolute">
                      <AppSideBar />
                    </div>
                  )}
                  {children}
                </SidebarProvider>
              </NextThemesProvider>
            </ActionContext.Provider>
          </MessagesContext.Provider>
        </UserDetailsContext.Provider>
      </GoogleOAuthProvider>
    </div>
  );
}
