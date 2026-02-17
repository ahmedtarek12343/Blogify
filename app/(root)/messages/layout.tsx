import React from "react";
import MessageList from "@/components/web/MessageList";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex mt-5 flex-col md:flex-row border rounded-lg">
      <div className="p-4 h-24 md:h-[calc(100vh-8rem)] bg-accent overflow-y-auto border-r md:w-64">
        <MessageList />
      </div>
      <main className="flex-1 md:p-6 px-0 h-[calc(100vh-8rem)]">
        {children}
      </main>
    </div>
  );
};

export default layout;
