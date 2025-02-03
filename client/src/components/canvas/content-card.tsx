import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description: string;
    image_url?: string | null;
  };
  position: {
    x: number;
    y: number;
  };
}

export function ContentCard({ content, position }: ContentCardProps) {
  return (
    <Card
      className={cn(
        "w-64 p-4 cursor-move absolute shadow-lg hover:shadow-xl transition-shadow",
        "bg-opacity-95 backdrop-blur-sm"
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {content.image_url && (
        <div className="relative w-full h-40 mb-4 overflow-hidden rounded-md">
          <img
            src={content.image_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h3 className="font-semibold mb-2 line-clamp-2">{content.title || "Untitled"}</h3>
      {content.description && (
        <p className="text-sm text-muted-foreground line-clamp-3">{content.description}</p>
      )}
    </Card>
  );
}