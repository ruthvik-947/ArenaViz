import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { CardUtil } from "@/lib/custom-shapes";

interface ChannelContent {
  id: string;
  title: string;
  description: string;
  content: string;
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

  const handleMount = useCallback((editor: Editor) => {
    if (!channel?.contents) return;

    console.log('Full channel response:', JSON.stringify(channel, null, 2));

    channel.contents.forEach((content, index) => {
      const x = (index % 3) * 300 + 100;
      const y = Math.floor(index / 3) * 300 + 100;

      console.log('Processing content item:', {
        id: content.id,
        title: content.title,
        description: content.description,
        content: content.content,
        imageUrl: content.image_url
      });

      editor.createShape({
        type: 'card',
        x,
        y,
        props: {
          title: content.title || (content.content ? content.content.slice(0, 50) + '...' : 'Untitled'),
          description: content.content || content.description || '',
          imageUrl: content.image_url,
          w: 250,
          h: content.image_url ? 320 : 160,
        },
      });
    });
  }, [channel?.contents]);

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
      <Tldraw 
        onMount={handleMount}
        shapeUtils={[CardUtil]}
      />
    </div>
  );
}
