"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ConvexError } from "convex/values";
import { toast } from "sonner";

const ChatList = ({ id }: { id: string }) => {
  const user = useQuery(api.auth.getCurrentUser);
  const markAsRead = useMutation(api.message.markAsRead);

  const [message, setMessage] = useState("");
  const sendMessage = useMutation(api.message.sendMessage);

  const messages = useQuery(
    api.message.getMessages,
    user
      ? {
          senderId: user._id,
          receiverId: id,
        }
      : "skip",
  );

  useEffect(() => {
    if (messages) {
      document.getElementById("chat-list")?.scrollTo({
        top: document.getElementById("chat-list")?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    async function mark() {
      try {
        if (user) {
          await markAsRead({
            senderId: id,
            receiverId: user?._id as string,
          });
        }
      } catch (err) {
        toast.error(
          err instanceof ConvexError ? err.data : "Something went wrong",
        );
      }
    }
    mark();
  }, []);

  if (user === null) {
    return (
      <div className="flex items-center justify-center h-full">
        Sign in to see messages
      </div>
    );
  }

  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({
        senderId: user?._id as string,
        receiverId: id,
        body: message,
      });
    } catch (err) {
      toast.error(
        err instanceof ConvexError ? err.data : "Something went wrong",
      );
    } finally {
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div id="chat-list" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          return (
            <div
              key={message._id}
              className={`flex ${message.senderId === user?._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === user?._id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.body}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {new Date(message._creationTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t ">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default ChatList;
