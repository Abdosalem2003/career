import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function MatchesWidget() {
  const { language } = useI18n();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          {language === "ar" ? "المباريات الرياضية" : "Sports Matches"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {language === "ar" 
            ? "سيتم عرض المباريات قريباً" 
            : "Matches will be displayed soon"}
        </div>
      </CardContent>
    </Card>
  );
}
