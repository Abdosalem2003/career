import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { Vote, Users, CheckCircle } from "lucide-react";

interface PollWidgetProps {
  question: string;
  options: string[];
  pollId: string;
  votes?: number[];
  showResults?: boolean;
}

export function PollWidget({ question, options, pollId, votes = [], showResults = false }: PollWidgetProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hasVoted, setHasVoted] = useState(showResults);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentVotes, setCurrentVotes] = useState<number[]>(votes);

  // Initialize votes if not provided
  useEffect(() => {
    if (votes.length === options.length) {
      setCurrentVotes(votes);
    } else {
      setCurrentVotes(options.map(() => 0));
    }
  }, [votes, options]);

  const totalVotes = currentVotes.reduce((sum, count) => sum + count, 0);

  const voteMutation = useMutation({
    mutationFn: async (optionIndex: number) => {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ optionIndex }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to vote");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setHasVoted(true);
      if (data.poll && data.poll.votes) {
        setCurrentVotes(data.poll.votes);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/polls/active"] });
      toast({
        title: language === "ar" ? "✅ شكراً لك!" : "✅ Thank you!",
        description: language === "ar" ? "تم تسجيل صوتك بنجاح" : "Your vote has been recorded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: language === "ar" ? "فشل في تسجيل الصوت" : error.message || "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  const handleVote = (optionIndex: number) => {
    if (hasVoted || voteMutation.isPending) return;
    setSelectedOption(optionIndex);
    voteMutation.mutate(optionIndex);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      {/* iPhone-style Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-xl">
        {/* Header بتصميم iPhone */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Vote className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-white mb-1">{question}</h3>
              <p className="text-white/80 text-sm">
                {language === "ar" ? "شارك برأيك الآن" : "Share your opinion now"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          <div className="space-y-4">
            {options.map((option, index) => {
              const voteCount = currentVotes[index] || 0;
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
              const isSelected = selectedOption === index;

              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleVote(index)}
                    disabled={hasVoted || voteMutation.isPending}
                    className={`w-full p-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden ${
                      hasVoted 
                        ? "cursor-default" 
                        : "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                    } ${
                      isSelected && hasVoted
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : hasVoted
                        ? "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {/* Background Progress Bar */}
                    {hasVoted && (
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    
                    {/* Content */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Option Icon */}
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          isSelected && hasVoted
                            ? "bg-white/20 text-white"
                            : hasVoted
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                        }`}>
                          {hasVoted && isSelected ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            String.fromCharCode(65 + index) // A, B, C, D
                          )}
                        </div>
                        
                        {/* Option Text */}
                        <span className={`font-medium ${
                          isSelected && hasVoted
                            ? "text-white"
                            : "text-gray-900 dark:text-white"
                        }`}>
                          {option}
                        </span>
                      </div>
                      
                      {/* Results */}
                      {hasVoted && (
                        <div className={`text-right ${
                          isSelected ? "text-white" : "text-gray-600 dark:text-gray-400"
                        }`}>
                          <div className="text-sm font-bold">
                            {percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs opacity-75">
                            {voteCount} {language === "ar" ? "صوت" : "votes"}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {totalVotes.toLocaleString()} {language === "ar" ? "صوت" : "votes"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {language === "ar" ? "إجمالي المشاركين" : "Total participants"}
                  </div>
                </div>
              </div>
              
              {!hasVoted && (
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {language === "ar" ? "اختر إجابتك" : "Make your choice"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {language === "ar" ? "اضغط على الخيار" : "Tap an option"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {voteMutation.isPending && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {language === "ar" ? "جاري تسجيل صوتك..." : "Recording your vote..."}
                </span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {hasVoted && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 dark:text-green-400 font-medium">
                  {language === "ar" ? "شكراً لمشاركتك!" : "Thank you for participating!"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
