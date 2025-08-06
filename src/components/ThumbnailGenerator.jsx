"use client";
import { getGeminiPrompt } from "@/app/promt";
import React, { useRef, useState, useEffect, useCallback } from "react";
import Together from "together-ai";
import CanvasWithText from "./CanvasWithText";

const ThumbnailGenerator = () => {
  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const TogetherApiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY;
  const together = new Together({ apiKey: TogetherApiKey });
  const [textConfig, setTextConfig] = useState({});

  // Store timeouts to clear later
  const timeouts = useRef([]);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  }, []);

  const handleGenerate = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setImageUrl("");
    setTextConfig({});
    setLoadingStage("Sending response to AI...");

    clearAllTimeouts();

    const inputValue = inputRef.current?.value;
    const openRouterKey = process.env.NEXT_PUBLIC_OpenRouter_API_KEY;

    if (!inputValue) {
      alert("Please enter a video title.");
      setIsLoading(false);
      setLoadingStage("");
      return;
    }
    if (!openRouterKey) {
      alert("API key is missing.");
      setIsLoading(false);
      setLoadingStage("");
      return;
    }

    try {
      const geminiPrompt = getGeminiPrompt(inputValue);

      // Fetch AI prompt
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

      if (!res.ok) throw new Error(`Error: ${res.status} ${res.statusText}`);

      const data = await res.json();
      const geminiResponse = data.choices?.[0]?.message?.content || "No response";

      // Once prompt received, immediately set loading text to "Generating image prompt..."
      setLoadingStage("Generating image prompt...");

      // Set timer to change loading text after 5s -> "Generating image..."
      const genImgTimeout = setTimeout(() => {
        setLoadingStage("Generating image...");
      }, 5000);

      // Set timer to change loading text after 25s total -> "Polishing the pixels..."
      const polishTimeout = setTimeout(() => {
        setLoadingStage("Polishing the pixels...");
      }, 25000);

      timeouts.current.push(genImgTimeout, polishTimeout);

      // Process geminiResponse
      if (geminiResponse) {
        const array = geminiResponse.replaceAll("\n", "").split("||");
        const prompt = array[0]?.trim();
        const configString = array[1]?.trim();
        const parsedTextConfig = eval(`(${configString})`);
        console.log(parsedTextConfig);

        if (prompt) {
          // Generate image
          const response = await together.images.create({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: prompt,
            width: 1024,
            height: 576,
          });

          if (response.data[0].url) {
            // Image ready before timers finish, clear all timers immediately
            clearAllTimeouts();

            setImageUrl(response.data[0].url);
            setTextConfig(parsedTextConfig);

            // Show "Generating image..." text for 3 seconds before final
            setLoadingStage("Generating image...");
            const finalTimeout = setTimeout(() => {
              setLoadingStage("");
              setIsLoading(false);
            }, 3000);
            timeouts.current.push(finalTimeout);
            return;
          }
        }
      }

      // If something goes wrong or no image URL:
      clearAllTimeouts();
      setLoadingStage("");
      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to generate thumbnail. Check console for details.");
      clearAllTimeouts();
      setLoadingStage("");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

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
            className={`bg-blue-600 hover:bg-blue-700 transition-all duration-200 px-6 py-2 rounded-sm font-medium shadow-md shadow-blue-500/30 ${
              isLoading ? "opacity-60 cursor-not-allowed" : ""
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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <div className="text-sm text-gray-400 mt-3 animate-pulse">{loadingStage}</div>
              </div>
            ) : imageUrl ? (
              <CanvasWithText textConfig={textConfig} imageUrl={imageUrl} />
            ) : (
              <span>Generated thumbnail will appear here</span>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-400 italic select-none">
            To save the thumbnail: <br />
            <strong>Right-click on the image → Choose "Save image as..."</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;
