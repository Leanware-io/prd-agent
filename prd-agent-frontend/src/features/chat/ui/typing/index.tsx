import React from "react";

function TypingIndicatorComponent() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white/10 text-white rounded-container rounded-tl-none p-4 max-w-[80%]">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export const TypingIndicator = React.memo(TypingIndicatorComponent);
