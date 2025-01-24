"use client";

import { useConvex, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { MessagesContext } from "../../../context/MessagesContext";
import Colors from "@/data/Colors";
import Image from "next/image";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import { ArrowRight, Loader2Icon } from "lucide-react";
import Lookup from "@/data/Lookup";
import Prompt from "@/data/Prompt";
import axios from "axios";
import { useSidebar } from "../ui/sidebar";

function ChatView() {
  const { id } = useParams();
  const convex = useConvex();
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetails } = useContext(UserDetailsContext); // Includes user info
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const UpdateMessages = useMutation(api.workspace.UpdateMessages);
  const {toggleSidebar} = useSidebar();

  useEffect(() => {
    if (id) {
      getWorkSpaceData();
    }
  }, [id]);

  const getWorkSpaceData = async () => {
    const result = await convex.query(api.workspace.GetWorkSpace, {
      workspaceId: id,
    });
    console.log("Workspace Data:", result);
    setMessages(Array.isArray(result?.messages) ? result.messages : []);
  };

  useEffect(() => {
    if (messages?.length > 0) {
      const role = messages[messages?.length - 1].role;
      if (role === "user") {
        getAiResponse();
      }
    }
  }, [messages]);

  const getAiResponse = async () => {
      setLoading(true);
      const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
      const result = await axios.post("/api/ai-chat", {
        prompt: PROMPT,
      });

      if (!result.data || !result.data.result) {
        throw new Error("Invalid AI response format");
      }

      const newMessage = {
        role: "ai",
        content: result.data.result
      };

      setMessages(prev => [...prev, newMessage]);
      await UpdateMessages({
        workspaceId: id,
        messages: [...messages, newMessage]
      })

  //     // Update messages in the workspace if we have an ID
  //     if (id) {
  //       await UpdateMessages({
  //         workspaceId: id,
  //         messages: [...messages, newMessage]
  //       });
  //     }
  //   } catch (error) {
  //     console.error("AI Response Error:", error);
  //     const errorMessage = {
  //       role: "system",
  //       content: error.response?.data?.error || error.message || "An error occurred while getting the AI response"
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //   } finally {
       setLoading(false);
  //   }
   };

  const onGenerate = (input) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
      },
    ]);
    setUserInput("");
  };

  const safeMessages = Array.isArray(messages) ? messages : [];
  return (
    <div className="relative h-[85vh] flex flex-col">
      <div className="flex-1 overflow-y-scroll scrollbar-hide">
        {safeMessages.map((msg, index) => (
          <div
            key={index}
            className="p-3 rounded-lg mb-2 flex gap-2 items-center"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            {msg?.role === "user" && (
              <Image
                src={userDetails?.picture}
                alt="userImage"
                width={35}
                height={35}
                className="rounded-full"
              />
            )}
            <h2>{msg.content}</h2>
          </div>
        ))}
        {loading && (
          <div
            className="p-5 rounded-lg mb-2 flex gap-2 items-start"
            style={{
              backgroundColor: Colors.CHAT_BACKGROUND,
            }}
          >
            <Loader2Icon className="animate-spin" />
            <p>Generating Response...</p>
          </div>
        )}
      </div>
        <div
          className="flex gap-2 p-4"
          style={{ backgroundColor: Colors.BACKGROUND }}
        >
          <textarea
            placeholder={Lookup.INPUT_PLACEHOLDER}
            value={userInput}
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
    </div>
  );
}

export default ChatView;
