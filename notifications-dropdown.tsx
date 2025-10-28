import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Bell, Check, X, Eye, MessageSquare, UserPlus, FileText, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "article" | "comment" | "user" | "stream";
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  color: string;
}

export function NotificationsDropdown() {
  const { language } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "article",
      title: language === "ar" ? "مقال جديد" : "New Article",
      message: language === "ar" ? "تم نشر مقال جديد: قمة سياسية تاريخية" : "New article published: Historic Political Summit",
      time: language === "ar" ? "منذ 5 دقائق" : "5 minutes ago",
      read: false,
      icon: FileText,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: "2",
      type: "comment",
      title: language === "ar" ? "تعليق جديد" : "New Comment",
      message: language === "ar" ? "أحمد علق على مقالك" : "Ahmed commented on your article",
      time: language === "ar" ? "منذ 15 دقيقة" : "15 minutes ago",
      read: false,
      icon: MessageSquare,
      color: "text-green-500 bg-green-50",
    },
    {
      id: "3",
      type: "user",
      title: language === "ar" ? "مستخدم جديد" : "New User",
      message: language === "ar" ? "انضم مستخدم جديد للموقع" : "New user joined the site",
      time: language === "ar" ? "منذ ساعة" : "1 hour ago",
      read: false,
      icon: UserPlus,
      color: "text-purple-500 bg-purple-50",
    },
    {
      id: "4",
      type: "stream",
      title: language === "ar" ? "بث مباشر" : "Live Stream",
      message: language === "ar" ? "بدأ بث مباشر جديد" : "New live stream started",
      time: language === "ar" ? "منذ ساعتين" : "2 hours ago",
      read: true,
      icon: Radio,
      color: "text-red-500 bg-red-50",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          {language === "ar" ? "الإشعارات" : "Notifications"}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-1.5 py-0.5 text-xs min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h3 className="font-semibold text-gray-900">
              {language === "ar" ? "الإشعارات" : "Notifications"}
            </h3>
            <p className="text-xs text-gray-500">
              {unreadCount > 0
                ? language === "ar"
                  ? `${unreadCount} غير مقروءة`
                  : `${unreadCount} unread`
                : language === "ar"
                ? "لا توجد إشعارات جديدة"
                : "No new notifications"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              {language === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 text-center">
                {language === "ar"
                  ? "لا توجد إشعارات"
                  : "No notifications"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors group relative",
                    !notification.read && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        notification.color
                      )}
                    >
                      <notification.icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {notification.time}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 px-2 text-xs text-red-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              {language === "ar" ? "عرض جميع الإشعارات" : "View all notifications"}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
