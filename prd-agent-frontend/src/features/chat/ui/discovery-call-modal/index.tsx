import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Textarea,
} from "@/shared/ui";
import { Calendar, Send } from "lucide-react";
import { cn } from "@/shared/utils";
import { useUser } from "@/app/providers";

interface IDiscoveryCallModal {
  onOpenChange: (open: boolean) => void;
  onScheduleCall(name: string, email: string, message: string): Promise<void>;
  open: boolean;
}

function DiscoveryCallModalComponent(props: Readonly<IDiscoveryCallModal>) {
  const { onOpenChange, onScheduleCall, open } = props;
  const { user } = useUser();
  const [name, setName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState(
    "I'm interested in discussing my project requirements with your team. I'd appreciate if we could schedule a call to explore how Leanware can help bring my vision to life.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsSubmitting(true);
      await onScheduleCall(name, email, message);
      onOpenChange(false);
      setName(user?.displayName ?? "");
      setEmail(user?.email ?? "");
      setMessage(
        "I'm interested in discussing my project requirements with your team. I'd appreciate if we could schedule a call to explore how Leanware can help bring my vision to life.",
      );
    } catch (error) {
      console.error("Error scheduling call", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-container border border-primary/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center font-raleway text-secondary-700">
              Schedule a Discovery Call
            </DialogTitle>
            <DialogDescription className="text-center text-secondary-700 max-w-sm mx-auto">
              Let's discuss how Leanware can help bring your project to life!
              Our team will reach out to schedule a personalized consultation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <label
                className="text-sm font-medium text-secondary-700"
                htmlFor="name"
              >
                Your Name
              </label>
              <Input
                className="border-primary/20 focus:border-primary focus:ring-primary/20"
                disabled={isSubmitting}
                id="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                required
                value={name}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label
                className="text-sm font-medium text-secondary-700"
                htmlFor="email"
              >
                Your Email
              </label>
              <Input
                className="border-primary/20 focus:border-primary focus:ring-primary/20"
                disabled={isSubmitting}
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your@email.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label
                className="text-sm font-medium text-secondary-700"
                htmlFor="message"
              >
                Your Message
              </label>
              <Textarea
                className="min-h-[120px] resize-none border-primary/20 focus:border-primary focus:ring-primary/20"
                disabled={isSubmitting}
                id="message"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="I'm interested in discussing my project requirements with your team. I'd appreciate if we could schedule a call to explore how Leanware can help bring my vision to life."
                required
                value={message}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 mt-2">
              <div className="p-3 bg-primary/10 rounded-lg text-xs text-secondary-700">
                <p className="font-medium mb-1 text-center">
                  Quote details will be included with your message
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <DialogClose asChild>
              <Button
                className="w-full sm:w-auto border-secondary-500 text-secondary-500 hover:bg-secondary-500/10"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className={cn(
                "w-full sm:w-auto bg-primary hover:bg-primary-700 transition-colors flex gap-2 items-center",
                isSubmitting && "opacity-80 cursor-not-allowed",
              )}
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Schedule Call"}
              <Send className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export const DiscoveryCallModal = React.memo(DiscoveryCallModalComponent);
