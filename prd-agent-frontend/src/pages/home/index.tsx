import {
  Authentication,
  BackgroundAnimation,
  ChatInterface,
  HeroForm,
} from "@/widgets";
import { useCallback, useState } from "react";
import { useUser } from "@/app/providers";

export function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "initial" | "auth" | "chat"
  >("initial");
  const [initialMessage, setInitialMessage] = useState("");
  const { user } = useUser();

  const onSetInitialMessage = useCallback(
    (message: string) => {
      setInitialMessage(message);
      if (user) {
        setCurrentScreen("chat");
      } else {
        setCurrentScreen("auth");
      }
    },
    [user],
  );

  const onContinue = useCallback(() => setCurrentScreen("chat"), []);

  return (
    <div className="min-h-screen flex flex-col bg-[#001115] text-white relative">
      {currentScreen !== "chat" && <BackgroundAnimation />}
      {currentScreen === "initial" && (
        <HeroForm onSetInitialMessage={onSetInitialMessage} />
      )}
      {currentScreen === "auth" && <Authentication onContinue={onContinue} />}
      {currentScreen === "chat" && (
        <ChatInterface initialMessage={initialMessage} />
      )}
    </div>
  );
}
