"use client";

import { useState } from "react";

export default function GenerateAIBlogButton({ action }) {
    const [isPending, setIsPending] = useState(false);

    async function handleGenerate() {
        setIsPending(true);
        try {
            await action();
        } catch (error) {
            console.error("Failed to generate AI blog:", error);
            alert("Error: " + error.message);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <button 
            onClick={handleGenerate} 
            disabled={isPending}
            className="btn btn-primary" 
            style={{ 
                textDecoration: "none", 
                marginLeft: "1rem",
                background: isPending ? "gray" : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                cursor: isPending ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
            }}
        >
            {isPending ? (
                <>
                    <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid #fff", borderBottomColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "rotation 1s linear infinite" }}></span>
                    Generating...
                </>
            ) : (
                "✨ Generate AI Article"
            )}
            <style>{`
                @keyframes rotation {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}
