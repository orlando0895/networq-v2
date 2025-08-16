import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Support = () => {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support</h1>
          <p className="text-muted-foreground">
            Get help with your Networq account
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              For support, please contact us at
            </p>
            <a 
              href="mailto:support@networq.app" 
              className="text-primary hover:underline text-lg font-medium"
            >
              support@networq.app
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};