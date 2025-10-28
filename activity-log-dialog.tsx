// نموذج سجل النشاطات
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, MapPin, Calendar, FileText, User, Settings, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  lastLogin?: string;
  lastIP?: string;
  loginCount?: number;
  createdAt: string;
}

interface ActivityLogDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

interface ActivityLog {
  id: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export function ActivityLogDialog({ user, open, onClose }: ActivityLogDialogProps) {
  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: [`/api/admin/users/${user.id}/activity`],
    enabled: open,
  });

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return Clock;
    if (action.includes('create')) return FileText;
    if (action.includes('edit') || action.includes('update')) return Settings;
    if (action.includes('delete')) return Trash2;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (action.includes('create')) return 'bg-green-100 text-green-800 border-green-300';
    if (action.includes('edit') || action.includes('update')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (action.includes('delete')) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span>سجل نشاطات {user.name}</span>
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            عرض جميع الأنشطة والعمليات التي قام بها المستخدم
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">آخر تسجيل دخول</p>
                  <p className="text-lg font-bold text-blue-900">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                      : 'لم يسجل دخول'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">عدد مرات الدخول</p>
                  <p className="text-lg font-bold text-green-900">{user.loginCount || 0}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-700 font-medium">آخر IP</p>
                  <p className="text-lg font-bold text-purple-900">{user.lastIP || 'غير متوفر'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900 mb-4">سجل الأنشطة الأخيرة</h3>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">جاري تحميل السجل...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const Icon = getActionIcon(activity.action);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-md transition-all"
                    >
                      <div className={`p-3 rounded-xl ${getActionColor(activity.action)} border-2`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">{activity.action}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 ml-1" />
                            {new Date(activity.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {activity.resourceType && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {activity.resourceType}
                            </span>
                          )}
                          {activity.ipAddress && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {activity.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">لا توجد أنشطة مسجلة حتى الآن</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
