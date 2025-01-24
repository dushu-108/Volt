"use client";

import Lookup from "@/data/Lookup";
import React, { useContext, useState, useEffect } from "react";
import { ArrowRight, Link } from "lucide-react";
import Colors from "@/data/Colors";
import { MessagesContext } from "../../../context/MessagesContext";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import SignInDialog from "./SignInDialog";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

function Hero() {
  const [userInput, setUserInput] = useState();
  const { setMessages } = useContext(MessagesContext);
  const { userDetails } = useContext(UserDetailsContext);
  const [openDialog, setOpenDialog] = useState(false);
  const CreateWorkSpace = useMutation(api.workspace.CreateWorkSpace);
  const router = useRouter();

  const onGenerate = async (input) => {
    if (!userDetails?.name) {
      setOpenDialog(true);
      return;
    }

    const msg = {
      role: "user",
      content: input,
    };

    setMessages(msg);

    const workspaceId = await CreateWorkSpace({
      messages: [msg],
      user: userDetails.uid || userDetails.sub,
    });
    console.log("Created workspace:", workspaceId);

    // Close sidebar before navigation
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('closeSidebar');
      window.dispatchEvent(event);
    }

    router.push("/workspace/" + workspaceId);
  };

  return (
    <div
      className="flex items-center justify-center w-screen h-screen"
      style={{ backgroundColor: Colors.BACKGROUND }}
    >
      <div className="flex flex-col items-center mt-36 xl:mt-40 gap-2">
        <h1 className="font-bold text-4xl">{Lookup.HERO_HEADING}</h1>
        <p className="text-gray-400 font-medium">{Lookup.HERO_DESC}</p>
        <div
          className="p-5 mt-5 border rounded-xl max-w-xl w-full"
          style={{ backgroundColor: Colors.BACKGROUND }}
        >
          <div className="flex gap-2">
            <textarea
              placeholder={Lookup.INPUT_PLACEHOLDER}
              onChange={(event) => setUserInput(event.target.value)}
              className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
            />
            {userInput && (
              <ArrowRight
                onClick={() => onGenerate(userInput)}
                className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer"
              />
            )}
          </div>
          <div>
            <Link className="h-5 w-5" />
          </div>
        </div>
        <div className="flex mt-8 flex-wrap max-w-2xl items-center justify-center gap-3">
          {Lookup?.SUGGSTIONS.map((suggestion, index) => (
            <h2
              key={index}
              className="p-1 px-2 border rounded-full text-sm text-gray-400 cursor-pointer hover:text-white"
              onClick={() => onGenerate(suggestion)}
            >
              {suggestion}
            </h2>
          ))}
        </div>
        <SignInDialog
          openDialog={openDialog}
          closeDialog={() => setOpenDialog(false)}
        />
      </div>
    </div>
  );
}

export default Hero;
