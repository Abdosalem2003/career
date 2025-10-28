import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: Date;
  type: "article" | "stream" | "meeting";
  color: string;
}

export function CalendarDropdown() {
  const { language } = useI18n();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: language === "ar" ? "نشر مقال جديد" : "Publish new article",
      date: new Date(2025, 9, 26),
      type: "article",
      color: "bg-blue-500",
    },
    {
      id: "2",
      title: language === "ar" ? "بث مباشر" : "Live stream",
      date: new Date(2025, 9, 27),
      type: "stream",
      color: "bg-red-500",
    },
    {
      id: "3",
      title: language === "ar" ? "اجتماع الفريق" : "Team meeting",
      date: new Date(2025, 9, 28),
      type: "meeting",
      color: "bg-green-500",
    },
  ]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const monthNames = language === "ar"
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayNames = language === "ar"
    ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarIcon className="h-4 w-4 mr-2" />
          {language === "ar" ? "التقويم" : "Calendar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="h-3 w-3 mr-2" />
            {language === "ar" ? "إضافة حدث" : "Add Event"}
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors relative group",
                    isTodayDate && "bg-blue-50 hover:bg-blue-100"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium text-center",
                      isTodayDate
                        ? "text-blue-600 font-bold"
                        : "text-gray-700"
                    )}
                  >
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "h-1 w-1 rounded-full",
                            event.color
                          )}
                          title={event.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="border-t p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {language === "ar" ? "الأحداث القادمة" : "Upcoming Events"}
          </h4>
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
              >
                <div className={cn("h-2 w-2 rounded-full", event.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {event.date.toLocaleDateString(
                      language === "ar" ? "ar-EG" : "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
