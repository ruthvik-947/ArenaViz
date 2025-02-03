import { Tldraw, TLUiOverrides } from "@tldraw/tldraw";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "./content-card";
import { Loader2 } from "lucide-react";

interface ChannelContent {
  id: string;
  title: string;
  description: string;
  image_url?: string;
}

interface Channel {
  contents: ChannelContent[];
}

export function ChannelCanvas() {
  const { data: channel, isLoading } = useQuery<Channel>({
    queryKey: ["/api/arena/channel"],
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const uiOverrides: TLUiOverrides = {
    tools(editor, tools) {
      return {
        ...tools,
        select: {
          ...tools.select,
          label: "Select & Move",
        },
      };
    },
  };

  return (
    <div className="h-full">
      <Tldraw
        persistenceKey="arena-channel"
        uiOverrides={uiOverrides}
      >
        {channel?.contents?.map((content, index) => (
          <ContentCard
            key={content.id}
            content={content}
            position={{ x: index * 300, y: Math.floor(index / 3) * 300 }}
          />
        ))}
      </Tldraw>
    </div>
  );
}