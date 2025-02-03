import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "./content-card";
import { Loader2 } from "lucide-react";

interface ChannelContent {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
}

interface Channel {
  contents: ChannelContent[];
}

export function ChannelCanvas({ channelId }: { channelId?: string }) {
  const { data: channel, isLoading } = useQuery<Channel>({
    queryKey: [`/api/arena/channel/${channelId}/contents`],
    enabled: !!channelId,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Enter a channel ID to view its contents
      </div>
    );
  }

  return (
    <div className="h-full">
      <Tldraw>
        <div className="absolute inset-0">
          {channel?.contents?.map((content, index) => (
            <ContentCard
              key={content.id}
              content={content}
              position={{ x: index * 300, y: Math.floor(index / 3) * 300 }}
            />
          ))}
        </div>
      </Tldraw>
    </div>
  );
}