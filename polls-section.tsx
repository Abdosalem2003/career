import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollWidget } from "./poll-widget";
import { Vote, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  articleTitle: string;
  articleSlug: string;
}

export function PollsSection() {
  const { language } = useI18n();

  const { data: polls = [], isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls/active"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-500" />
            {language === "ar" ? "استطلاعات الرأي" : "Polls"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return null; // Don't show section if no polls
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Vote className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === "ar" ? "استطلاعات الرأي" : "Opinion Polls"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === "ar" ? "شارك برأيك في القضايا المهمة" : "Share your opinion on important issues"}
          </p>
        </div>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {polls.map((poll) => (
          <div key={poll.id} className="space-y-3">
            {/* Article Title */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{poll.articleTitle}</span>
            </div>
            
            {/* Poll Widget */}
            <PollWidget
              question={poll.question}
              options={poll.options}
              pollId={poll.id}
              votes={poll.votes}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
