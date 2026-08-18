import { Suspense } from "react";
import { ChatPage } from "@/components/utility-pages";

export default function Chat() {
  return (
    <Suspense fallback={<p className="data-state">Loading chat room…</p>}>
      <ChatPage />
    </Suspense>
  );
}
