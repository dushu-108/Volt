import { NextResponse } from "next/server";
import { GenAiCode } from "../../../../config/AIModel";

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

        const result = await GenAiCode.sendMessage(prompt);
        const responseText = await result.response.text();
        const parsedResponse = JSON.parse(responseText);

        if (!parsedResponse.files) {
            throw new Error("Invalid response format: missing files");
        }

        return NextResponse.json(parsedResponse);
    } catch (error) {
        console.error("AI Code Generation Error:", error);
        return NextResponse.json({ 
            error: error.message || "Failed to generate code" 
        }, { 
            status: error.message?.includes("API key not valid") ? 401 : 500 
        });
    }
}