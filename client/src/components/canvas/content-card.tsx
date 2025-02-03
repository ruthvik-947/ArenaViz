import { Card } from "@/components/ui/card";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description: string;
    image_url?: string;
  };
  position: {
    x: number;
    y: number;
  };
}

export function ContentCard({ content, position }: ContentCardProps) {
  return (
    <Card
      className="w-64 p-4 cursor-move"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      {content.image_url && (
        <img
          src={content.image_url}
          alt={content.title}
          className="w-full h-40 object-cover rounded-md mb-4"
        />
      )}
      <h3 className="font-semibold mb-2">{content.title}</h3>
      <p className="text-sm text-muted-foreground">{content.description}</p>
    </Card>
  );
}
