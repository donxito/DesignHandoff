"use client";
import { useEffect, useState } from "react";

const TERMINAL_LINES = [
  "> Initializing DesignHandoff v1.0",
  "> Loading design assets...",
  "> Connecting to developer API...",
  "> Bridging design-to-code gap...",
  "> Ready for collaboration!",
];

export default function RetroTerminal() {
  const [currentLine, setCurrentLine] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  // * Start the typing effect after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLine(0);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // * Handle line completion and cycling
  useEffect(() => {
    if (currentLine < 0) return;

    // Add current line to visible lines
    if (!visibleLines.includes(currentLine)) {
      setVisibleLines((prev) => [...prev, currentLine]);
    }

    // Move to next line or restart
    const lineDuration = currentLine === 0 ? 2000 : 2500; // First line is shorter
    const timer = setTimeout(() => {
      if (currentLine < TERMINAL_LINES.length - 1) {
        setCurrentLine((prev) => prev + 1);
      } else {
        // After last line, wait a bit and restart
        setTimeout(() => {
          setCurrentLine(0);
          setVisibleLines([]);
        }, 2000);
      }
    }, lineDuration);

    return () => clearTimeout(timer);
  }, [currentLine, visibleLines]);

  return (
    <div className="bg-gray-900 border-8 border-gray-700 rounded-lg overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] dark:shadow-[16px_16px_0px_0px_rgba(255,255,255,0.5)] transform rotate-2 hover:rotate-0 transition-transform duration-300">
      <div className="p-4 bg-green-400 flex justify-between items-center border-b-4 border-gray-700">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
        <div className="font-pixel text-xs text-black">designhandoff.exe</div>
        <div></div>
      </div>
      <div className="p-4 bg-black h-60 md:h-80 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="typing-animation font-mono text-green-400 text-sm">
            {TERMINAL_LINES.map((line, index) => {
              // Only render lines that should be visible
              if (!visibleLines.includes(index) && index !== currentLine)
                return null;

              const isTyping = index === currentLine;
              const className = isTyping ? "typing" : "show";

              return (
                <p key={index} className={className}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>
        <div className="font-mono text-green-400 flex">
          <span>{">"}</span>
          <span className="ml-2 animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
}
