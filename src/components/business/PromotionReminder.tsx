
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Share2 } from 'lucide-react';

const PromotionReminder: React.FC = () => {
  return (
    <Card className="mb-8 bg-pacers-accent/10 border-pacers-accent/30">
      <CardContent className="pt-6">
        <div className="flex gap-4 items-start">
          <Share2 className="text-pacers-accent h-10 w-10 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Don't forget to share your runs!</h3>
            <p className="text-muted-foreground">
              The more you promote on social media or email, the more runners will show up. 
              Each run has a shareable link you can copy from its details page.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromotionReminder;
