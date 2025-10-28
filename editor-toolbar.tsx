/**
 * Custom Quill Toolbar Component
 * شريط أدوات محرر Quill المخصص
 */

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Underline, Strikethrough, Code, Quote,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link2, Image, Video, Undo, Redo, Save, Eye, Sparkles
} from "lucide-react";

interface EditorToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  onAIAssist?: () => void;
  language: string;
}

export function EditorToolbar({ onSave, onPreview, onAIAssist, language }: EditorToolbarProps) {
  return (
    <div className="border-b bg-gray-50 dark:bg-gray-900 p-2 flex items-center gap-2 flex-wrap">
      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-1" />
          {language === "ar" ? "حفظ" : "Save"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-1" />
          {language === "ar" ? "معاينة" : "Preview"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onAIAssist}>
          <Sparkles className="h-4 w-4 mr-1" />
          {language === "ar" ? "مساعد AI" : "AI Assist"}
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Quill Toolbar Container */}
      <div id="quill-toolbar" className="flex-1">
        {/* Quill will inject its toolbar here */}
      </div>
    </div>
  );
}
