import React, { useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui";
import { loginWithGoogle, loginWithMicrosoft } from "@/shared/lib";
import { User } from "firebase/auth";

interface IAuthentication {
  onContinue: () => void;
}

function AuthenticationComponent(props: Readonly<IAuthentication>) {
  const { onContinue } = props;

  const onLogin = useCallback(
    async (provider: "google" | "microsoft") => {
      try {
        let user: User | null = null;
        if (provider === "google") {
          user = await loginWithGoogle();
        } else if (provider === "microsoft") {
          user = await loginWithMicrosoft();
        }
        if (user) {
          onContinue();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onContinue],
  );

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 relative z-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] transition-all duration-500 transform opacity-100 translate-y-0">
          <div className="w-full max-w-3xl mx-auto text-center mb-10">
            <div className="rounded-xl p-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Let's Build Your{" "}
                <span className="text-primary">Software Solution</span>
              </h2>
              <p className="text-lg md:text-xl text-white">
                Tell us what you want to build, and our AI assistant will help
                you get started with an accurate quote.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4 w-full max-w-sm">
            <Button
              className="bg-white text-gray-800 hover:bg-gray-100 p-6 text-base flex items-center justify-center font-medium transition-all hover:scale-105"
              onClick={() => onLogin("google")}
              variant="outline"
            >
              <svg
                className="mr-2"
                fill="#4285F4"
                height="20"
                viewBox="0 0 24 24"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>

            <Button
              className="bg-white text-gray-800 hover:bg-gray-100 p-6 text-base flex items-center justify-center font-medium transition-all hover:scale-105"
              onClick={() => onLogin("microsoft")}
              variant="outline"
            >
              <svg
                className="mr-2"
                height="20"
                viewBox="0 0 23 23"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.1 0H0v11.1h11.1V0z" fill="#f1511b" />
                <path d="M23 0H11.9v11.1H23V0z" fill="#80cc28" />
                <path d="M11.1 11.9H0V23h11.1V11.9z" fill="#00adef" />
                <path d="M23 11.9H11.9V23H23V11.9z" fill="#fbbc09" />
              </svg>
              Continue with Microsoft
              <ArrowRight className="ml-auto h-5 w-5" />
            </Button>
          </div>

          <div className="rounded-xl p-6 mt-12 w-full">
            <p className="text-primary text-xl font-semibold mb-2 text-center">
              Get an accurate roadmap and quote
            </p>
            <p className="text-white text-center">
              No tech experience required. Our AI asks all the right questions.
            </p>
          </div>

          <p className="mt-8 text-white/80 text-sm text-center">
            Your data is safe. We won't share your information.
          </p>
        </div>
      </div>
    </section>
  );
}

export const Authentication = React.memo(AuthenticationComponent);
