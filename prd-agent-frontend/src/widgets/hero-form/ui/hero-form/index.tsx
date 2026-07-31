import React, { useState } from "react";
import { ArrowRight, PaperclipIcon } from "lucide-react";
import { Files } from "@/features/chat";
import { useDropzone } from "@/app/providers";

interface IHeroForm {
  onSetInitialMessage: (message: string) => void;
}

function HeroFormComponent(props: Readonly<IHeroForm>) {
  const { onSetInitialMessage } = props;
  const [message, setMessage] = useState("");
  const { files, open, onRemoveFile } = useDropzone();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim()) {
      onSetInitialMessage(message.trim());
    }
  };

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 relative z-10">
      <div className="w-full max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-raleway leading-tight mb-6 animate-fade-in text-white shadow-text">
          Let's Build Your{" "}
          <span className="text-primary">Software Solution</span>
        </h1>
        <p
          className="text-lg md:text-xl text-white mb-12 max-w-2xl mx-auto animate-fade-in shadow-text"
          style={{ animationDelay: "100ms" }}
        >
          Tell us what you want to build, and our AI assistant will help you get
          started with an accurate quote.
        </p>
        <form
          className="relative max-w-3xl mx-auto transition-all duration-500 transform opacity-100 translate-y-0"
          onSubmit={handleSubmit}
          style={{ animationDelay: "200ms" }}
        >
          <div className="relative flex items-center">
            <input
              className="w-full bg-white/15 backdrop-blur-sm text-white border border-white/20 rounded-full py-4 px-6 pr-16 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-white/60"
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                files.length
                  ? `Files selected: ${new Intl.ListFormat("en", {
                      style: "long",
                      type: "conjunction",
                    }).format(files.map((file) => file.content.name))}`
                  : "I would like to build..."
              }
              type="text"
              value={message}
            />
            <button
              className="absolute right-1.5 rounded-full aspect-square p-0 w-10 h-10 flex items-center justify-center bg-primary hover:bg-primary-700"
              type="submit"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-4 text-white text-sm px-2">
            <button
              className="flex items-center gap-2 hover:text-primary transition-colors"
              onClick={open}
              type="button"
            >
              <PaperclipIcon className="h-4 w-4" />
              <span>Attach files</span>
            </button>
            <p className="text-white">Projects are kept private and secure</p>
          </div>
          <Files files={files} onRemoveFile={onRemoveFile} />
        </form>
        <div className="mt-16 md:mt-20 transition-all duration-500 opacity-100">
          <p className="text-primary text-xl font-semibold mb-2 shadow-text">
            Get an accurate roadmap and quote
          </p>
          <p className="text-white shadow-text">
            No tech experience required. Our AI asks all the right questions.
          </p>
        </div>
      </div>
    </section>
  );
}

export const HeroForm = React.memo(HeroFormComponent);
