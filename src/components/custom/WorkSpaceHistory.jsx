"use client";

import { useConvex } from "convex/react";
import React, { useContext, useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { UserDetailsContext } from "../../../context/UserDetailsContext";
import Link from "next/link";
import { useSidebar } from "../ui/sidebar";
import { Loader2Icon } from "lucide-react";

function WorkSpaceHistory() {
  const convex = useConvex();
  const { userDetails } = useContext(UserDetailsContext);
  const [workSpaceList, setWorkSpaceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (userDetails?.uid || userDetails?.sub) {
      GetWorkSpace();
    }
  }, [userDetails]);
  
  const GetWorkSpace = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = userDetails?.uid || userDetails?.sub;
      if (!userId) {
        throw new Error("User ID not available");
      }

      const result = await convex.query(api.workspace.GetAllWorkSpace, { 
        userId: userId
      });
      
      setWorkSpaceList(result || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setError(error.message);
      setWorkSpaceList([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2Icon className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        Error loading workspaces: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="font-medium text-lg mb-4">Your Chats</h2>
      {workSpaceList.length === 0 ? (
        <p className="text-sm text-gray-400">No chat history yet</p>
      ) : (
        workSpaceList.map((workspace) => (
          <Link 
            href={'/workspace/' + workspace._id} 
            key={workspace._id} 
            onClick={toggleSidebar}
          >
            <div className="p-3 mb-2 rounded-lg hover:bg-gray-800 transition-colors">
              <h2 className="text-sm text-gray-400 font-light cursor-pointer hover:text-white truncate">
                {workspace?.messages?.[0]?.content || "New Chat"}
              </h2>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default WorkSpaceHistory;
