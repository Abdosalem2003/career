import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, Download, Share2, Eye } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface ChartDataPoint {
  date: string;
  value: number;
  change?: number;
}

interface ProfessionalChartProps {
  title: string;
  data: ChartDataPoint[];
  currency?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  highValue?: number;
  lowValue?: number;
  currentValue?: number;
  averageValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
}

export function ProfessionalChart({
  title,
  data,
  currency = 'EGP',
  timeRange = '30d',
  onTimeRangeChange,
  highValue,
  lowValue,
  currentValue,
  averageValue,
  trend = 'neutral',
  trendPercentage = 0,
}: ProfessionalChartProps) {
  const { language, dir } = useI18n();
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calculate chart dimensions
  const chartWidth = 1200;
  const chartHeight = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate min and max values
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const padding_value = range * 0.1;

  const yMin = minValue - padding_value;
  const yMax = maxValue + padding_value;
  const yRange = yMax - yMin;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.value - yMin) / yRange) * innerHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate gradient area
  const areaData = `${pathData} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`;

  // Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = yMin + (yRange / yAxisSteps) * i;
    return value;
  });

  // X-axis labels (every nth point)
  const xAxisStep = Math.ceil(data.length / 8);
  const xAxisLabels = data
    .map((d, i) => (i % xAxisStep === 0 ? { date: d.date, index: i } : null))
    .filter(Boolean);

  const handleRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };

  const formatValue = (value: number) => {
    return `${currency} ${value.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Title and Stats */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-600 to-purple-600" />
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </CardTitle>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Current Value */}
              {currentValue !== undefined && (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'القيمة الحالية' : 'Current Value'}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatValue(currentValue)}
                  </p>
                </div>
              )}

              {/* High Value */}
              {highValue !== undefined && (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'أعلى سعر' : 'High'}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                    {formatValue(highValue)}
                  </p>
                </div>
              )}

              {/* Low Value */}
              {lowValue !== undefined && (
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {language === 'ar' ? 'أقل سعر' : 'Low'}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-red-600 dark:text-red-400">
                    {formatValue(lowValue)}
                  </p>
                </div>
              )}

              {/* Trend */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'ar' ? 'الاتجاه' : 'Trend'}
                </p>
                <div className="flex items-center gap-1">
                  {trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <div className="h-5 w-5 text-gray-600 dark:text-gray-400">—</div>
                  )}
                  <span className={`text-lg font-bold ${
                    trend === 'up' ? 'text-green-600 dark:text-green-400' :
                    trend === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Range Buttons */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRangeChange(range)}
                className={selectedRange === range ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' : ''}
              >
                {range === '7d' ? '7 ' + (language === 'ar' ? 'أيام' : 'Days') :
                 range === '30d' ? '30 ' + (language === 'ar' ? 'يوم' : 'Days') :
                 range === '90d' ? '90 ' + (language === 'ar' ? 'يوم' : 'Days') :
                 '1 ' + (language === 'ar' ? 'سنة' : 'Year')}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Chart */}
      <CardContent className="pt-8 pb-6">
        <div className="overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {yAxisLabels.map((value, i) => {
              const y = padding.top + innerHeight - ((value - yMin) / yRange) * innerHeight;
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="5,5"
                    strokeOpacity="0.5"
                    className="dark:stroke-gray-700"
                  />
                </g>
              );
            })}

            {/* Y-Axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke="#d1d5db"
              strokeWidth="2"
              className="dark:stroke-gray-600"
            />

            {/* X-Axis */}
            <line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={chartWidth - padding.right}
              y2={padding.top + innerHeight}
              stroke="#d1d5db"
              strokeWidth="2"
              className="dark:stroke-gray-600"
            />

            {/* Y-Axis Labels */}
            {yAxisLabels.map((value, i) => {
              const y = padding.top + innerHeight - ((value - yMin) / yRange) * innerHeight;
              return (
                <text
                  key={`y-label-${i}`}
                  x={padding.left - 15}
                  y={y + 5}
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                  fontWeight="500"
                >
                  {(value / 1000).toFixed(1)}K
                </text>
              );
            })}

            {/* X-Axis Labels */}
            {xAxisLabels.map((label, i) => {
              const point = points[label.index];
              return (
                <text
                  key={`x-label-${i}`}
                  x={point.x}
                  y={padding.top + innerHeight + 25}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                  fontWeight="500"
                >
                  {label.date}
                </text>
              );
            })}

            {/* Area Fill */}
            <path
              d={areaData}
              fill="url(#chartGradient)"
              className="drop-shadow-sm"
            />

            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-md"
            />

            {/* Data Points */}
            {points.map((point, i) => (
              <g key={`point-${i}`}>
                {/* Hover Circle */}
                {hoveredPoint === i && (
                  <>
                    {/* Vertical Line */}
                    <line
                      x1={point.x}
                      y1={padding.top}
                      x2={point.x}
                      y2={padding.top + innerHeight}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.5"
                    />
                    {/* Tooltip Background */}
                    <rect
                      x={point.x - 70}
                      y={point.y - 50}
                      width="140"
                      height="45"
                      rx="8"
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      className="drop-shadow-lg dark:fill-gray-800 dark:stroke-blue-400"
                    />
                    {/* Tooltip Text */}
                    <text
                      x={point.x}
                      y={point.y - 28}
                      textAnchor="middle"
                      className="text-sm font-bold fill-blue-600 dark:fill-blue-400"
                    >
                      {formatValue(point.value)}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 10}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                    >
                      {point.date}
                    </text>
                  </>
                )}

                {/* Point Circle */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === i ? 6 : 4}
                  fill={hoveredPoint === i ? '#3b82f6' : 'white'}
                  stroke={hoveredPoint === i ? '#3b82f6' : '#8b5cf6'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>
        </div>
      </CardContent>

      {/* Footer */}
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Eye className="h-4 w-4" />
          <span>{language === 'ar' ? 'مرر الماوس على النقاط لعرض التفاصيل' : 'Hover over points for details'}</span>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            {language === 'ar' ? 'تحميل' : 'Download'}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            {language === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============ Example Usage Component ============
export function ChartExample() {
  const { language } = useI18n();

  // Generate sample data
  const generateData = () => {
    const data: ChartDataPoint[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const value = 6200 + Math.sin(i / 5) * 200 + Math.random() * 100;
      data.push({
        date: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
          month: 'short',
          day: 'numeric',
        }),
        value: Math.round(value),
      });
    }
    return data;
  };

  const data = generateData();
  const values = data.map(d => d.value);
  const highValue = Math.max(...values);
  const lowValue = Math.min(...values);
  const currentValue = values[values.length - 1];
  const averageValue = Math.round(values.reduce((a, b) => a + b) / values.length);

  return (
    <ProfessionalChart
      title={language === 'ar' ? 'التحليل المالي المتقدم' : 'Advanced Financial Analysis'}
      data={data}
      currency="EGP"
      timeRange="30d"
      highValue={highValue}
      lowValue={lowValue}
      currentValue={currentValue}
      averageValue={averageValue}
      trend="up"
      trendPercentage={3.5}
    />
  );
}
