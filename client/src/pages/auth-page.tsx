import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArenaAuth } from "@/hooks/use-arena-auth";
import { SiBookstack } from "react-icons/si";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const { isAuthenticated, isLoading, startAuth } = useArenaAuth();
  const [, setLocation] = useLocation();

  const { data: redirectUri } = useQuery<{ redirectUri: string }>({
    queryKey: ["/api/arena/redirect-uri"],
  });

  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Are.na Channel Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            Connect your Are.na account to visualize your channels on an infinite
            canvas.
          </p>

          {redirectUri && (
            <div className="space-y-2 py-2">
              <p className="text-sm font-medium">Redirect URI (for Are.na OAuth setup):</p>
              <Input 
                readOnly 
                value={redirectUri.redirectUri}
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <p className="text-xs text-muted-foreground">
                Use this URI when setting up your Are.na OAuth application
              </p>
            </div>
          )}

          <Button
            className="w-full h-12 text-lg"
            onClick={startAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <SiBookstack className="h-5 w-5 mr-2" />
            )}
            Connect with Are.na
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}