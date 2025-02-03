import { useArenaAuth } from "@/hooks/use-arena-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Header } from "@/components/header";
import { ChannelCanvas } from "@/components/canvas/channel-canvas";

export default function HomePage() {
  const { isAuthenticated } = useArenaAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ChannelCanvas />
      </main>
    </div>
  );
}
