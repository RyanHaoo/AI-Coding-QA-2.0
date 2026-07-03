import type { UIMessage } from "ai";

import { AssistantChat } from "@/components/assistant/assistant-chat";

type BuilderCandidate = {
  department: string;
  fullName: string;
  membershipId: string;
};

export function AssistantPage({
  builders,
  initialMessages,
  sessionId,
}: {
  builders: BuilderCandidate[];
  initialMessages: UIMessage[];
  sessionId: string;
}) {
  return (
    <section>
      <AssistantChat
        builders={builders}
        initialMessages={initialMessages}
        sessionId={sessionId}
      />
    </section>
  );
}
