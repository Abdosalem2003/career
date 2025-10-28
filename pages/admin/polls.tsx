import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import {
  Plus,
  BarChart3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Sparkles,
} from "lucide-react";
import { PollWidget } from "@/components/poll-widget";
import { Switch } from "@/components/ui/switch";

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  active: boolean;
  createdAt: string;
}

export default function Polls() {
  return (
    <ProtectedRoute>
      <PollsContent />
    </ProtectedRoute>
  );
}

function PollsContent() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // Fetch polls
  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["/api/polls"],
    queryFn: async () => {
      const res = await fetch("/api/polls");
      if (!res.ok) throw new Error("Failed to fetch polls");
      return res.json();
    },
  });

  // Create poll mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create poll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description:
          language === "ar"
            ? "تم إنشاء الاستطلاع بنجاح"
            : "Poll created successfully",
      });
      setDialogOpen(false);
      setQuestion("");
      setOptions(["", ""]);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "فشل إنشاء الاستطلاع"
            : "Failed to create poll",
        variant: "destructive",
      });
    },
  });

  // Delete poll mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/polls/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete poll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description:
          language === "ar"
            ? "تم حذف الاستطلاع بنجاح"
            : "Poll deleted successfully",
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/polls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (!res.ok) throw new Error("Failed to update poll");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
  });

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    if (!question.trim()) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "يرجى إدخال سؤال الاستطلاع"
            : "Please enter poll question",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "يجب إضافة خيارين على الأقل"
            : "Please add at least 2 options",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      question,
      options: validOptions.map((text) => ({ text, votes: 0 })),
      active: true,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === "ar" ? "استطلاعات الرأي" : "Polls"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "ar"
              ? "إدارة استطلاعات الرأي العامة"
              : "Manage public polls"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "استطلاع جديد" : "New Poll"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {language === "ar" ? "إنشاء استطلاع جديد" : "Create New Poll"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Question */}
              <div>
                <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  {language === "ar" ? "السؤال" : "Question"}
                </Label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "ما هو سؤالك؟"
                      : "What's your question?"
                  }
                  className="h-12 rounded-xl border-gray-200 focus:border-blue-500"
                />
              </div>

              {/* Options */}
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  {language === "ar" ? "الخيارات" : "Options"}
                </Label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`${language === "ar" ? "خيار" : "Option"} ${
                          index + 1
                        }`}
                        className="h-11 rounded-xl border-gray-200"
                      />
                      {options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="rounded-xl"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="mt-3 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "ar" ? "إضافة خيار" : "Add Option"}
                </Button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-12"
                >
                  {language === "ar" ? "إنشاء" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-xl"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll: Poll) => (
          <Card
            key={poll.id}
            className="border-0 shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden"
          >
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {poll.question}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggleActiveMutation.mutate({
                        id: poll.id,
                        active: poll.active,
                      })
                    }
                    className="rounded-full"
                  >
                    {poll.active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(poll.id)}
                    className="rounded-full hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <PollWidget
                question={poll.question}
                options={poll.options}
                pollId={poll.id}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {polls.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed border-gray-300 rounded-2xl p-12">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === "ar"
                ? "لا توجد استطلاعات بعد"
                : "No polls yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === "ar"
                ? "ابدأ بإنشاء أول استطلاع رأي"
                : "Start by creating your first poll"}
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {language === "ar" ? "إنشاء استطلاع" : "Create Poll"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
