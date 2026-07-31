import React, { useState } from "react";
import { Button } from "@/shared/ui";
import { DiscoveryCallModal } from "@/features/chat";

interface IDiscoveryCallButton {
  onScheduleCall(name: string, email: string, message: string): Promise<void>;
}

function DiscoveryCallButtonComponent(props: Readonly<IDiscoveryCallButton>) {
  const { onScheduleCall } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        className="bg-primary-700 text-white px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-primary-700/80 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        Schedule Discovery Call
      </Button>

      <DiscoveryCallModal
        onOpenChange={setIsModalOpen}
        onScheduleCall={onScheduleCall}
        open={isModalOpen}
      />
    </>
  );
}

export const DiscoveryCallButton = React.memo(DiscoveryCallButtonComponent);
