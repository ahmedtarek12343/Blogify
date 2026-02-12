import React from "react";
import MessageList from "@/components/web/MessageList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex mt-5 border rounded-lg">
      <div className="p-4 h-[calc(100vh-8rem)] bg-accent overflow-y-auto border-r w-64">
        <MessageList />
      </div>
      <main className="flex-1 p-6 h-[calc(100vh-8rem)]">{children}</main>
    </div>
  );
};

export default layout;
