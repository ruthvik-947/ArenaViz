
import { Tldraw, Editor, createShape, TLShape } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

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

  const handleMount = (editor: Editor) => {
    if (!channel?.contents) return;
    
    channel.contents.forEach((content, index) => {
      const x = (index % 3) * 300 + 100;
      const y = Math.floor(index / 3) * 300 + 100;
      
      editor.createShape({
        type: 'card',
        x,
        y,
        props: {
          title: content.title || 'Untitled',
          description: content.description || '',
          imageUrl: content.image_url,
          w: 250,
          h: content.image_url ? 320 : 160,
        },
      });
    });
  };

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
      <Tldraw onMount={handleMount} />
    </div>
  );
}
