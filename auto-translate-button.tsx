import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SmartTranslator } from "@/lib/translation-services";
import { Languages, Loader2, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AutoTranslateButtonProps {
  sourceText: string;
  sourceLang?: 'en' | 'ar';
  targetLang?: 'en' | 'ar';
  onTranslated: (translatedText: string) => void;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  isHTML?: boolean;
}

export function AutoTranslateButton({
  sourceText,
  sourceLang = 'en',
  targetLang = 'ar',
  onTranslated,
  label,
  variant = "outline",
  size = "sm",
  disabled = false,
  isHTML = false,
}: AutoTranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText || sourceText.trim() === '') {
      toast({
        title: targetLang === 'ar' ? "⚠️ تحذير" : "⚠️ Warning",
        description: targetLang === 'ar' 
          ? "الرجاء إدخال نص للترجمة أولاً" 
          : "Please enter text to translate first",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);

    try {
      let translated: string;
      
      if (isHTML) {
        // ترجمة HTML مع الحفاظ على الوسوم
        translated = await SmartTranslator.translateHTML(sourceText, targetLang, sourceLang);
      } else {
        // ترجمة نص عادي
        translated = await SmartTranslator.translate(sourceText, targetLang, sourceLang);
      }

      if (translated && translated !== sourceText) {
        onTranslated(translated);
        toast({
          title: targetLang === 'ar' ? "✅ تمت الترجمة!" : "✅ Translated!",
          description: targetLang === 'ar' 
            ? "تم ترجمة النص بنجاح باستخدام الذكاء الاصطناعي 🤖" 
            : "Text translated successfully using AI 🤖",
          duration: 3000,
        });
      } else {
        toast({
          title: targetLang === 'ar' ? "⚠️ تحذير" : "⚠️ Warning",
          description: targetLang === 'ar' 
            ? "لم يتم العثور على ترجمة مختلفة" 
            : "No different translation found",
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: targetLang === 'ar' ? "❌ خطأ" : "❌ Error",
        description: targetLang === 'ar' 
          ? "فشلت الترجمة. يرجى المحاولة مرة أخرى" 
          : "Translation failed. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const defaultLabel = targetLang === 'ar' ? "ترجمة تلقائية" : "Auto Translate";
  const tooltipText = targetLang === 'ar' 
    ? "ترجمة تلقائية مجانية باستخدام Google Translate 🤖" 
    : "Free automatic translation using Google Translate 🤖";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleTranslate}
            disabled={disabled || isTranslating || !sourceText}
            className="gap-2"
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {targetLang === 'ar' ? "جاري الترجمة..." : "Translating..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {label || defaultLabel}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            {tooltipText}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// مكون مبسط للترجمة السريعة
export function QuickTranslateIcon({
  sourceText,
  sourceLang = 'en',
  targetLang = 'ar',
  onTranslated,
  disabled = false,
}: Omit<AutoTranslateButtonProps, 'label' | 'variant' | 'size'>) {
  return (
    <AutoTranslateButton
      sourceText={sourceText}
      sourceLang={sourceLang}
      targetLang={targetLang}
      onTranslated={onTranslated}
      variant="ghost"
      size="icon"
      disabled={disabled}
    />
  );
}
