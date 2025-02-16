"use client"

import React, { useContext, useEffect, useState } from "react";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from "@/data/Lookup";
import { MessagesContext } from "../../../context/MessagesContext";
import Prompt from "@/data/Prompt";
import axios from "axios";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import SandPackPreviewClient from "./SandPackPreviewClient";

function CodeView() {
    const {id} = useParams();
    const [activeTab, setActiveTab] = useState('code');
    const [files, setFiles] = useState(Lookup.DEFAULT_FILE);
    const { messages } = useContext(MessagesContext); 
    const UpdateFiles = useMutation(api.workspace.UpdateFiles);
    const convex = useConvex();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(id) {
            GetFiles();
        }
    }, [id])

    const GetFiles = async () => {
        try {
            setLoading(true);
            const result = await convex.query(api.workspace.GetWorkSpace, {
                workspaceId: id
            });
            
            if (result?.fileData) {
                const mergedFiles = {...Lookup.DEFAULT_FILE, ...result.fileData};
                setFiles(mergedFiles);
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setFiles(Lookup.DEFAULT_FILE);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(messages?.length > 0) {
            const role = messages[messages?.length-1].role;
            if(role == 'user') {
                GenerateAiCode();
            }
        }
      }, [messages])

    const GenerateAiCode = async() => {
        try {
            setLoading(true);
            const PROMPT = JSON.stringify(messages) + " " + Prompt.CODE_GEN_PROMPT;
            const result = await axios.post('/api/gen-ai-code', {
                prompt: PROMPT
            });

            const aiResp = result.data;
            if (!aiResp?.files) {
                throw new Error("No files received from AI");
            }

            const mergedFiles = {...Lookup.DEFAULT_FILE, ...aiResp.files};
            setFiles(mergedFiles);
            
            if (id) {
                await UpdateFiles({
                    workspaceId: id,
                    files: aiResp.files
                });
            }
        } catch (error) {
            console.error("Error generating code:", error);
            // Keep existing files on error
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative">
            <div className="bg-[#181818] w-full border p-2">
                <div className="flex items-center flex-wrap shrink-0 bg-black p-1 justify-center rounded-full w-[140px] gap-3">
                    <h2 onClick={() => setActiveTab('code')}
                        className={`text-sm cursor-pointer 
                        ${activeTab === 'code' && 'text-blue-500 bg-blue-500 bg-opacity-25 rounded-full p-1 px-2'}`}>Code</h2>
                    <h2 onClick={() => setActiveTab('preview')}
                        className={`text-sm cursor-pointer 
                        ${activeTab === 'preview' && 'text-blue-500 bg-blue-500 bg-opacity-25 rounded-full p-1 px-2'}`}>Preview</h2>
                </div>
            </div>
            <SandpackProvider template="react" theme={"dark"}
                files={files}
                customSetup={{
                    dependencies: {
                        ...Lookup.DEPENDANCY
                    }
                }}
                options={{
                    externalResources: ['https://cdn.tailwindcss.com']
                }}>
                <SandpackLayout>
                    {activeTab === 'code' ? <>
                        <SandpackFileExplorer style={{ height: "80vh" }} />
                        <SandpackCodeEditor style={{ height: "80vh" }} />
                    </> :
                        <SandPackPreviewClient />
                        //<SandpackPreview style={{ height: "80vh" }} />
                        }
                </SandpackLayout>
            </SandpackProvider>
            {loading && <div className="p-10 bg-gray-900 opacity-80 absolute top-0 rounded-lg w-full h-full flex items-center justify-center">
                <Loader2Icon className='animate-spin h-10 w-10 text-white'/>
                <h2>Generating your code...</h2>
            </div>}
        </div>
    );
}

export default CodeView;
