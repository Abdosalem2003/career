
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileCheck, UserPlus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string };
}

export default function AdminAuditLogs() {
  const { language } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: logs = [] } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
    queryFn: async () => [],
  });

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create": return <UserPlus className="h-4 w-4 text-green-500" />;
      case "update": return <Edit className="h-4 w-4 text-blue-500" />;
      case "delete": return <Trash2 className="h-4 w-4 text-red-500" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      create: { label: language === "ar" ? "إنشاء" : "Create", color: "default" },
      update: { label: language === "ar" ? "تحديث" : "Update", color: "secondary" },
      delete: { label: language === "ar" ? "حذف" : "Delete", color: "destructive" },
    };
    const variant = variants[action] || { label: action, color: "outline" };
    return <Badge variant={variant.color as any}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === "ar" ? "سجل المراجعة" : "Audit Logs"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar" ? "تتبع جميع الإجراءات والتغييرات في النظام" : "Track all actions and changes in the system"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "إجمالي الأحداث" : "Total Events"}
            </div>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "اليوم" : "Today"}
            </div>
            <div className="text-2xl font-bold">
              {logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "المستخدمون النشطون" : "Active Users"}
            </div>
            <div className="text-2xl font-bold">
              {new Set(logs.map(l => l.userId)).size}
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في السجلات..." : "Search logs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                <SelectItem value="create">{language === "ar" ? "إنشاء" : "Create"}</SelectItem>
                <SelectItem value="update">{language === "ar" ? "تحديث" : "Update"}</SelectItem>
                <SelectItem value="delete">{language === "ar" ? "حذف" : "Delete"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "الإجراء" : "Action"}</TableHead>
                <TableHead>{language === "ar" ? "المستخدم" : "User"}</TableHead>
                <TableHead>{language === "ar" ? "المورد" : "Resource"}</TableHead>
                <TableHead>{language === "ar" ? "عنوان IP" : "IP Address"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{log.user?.name || log.userId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.resource}</div>
                      {log.resourceId && (
                        <code className="text-xs text-muted-foreground">{log.resourceId.substring(0, 8)}</code>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{log.ipAddress || "-"}</code>
                  </TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
