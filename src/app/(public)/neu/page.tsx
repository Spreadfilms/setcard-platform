"use client";

import { useState } from "react";
import SetCardForm from "@/components/setcard/SetCardForm";
import dynamic from "next/dynamic";

const ReactConfetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function NeuPage() {
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
        <ReactConfetti
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          recycle={false}
          numberOfPieces={300}
          colors={["#0A0A0A", "#737373", "#E5E5E5"]}
        />
        <div className="max-w-md space-y-6 z-10">
          <div className="w-16 h-16 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#0A0A0A]">Thank you!</h1>
          <p className="text-[#737373] leading-relaxed">
            Thank you for your application! We have received your Sedcard and will get back to you once we have reviewed it.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#0A0A0A] text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return <SetCardForm onSuccess={() => setSuccess(true)} />;
}
