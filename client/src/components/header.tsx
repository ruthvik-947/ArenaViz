import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArenaAuth } from "@/hooks/use-arena-auth";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const { logout } = useArenaAuth();
  const [channelId, setChannelId] = useState("");
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelId) {
      queryClient.invalidateQueries({ queryKey: ["/api/arena/channel", channelId] });
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Are.na Channel Visualizer</h1>
        
        <form onSubmit={handleSubmit} className="flex-1 max-w-md flex gap-2">
          <Input
            placeholder="Enter channel ID or URL"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
          />
          <Button type="submit">Load</Button>
        </form>

        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
