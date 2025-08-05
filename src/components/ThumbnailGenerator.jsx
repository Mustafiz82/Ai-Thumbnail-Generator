"use client";
import { getGeminiPrompt } from "@/app/promt";
import Image from "next/image";
import React, { useRef, useState } from "react";
import Together from "together-ai";
import CanvasWithText from "./CanvasWithText";


const ThumbnailGenerator = () => {
    const inputRef = useRef(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState("");
    const TogetherApiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
    const together = new Together({ apiKey: TogetherApiKey });
    const [textConfig, setTextConfig] = useState({})

    const handleGenerate = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setLoadingStage("🔍 Analyzing title...");
        const inputValue = inputRef.current?.value;
        const openRouterKey = process.env.NEXT_PUBLIC_OpenRouter_API_KEY;

        if (!inputValue) {
            alert("Please enter a video title.");
            setIsLoading(false);
            return;
        }
        if (!openRouterKey) {
            alert("API key is missing.");
            setIsLoading(false);
            return;
        }

        try {
            setLoadingStage("Generating image prompt...");
            const geminiPrompt = getGeminiPrompt(inputValue);

            setLoadingStage("Sending request to AI...");
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openrouter/horizon-beta",
                    messages: [{ role: "user", content: geminiPrompt }],
                }),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            const geminiResponse = data.choices?.[0]?.message?.content || "No response";

            if (geminiResponse) {
                const array = geminiResponse.replaceAll("\n", "").split("||");
                const prompt = array[0]?.trim();
                const configString = array[1]?.trim();

                const textConfig = eval(`(${configString})`);
                console.log(textConfig);

                if (prompt) {
                    setLoadingStage(" Started generating image...");
                    const response = await together.images.create({
                        model: "black-forest-labs/FLUX.1-schnell-Free",
                        prompt: prompt,
                        width: 1024,
                        height: 576,
                    });


                    setLoadingStage("Polishing the pixels...");

                    if (response.data[0].url) {
                        setImageUrl(response.data[0].url);
                        setTextConfig(textConfig)
                    }
                }
            }

            setLoadingStage("");
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Failed to generate thumbnail. Check console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 items">
            <div className="max-w-6xl mx-auto px-6 py-10 min-h-screen flex flex-col md:flex-row items-center gap-10 text-white">
                {/* Left Panel */}
                <div className="w-full md:w-1/2 space-y-6">
                    <h1 className="text-3xl font-bold text-blue-400 mb-2">AI Thumbnail Generator</h1>
                    <p className="text-gray-300 mb-2">
                        Generate stunning thumbnails with AI. Just enter your video title and let the AI do the magic.
                    </p>

                    <label className="block text-sm font-medium text-gray-200 mb-1">Enter Your Video Title</label>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="e.g. How to Learn React in 7 Days"
                        className="w-full p-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className={`bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-6 py-2 rounded-sm font-medium shadow-md shadow-blue-500/30 ${isLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                    >
                        {isLoading ? "Generating..." : "Generate Thumbnail"}
                    </button>
                   <div className="text-sm text-gray-400 pt-6 border-t border-gray-700">
                    <p className="mb-2">
                        🛠️ This project is <strong>open source</strong>. Fork it on{" "}
                        <a
                            href="https://github.com/mustafizrahman/ai-thumbnail-generator"
                            className="text-blue-400 underline hover:text-blue-300"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                    <p>
                        🌐 Created by{" "}
                        <a
                            href="https://mustafizrahman.vercel.app/"
                            className="text-blue-400 underline hover:text-blue-300"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Mustafiz Rahman
                        </a>
                    </p>
                </div>
                </div>

                {/* Right Panel */}
                <div className="w-full md:w-1/2">
                    <div className="aspect-video overflow-hidden relative w-full border-2 border-dashed border-gray-600 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center">
                                <svg
                                    className="animate-spin h-8 w-8 mb-2 text-blue-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                <div className="text-sm text-gray-400 mt-3 animate-pulse">{loadingStage}</div>

                            </div>
                        ) : imageUrl ? (
                            //   <Image src={imageUrl} alt="Generated Thumbnail" layout="fill" className="w-full h-full object-cover rounded-lg" />
                            <CanvasWithText textConfig={textConfig} imageUrl={imageUrl} />
                        ) : (
                            <span>Generated thumbnail will appear here</span>
                        )}
                    </div>
                </div>
            </div>

            
        </div>
    );
};

export default ThumbnailGenerator;
