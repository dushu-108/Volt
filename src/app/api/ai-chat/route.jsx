import { chatSession } from "../../../../config/AIModel";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ 
                error: "Prompt is required" 
            }, { 
                status: 400 
            });
        }

        const result = await chatSession.sendMessage(prompt);
        const response = result.response.text();
        
        return NextResponse.json({ 
            result: response 
        });
    } catch (error) {
        console.error("AI Chat Error:", error);
        
        // Handle specific error cases
        if (error.message?.includes("API key not valid")) {
            return NextResponse.json({ 
                error: "Invalid Gemini API key. Please check your API key configuration." 
            }, { 
                status: 401 
            });
        }

        return NextResponse.json({ 
            error: error.message || "Failed to process chat request" 
        }, { 
            status: 500 
        });
    }
}