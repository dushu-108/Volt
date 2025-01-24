import React, { useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lookup from "@/data/Lookup";
import { Button } from "../ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import axios from "axios";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

function SignInDialog({ openDialog, closeDialog }) {
  const { setUserDetails } = useContext(UserDetailsContext);
  const CreateUser = useMutation(api.user.CreateUser);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Google Token Response:", tokenResponse);

        // Get user info
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { 
            headers: { 
              Authorization: `Bearer ${tokenResponse.access_token}` 
            } 
          }
        );

        const user = userInfo.data;
        console.log("User Info:", user);

        // Create or update user in database
        const userId = await CreateUser({
          name: user.name,
          email: user.email,
          picture: user.picture,
          uid: user.sub
        });

        // Store user data in localStorage for persistence
        const userData = {
          id: userId, // Convex user ID
          name: user.name,
          email: user.email,
          picture: user.picture,
          accessToken: tokenResponse.access_token,
          sub: user.sub // Keep Google sub for reference
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        setUserDetails(userData);
        console.log("User logged in successfully");

        closeDialog(false);
      } catch (error) {
        console.error("Error during login process:", error);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
    scope: "openid profile email",
  });

  return (
    <Dialog open={openDialog} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            <span className="block font-bold text-2xl text-center text-white">
              {Lookup.SIGNIN_HEADING}
            </span>
            <span className="block mt-2 text-center text-muted-foreground">
              {Lookup.SIGNIN_SUBHEADING}
            </span>

            <span className="flex justify-center mt-3">
              <Button
                className="bg-blue-500 hover:bg-blue-400 text-white"
                onClick={() => googleLogin()}
              >
                Sign In with Google
              </Button>
            </span>

            <span className="block mt-2 text-center text-muted-foreground">
              {Lookup.SIGNIn_AGREEMENT_TEXT}
            </span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default SignInDialog;
