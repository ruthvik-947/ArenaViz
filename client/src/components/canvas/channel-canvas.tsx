import { Tldraw, Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { CardUtil } from "@/lib/custom-shapes";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface CanvasState {
  id: number;
  channelId: string;
  viewSettings: any;
}

interface BlockPosition {
  id: number;
  canvasStateId: number;
  arenaBlockId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isVisible: boolean;
  customProperties?: any;
}

export function ChannelCanvas({ channelId }: { channelId?: string }) {
  const { toast } = useToast();

  const { data: channel, isLoading: isLoadingChannel } = useQuery<Channel>({
    queryKey: [`/api/arena/channel/${channelId}/contents`],
    enabled: !!channelId,
  });

  const { data: canvasState, isLoading: isLoadingState } = useQuery<CanvasState>({
    queryKey: [`/api/canvas/${channelId}/state`],
    enabled: !!channelId,
  });

  const saveStateMutation = useMutation({
    mutationFn: async ({ state, shapes }: { state: any; shapes: any[] }) => {
      await apiRequest("POST", `/api/canvas/${channelId}/state`, {
        state,
        shapes,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save canvas state",
        variant: "destructive",
      });
    },
  });

  const handleMount = useCallback((editor: Editor) => {
    if (!channel?.contents) return;

    // If we have a saved state, load it
    if (canvasState?.viewSettings) {
      editor.setCamera(canvasState.viewSettings.camera);
      // Load any other view settings
    }

    // Load content blocks
    channel.contents.forEach((content, index) => {
      // Get saved position for this block if it exists
      const savedPosition = canvasState?.viewSettings?.blocks?.find(
        (b: BlockPosition) => b.arenaBlockId === content.id
      );

      const x = savedPosition?.x ?? (index % 3) * 300 + 100;
      const y = savedPosition?.y ?? Math.floor(index / 3) * 300 + 100;
      const width = savedPosition?.width ?? 250;
      const height = savedPosition?.height ?? (content.image_url ? 320 : 160);

      editor.createShape({
        type: 'card',
        x,
        y,
        props: {
          title: content.title || content.content?.slice(0, 50) || 'Untitled',
          description: content.content || content.description || '',
          imageUrl: content.image_url,
          w: width,
          h: height,
        },
      });
    });

    // Set up change handler to save state
    const handleChange = () => {
      const shapes = editor.getShapes();
      const camera = editor.getCamera();

      const blocks = shapes.map(shape => ({
        arenaBlockId: shape.id,
        x: shape.x,
        y: shape.y,
        width: shape.props.w,
        height: shape.props.h,
        isVisible: true,
      }));

      saveStateMutation.mutate({
        state: {
          camera,
          blocks,
        },
        shapes: blocks,
      });
    };

    editor.on("change", handleChange);

    return () => {
      editor.off("change", handleChange);
    };
  }, [channel?.contents, canvasState, channelId, saveStateMutation, toast]);

  if (isLoadingChannel || isLoadingState) {
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