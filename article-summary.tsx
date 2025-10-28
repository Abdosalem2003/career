import { FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface ArticleSummaryProps {
  excerpt: string;
  className?: string;
}

export function ArticleSummary({ excerpt, className }: ArticleSummaryProps) {
  const { language } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn('relative', className)}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {excerpt}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
