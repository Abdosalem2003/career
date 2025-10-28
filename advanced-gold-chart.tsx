import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CandlestickData {
  x: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface GoldKarat {
  name: string;
  nameEn: string;
  key: string;
  color: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface AdvancedGoldChartProps {
  goldData: any;
  currency: string;
}

export function AdvancedGoldChart({ goldData, currency }: AdvancedGoldChartProps) {
  const { language } = useI18n();
  const { theme } = useTheme();
  const darkMode = theme === "dark";
  
  const [selectedKarat, setSelectedKarat] = useState<string>("gold24k");
  const [timeRange, setTimeRange] = useState<string>("7");
  const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick");
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);

  const karats: GoldKarat[] = [
    {
      name: "عيار 24",
      nameEn: "24K",
      key: "gold24k",
      color: "from-yellow-400 to-amber-500",
      currentPrice: goldData?.gold24k?.price || 0,
      change: goldData?.gold24k?.change || 0,
      changePercent: goldData?.gold24k?.changePercent || 0,
    },
    {
      name: "عيار 22",
      nameEn: "22K",
      key: "gold22k",
      color: "from-orange-400 to-yellow-500",
      currentPrice: goldData?.gold22k?.price || 0,
      change: goldData?.gold22k?.change || 0,
      changePercent: goldData?.gold22k?.changePercent || 0,
    },
    {
      name: "عيار 21",
      nameEn: "21K",
      key: "gold21k",
      color: "from-amber-400 to-orange-500",
      currentPrice: goldData?.gold21k?.price || 0,
      change: goldData?.gold21k?.change || 0,
      changePercent: goldData?.gold21k?.changePercent || 0,
    },
    {
      name: "عيار 18",
      nameEn: "18K",
      key: "gold18k",
      color: "from-yellow-500 to-amber-600",
      currentPrice: goldData?.gold18k?.price || 0,
      change: goldData?.gold18k?.change || 0,
      changePercent: goldData?.gold18k?.changePercent || 0,
    },
    {
      name: "الجنيه",
      nameEn: "Pound",
      key: "goldPound",
      color: "from-amber-500 to-yellow-600",
      currentPrice: goldData?.goldPound?.price || 0,
      change: goldData?.goldPound?.change || 0,
      changePercent: goldData?.goldPound?.changePercent || 0,
    },
  ];

  // Generate realistic candlestick data with smooth transitions
  useEffect(() => {
    if (!goldData) return;
    
    const days = parseInt(timeRange);
    const data: CandlestickData[] = [];
    const basePrice = goldData[selectedKarat]?.price || 100;
    
    // Start with a realistic opening price
    let previousClose = basePrice * (0.95 + Math.random() * 0.1);
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic OHLC data with market-like behavior
      const volatility = basePrice * 0.02; // 2% volatility
      const trend = (Math.random() - 0.48) * volatility; // Slight upward bias
      
      const open = previousClose;
      const close = open + trend + (Math.random() - 0.5) * volatility;
      
      // High and low based on open and close with realistic wicks
      const wickSize = volatility * (0.3 + Math.random() * 0.4);
      const high = Math.max(open, close) + wickSize;
      const low = Math.min(open, close) - wickSize;
      
      data.push({
        x: date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", { 
          month: 'short', 
          day: 'numeric' 
        }),
        open,
        high,
        low,
        close,
      });
      
      previousClose = close; // Smooth continuation
    }
    
    setCandlestickData(data);
  }, [goldData, selectedKarat, timeRange, language]);

  // Prepare chart data - Enhanced candlestick visualization
  const chartData = {
    labels: candlestickData.map(d => d.x),
    datasets: [
      // High-Low range (shadows/wicks)
      {
        label: language === "ar" ? "النطاق" : "Range",
        data: candlestickData.map(d => d.high),
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        pointRadius: 0,
        fill: '+1',
      },
      {
        label: language === "ar" ? "النطاق السفلي" : "Lower Range",
        data: candlestickData.map(d => d.low),
        borderColor: 'transparent',
        backgroundColor: darkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(148, 163, 184, 0.1)',
        pointRadius: 0,
        fill: false,
      },
      // Main price line (close prices)
      {
        label: language === "ar" ? "السعر" : "Price",
        data: candlestickData.map(d => d.close),
        borderColor: darkMode ? 'rgb(251, 191, 36)' : 'rgb(234, 179, 8)',
        backgroundColor: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(234, 179, 8, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: candlestickData.map(d => 
          d.close >= d.open 
            ? (darkMode ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)')
            : (darkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)')
        ),
        pointBorderColor: candlestickData.map(d => 
          d.close >= d.open 
            ? (darkMode ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)')
            : (darkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)')
        ),
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        segment: {
          borderColor: (ctx: any) => {
            const index = ctx.p0DataIndex;
            if (!candlestickData[index] || !candlestickData[index + 1]) return darkMode ? 'rgb(251, 191, 36)' : 'rgb(234, 179, 8)';
            const current = candlestickData[index];
            const next = candlestickData[index + 1];
            return next.close >= current.close
              ? (darkMode ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)')
              : (darkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)');
          },
          borderWidth: 3,
        },
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        titleColor: darkMode ? '#fff' : '#000',
        bodyColor: darkMode ? '#fff' : '#000',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const index = context.dataIndex;
            const candle = candlestickData[index];
            if (!candle) return '';
            
            const trend = candle.close >= candle.open 
              ? (language === "ar" ? "صاعد ▲" : "Bullish ▲")
              : (language === "ar" ? "هابط ▼" : "Bearish ▼");
            
            return [
              `${trend}`,
              `${language === "ar" ? "فتح" : "Open"}: ${currency} ${candle.open.toFixed(2)}`,
              `${language === "ar" ? "أعلى" : "High"}: ${currency} ${candle.high.toFixed(2)}`,
              `${language === "ar" ? "أدنى" : "Low"}: ${currency} ${candle.low.toFixed(2)}`,
              `${language === "ar" ? "إغلاق" : "Close"}: ${currency} ${candle.close.toFixed(2)}`,
            ];
          }
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          callback: function(value: any) {
            return `${currency} ${Number(value).toFixed(0)}`;
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          maxRotation: 45,
          minRotation: 45,
        },
      }
    }
  };

  const selectedKaratData = karats.find(k => k.key === selectedKarat);
  const isPositive = (selectedKaratData?.change || 0) >= 0;

  return (
    <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-2xl overflow-hidden`}>
      <CardHeader className={`${darkMode ? 'bg-gradient-to-r from-gray-900 to-gray-800' : 'bg-gradient-to-r from-gray-50 to-gray-100'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedKaratData?.color} shadow-lg`}>
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className={`text-xl lg:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {language === "ar" ? "التحليل البياني المتقدم" : "Advanced Chart Analysis"}
              </CardTitle>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === "ar" ? "نظام الشموع اليابانية الاحترافي" : "Professional Candlestick System"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 lg:p-6">
        {/* Karat Selector - Stock Market Style - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
          {karats.map((karat) => {
            const isSelected = selectedKarat === karat.key;
            const isKaratPositive = karat.change >= 0;
            
            return (
              <button
                key={karat.key}
                onClick={() => setSelectedKarat(karat.key)}
                className={`p-3 sm:p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                  isSelected
                    ? `bg-gradient-to-br ${karat.color} text-white shadow-lg scale-105 ring-2 ring-offset-2 ${darkMode ? 'ring-offset-gray-800' : 'ring-offset-white'} ring-yellow-400`
                    : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">
                  {language === "ar" ? karat.name : karat.nameEn}
                </div>
                <div className={`text-base sm:text-lg lg:text-xl font-bold ${isSelected ? 'text-white' : darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {currency}
                </div>
                <div className={`text-lg sm:text-xl lg:text-2xl font-black ${isSelected ? 'text-white' : darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {karat.currentPrice.toFixed(2)}
                </div>
                <div className={`text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 mt-1 sm:mt-2 ${
                  isKaratPositive ? (isSelected ? 'text-green-100' : 'text-green-500') : (isSelected ? 'text-red-100' : 'text-red-500')
                }`}>
                  {isKaratPositive ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                  {isKaratPositive ? '+' : ''}{karat.changePercent.toFixed(2)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Market Stats - Stock Exchange Style - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}`}>
            <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {language === "ar" ? "أعلى سعر" : "Highest"}
            </p>
            <p className={`text-base sm:text-lg lg:text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {currency} {Math.max(...candlestickData.map(d => d.high)).toFixed(2)}
            </p>
          </div>
          
          <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-red-50'} border-l-4 border-red-500`}>
            <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {language === "ar" ? "أدنى سعر" : "Lowest"}
            </p>
            <p className={`text-base sm:text-lg lg:text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {currency} {Math.min(...candlestickData.map(d => d.low)).toFixed(2)}
            </p>
          </div>
          
          <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border-l-4 border-purple-500`}>
            <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {language === "ar" ? "التغير" : "Change"}
            </p>
            <p className={`text-base sm:text-lg lg:text-xl font-bold ${isPositive ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
              {isPositive ? '+' : ''}{selectedKaratData?.change.toFixed(2)}
            </p>
          </div>
          
          <div className={`p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-amber-50'} border-l-4 border-amber-500`}>
            <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
              {language === "ar" ? "التقلب" : "Volatility"}
            </p>
            <p className={`text-base sm:text-lg lg:text-xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {((Math.max(...candlestickData.map(d => d.high)) - Math.min(...candlestickData.map(d => d.low))) / Math.min(...candlestickData.map(d => d.low)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["7", "30", "90", "180", "365"].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
              className={`${
                timeRange === days
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                  : darkMode
                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              {days === "7" ? (language === "ar" ? "7 أيام" : "7D") :
               days === "30" ? (language === "ar" ? "شهر" : "1M") :
               days === "90" ? (language === "ar" ? "3 أشهر" : "3M") :
               days === "180" ? (language === "ar" ? "6 أشهر" : "6M") :
               (language === "ar" ? "سنة" : "1Y")}
            </Button>
          ))}
        </div>

        {/* Chart - Responsive */}
        <div className={`h-[300px] sm:h-[400px] lg:h-[500px] p-3 sm:p-4 rounded-xl ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          {candlestickData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              <p className={`text-base sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === "ar" ? "جاري تحميل البيانات..." : "Loading data..."}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === "ar" ? "صاعد" : "Bullish"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === "ar" ? "هابط" : "Bearish"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-yellow-500" />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === "ar" ? "نظام الشموع اليابانية" : "Candlestick Pattern"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
