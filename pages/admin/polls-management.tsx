import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Plus, 
  Trash2, 
  Eye, 
  Users, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Edit,
  Search,
  Download,
  Filter,
  Copy,
  ToggleLeft,
  ToggleRight,
  Calendar,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  active: boolean;
  createdAt: string;
  articleId?: string;
  articleTitle?: string;
}

export default function PollsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"date" | "votes" | "name">("date");
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""],
    articleId: "",
  });

  // Fetch all polls
  const { data: polls = [], isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
  });

  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete poll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف الاستطلاع بنجاح",
      });
    },
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create poll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      setIsCreateDialogOpen(false);
      setFormData({ question: "", options: ["", ""], articleId: "" });
      toast({
        title: "✅ تم الإنشاء",
        description: "تم إنشاء الاستطلاع بنجاح",
      });
    },
  });

  // Update poll mutation
  const updatePollMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/polls/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update poll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      setIsEditDialogOpen(false);
      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث الاستطلاع بنجاح",
      });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await fetch(`/api/polls/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active }),
      });
      if (!response.ok) throw new Error("Failed to toggle poll");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "✅ تم التحديث",
        description: "تم تغيير حالة الاستطلاع",
      });
    },
  });

  // Duplicate poll
  const duplicatePoll = (poll: Poll) => {
    setFormData({
      question: poll.question + " (نسخة)",
      options: [...poll.options],
      articleId: poll.articleId || "",
    });
    setIsCreateDialogOpen(true);
    toast({
      title: "📋 نسخ الاستطلاع",
      description: "تم نسخ البيانات، قم بالتعديل والحفظ",
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ["السؤال", "الخيارات", "الأصوات", "الحالة", "التاريخ"],
      ...polls.map((poll) => [
        poll.question,
        poll.options.join(" | "),
        poll.votes.reduce((a, b) => a + b, 0),
        poll.active ? "نشط" : "غير نشط",
        new Date(poll.createdAt).toLocaleDateString("ar-SA"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `polls_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    
    toast({
      title: "📥 تم التصدير",
      description: "تم تصدير البيانات إلى ملف CSV",
    });
  };

  // Filter and sort polls
  let filteredPolls = polls.filter((poll) => {
    const matchesSearch =
      poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.articleTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && poll.active) ||
      (filterStatus === "inactive" && !poll.active);
    
    return matchesSearch && matchesFilter;
  });

  // Sort polls
  filteredPolls = [...filteredPolls].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "votes") {
      const aVotes = a.votes.reduce((sum, v) => sum + v, 0);
      const bVotes = b.votes.reduce((sum, v) => sum + v, 0);
      return bVotes - aVotes;
    } else {
      return a.question.localeCompare(b.question, "ar");
    }
  });

  const totalVotes = polls.reduce((sum, poll) => 
    sum + poll.votes.reduce((a, b) => a + b, 0), 0
  );

  const activePolls = polls.filter(p => p.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              إدارة استطلاعات الرأي
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة وتتبع استطلاعات الرأي والتصويتات
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={exportToCSV}
              className="border-2 hover:bg-green-50 dark:hover:bg-green-950"
            >
              <Download className="h-5 w-5 ml-2" />
              تصدير CSV
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">
                      إجمالي الاستطلاعات
                    </p>
                    <h3 className="text-4xl font-bold">{polls.length}</h3>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">
                      استطلاعات نشطة
                    </p>
                    <h3 className="text-4xl font-bold">{activePolls}</h3>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">
                      إجمالي الأصوات
                    </p>
                    <h3 className="text-4xl font-bold">{totalVotes.toLocaleString()}</h3>
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative md:col-span-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="ابحث عن استطلاع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 h-12 text-lg border-0 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter by Status */}
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800 border-0">
                    <Filter className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="فلتر حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الاستطلاعات</SelectItem>
                    <SelectItem value="active">نشط فقط</SelectItem>
                    <SelectItem value="inactive">غير نشط فقط</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-800 border-0">
                    <BarChart3 className="h-4 w-4 ml-2" />
                    <SelectValue placeholder="ترتيب حسب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">التاريخ (الأحدث)</SelectItem>
                    <SelectItem value="votes">عدد الأصوات</SelectItem>
                    <SelectItem value="name">الاسم (أبجدياً)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Polls List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
              </CardContent>
            </Card>
          ) : filteredPolls.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  لا توجد استطلاعات
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  ابدأ بإنشاء استطلاع رأي جديد
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPolls.map((poll, index) => {
              const totalPollVotes = poll.votes.reduce((a, b) => a + b, 0);
              const maxVotes = Math.max(...poll.votes);

              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {poll.question}
                            </h3>
                            {poll.active ? (
                              <Badge className="bg-green-500 hover:bg-green-500">
                                <CheckCircle2 className="h-3 w-3 ml-1" />
                                نشط
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 ml-1" />
                                غير نشط
                              </Badge>
                            )}
                          </div>
                          {poll.articleTitle && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              المقال: {poll.articleTitle}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            تاريخ الإنشاء: {new Date(poll.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Toggle Active */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                              poll.active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Toggle clicked for poll:', poll.id, 'Current active:', poll.active);
                              toggleActiveMutation.mutate({ id: poll.id, active: !poll.active });
                            }}
                            title={poll.active ? "إيقاف الاستطلاع" : "تفعيل الاستطلاع"}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {toggleActiveMutation.isPending ? (
                              <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                            ) : poll.active ? (
                              <ToggleRight className="h-5 w-5" />
                            ) : (
                              <ToggleLeft className="h-5 w-5" />
                            )}
                          </Button>

                          {/* View */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setIsViewDialogOpen(true);
                            }}
                            title="معاينة"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-600"
                            onClick={() => {
                              setSelectedPoll(poll);
                              setFormData({
                                question: poll.question,
                                options: poll.options,
                                articleId: poll.articleId || "",
                              });
                              setIsEditDialogOpen(true);
                            }}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Duplicate */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600"
                            onClick={() => duplicatePoll(poll)}
                            title="نسخ"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 dark:hover:bg-red-900 text-red-600"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا الاستطلاع؟")) {
                                deletePollMutation.mutate(poll.id);
                              }
                            }}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Poll Results */}
                      <div className="space-y-3">
                        {poll.options.map((option, idx) => {
                          const votes = poll.votes[idx] || 0;
                          const percentage = totalPollVotes > 0 ? (votes / totalPollVotes) * 100 : 0;
                          const isWinning = votes === maxVotes && votes > 0;

                          return (
                            <div key={idx} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {option}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {votes.toLocaleString()} صوت
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    {percentage.toFixed(1)}%
                                  </span>
                                  {isWinning && (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                              </div>
                              <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5, delay: index * 0.1 }}
                                  className={`absolute inset-y-0 right-0 rounded-full ${
                                    isWinning
                                      ? 'bg-gradient-to-l from-green-500 to-emerald-500'
                                      : 'bg-gradient-to-l from-blue-500 to-purple-500'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Votes */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4" />
                            <span>إجمالي المشاركين</span>
                          </div>
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {totalPollVotes.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">إنشاء استطلاع جديد</DialogTitle>
              <DialogDescription>
                أضف سؤال الاستطلاع والخيارات المتاحة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>السؤال</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="ما هو سؤال الاستطلاع؟"
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label>الخيارات</Label>
                <div className="space-y-2 mt-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        placeholder={`الخيار ${index + 1}`}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOptions = formData.options.filter((_, i) => i !== index);
                            setFormData({ ...formData, options: newOptions });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, options: [...formData.options, ""] })}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة خيار
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => createPollMutation.mutate(formData)}
                disabled={!formData.question || formData.options.filter(o => o).length < 2}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                إنشاء الاستطلاع
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">تعديل الاستطلاع</DialogTitle>
              <DialogDescription>
                قم بتعديل سؤال الاستطلاع والخيارات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>السؤال</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label>الخيارات</Label>
                <div className="space-y-2 mt-2">
                  {formData.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`الخيار ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                onClick={() => selectedPoll && updatePollMutation.mutate({ 
                  id: selectedPoll.id, 
                  data: formData 
                })}
                className="bg-gradient-to-r from-yellow-500 to-orange-500"
              >
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">معاينة الاستطلاع</DialogTitle>
            </DialogHeader>
            {selectedPoll && (
              <div className="space-y-6 py-4">
                <div>
                  <h3 className="text-xl font-bold mb-4">{selectedPoll.question}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={selectedPoll.active ? "bg-green-500" : "bg-gray-500"}>
                      {selectedPoll.active ? "نشط" : "غير نشط"}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 ml-1" />
                      {new Date(selectedPoll.createdAt).toLocaleDateString("ar-SA")}
                    </Badge>
                    {selectedPoll.articleTitle && (
                      <Badge variant="outline">
                        <FileText className="h-3 w-3 ml-1" />
                        {selectedPoll.articleTitle}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedPoll.options.map((option, idx) => {
                    const votes = selectedPoll.votes[idx] || 0;
                    const total = selectedPoll.votes.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (votes / total) * 100 : 0;
                    const isWinning = votes === Math.max(...selectedPoll.votes) && votes > 0;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{option}</span>
                          <div className="flex items-center gap-2">
                            <span>{votes} صوت</span>
                            <span className="font-bold text-blue-600">{percentage.toFixed(1)}%</span>
                            {isWinning && <TrendingUp className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isWinning
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <span className="font-bold">إجمالي المشاركين:</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedPoll.votes.reduce((a, b) => a + b, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
