import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SuccessCelebrationProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function SuccessCelebration({ show, onClose, title, message }: SuccessCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (show) {
      // تأخير ظهور المحتوى قليلاً
      setTimeout(() => setShowContent(true), 300);

      // إطلاق الألعاب النارية
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // إطلاق من اليسار
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        // إطلاق من اليمين
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // شرائط ملونة تنزل من الأعلى
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 90,
          spread: 45,
          origin: { x: 0.5, y: 0 },
          colors: colors,
          shapes: ['square'],
          gravity: 0.8,
          scalar: 1.2,
          drift: 0,
          ticks: 200,
          zIndex: 9999
        });
      }, 500);

      // إغلاق تلقائي بعد 4 ثواني
      const closeTimeout = setTimeout(() => {
        onClose();
        setShowContent(false);
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(closeTimeout);
      };
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] flex items-center justify-center"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.6 
              }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl opacity-50" />

              {/* Sparkles Animation */}
              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              </div>

              <div className="absolute top-4 left-4">
                <motion.div
                  animate={{ 
                    rotate: [360, 0],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: showContent ? 1 : 0 }}
                  transition={{ 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="mb-6 flex justify-center"
                >
                  <div className="relative">
                    {/* Pulsing Background */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-green-500 rounded-full blur-xl"
                    />
                    
                    {/* Icon */}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ 
                        duration: 1,
                        delay: 0.5,
                        ease: "easeOut"
                      }}
                    >
                      <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10" strokeWidth={2} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                  transition={{ delay: 0.6 }}
                  className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                  transition={{ delay: 0.8 }}
                  className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
                >
                  {message}
                </motion.p>

                {/* Decorative Elements */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 flex justify-center gap-2"
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
