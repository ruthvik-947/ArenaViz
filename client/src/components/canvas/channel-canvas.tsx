import { useQuery } from "@tanstack/react-query";
import { Editor, TLUiOverrides } from "@tldraw/tldraw";
import { ContentCard } from "./content-card";
import { Loader2 } from "lucide-react";

export function ChannelCanvas() {
  const { data: channel, isLoading } = useQuery({
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
    tools: (tools) => {
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
      <Editor
        uiOverrides={uiOverrides}
      >
        {channel?.contents.map((content: any, index: number) => (
          <ContentCard
            key={content.id}
            content={content}
            position={{ x: index * 300, y: Math.floor(index / 3) * 300 }}
          />
        ))}
      </Editor>
    </div>
  );
}
