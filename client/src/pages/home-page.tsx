import { useArenaAuth } from "@/hooks/use-arena-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { ChannelCanvas } from "@/components/canvas/channel-canvas";

export default function HomePage() {
  const { isAuthenticated } = useArenaAuth();
  const [, setLocation] = useLocation();
  const [channelId, setChannelId] = useState<string>();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col">
      <Header onChannelLoad={setChannelId} />
      <main className="flex-1">
        <ChannelCanvas channelId={channelId} />
      </main>
    </div>
  );
}