"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from "next-themes";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useTranslation } from "@/lib/i18n";
import { useCurrentDecimalSeparator } from "@/lib/hooks";
import { theme } from "@/lib/theme";
import { format, parseISO } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  date: string; // ISO string
  amount: number;
}

interface TrendChartProps {
  data: TrendData[];
  height?: string;
  className?: string;
}

export function TrendChart({ 
  data, 
  height = "300px",
  className = ""
}: TrendChartProps) {
  const { theme: currentTheme } = useTheme();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { t } = useTranslation();

  const palette = currentTheme === 'dark' ? theme.dark : theme.light;
  const textColor = palette.foreground.hex;
  const tooltipBg = palette.card.background.hex;
  const borderColor = palette.border.hex;
  const mutedColor = palette.muted.foreground.hex;

  // Aggregate data by date
  const aggregated = data.reduce((acc, curr) => {
    // Extract YYYY-MM-DD from ISO string
    const dateKey = curr.date.substring(0, 10);
    acc[dateKey] = (acc[dateKey] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Sort dates (YYYY-MM-DD strings can be sorted alphabetically)
  const sortedDateKeys = Object.keys(aggregated).sort();
  const sortedLabels = sortedDateKeys.map(key => format(parseISO(key), "MMM dd"));
  const sortedData = sortedDateKeys.map(key => aggregated[key]);

  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: t('dailySpending') || 'Daily Spending',
        data: sortedData,
        borderColor: theme.brand.accent.hex,
        backgroundColor: `${theme.brand.accent.hex}33`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: theme.brand.accent.hex,
        pointBorderColor: palette.card.background.hex,
        pointHoverBackgroundColor: palette.card.background.hex,
        pointHoverBorderColor: theme.brand.accent.hex,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: borderColor,
              borderWidth: 1,
              cornerRadius: 12,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: function(context: TooltipItem<"line">) {
                  const value = context.parsed.y;
                  return formatMoney(value, undefined, decimalSeparator);
                },
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: mutedColor,
                font: {
                  size: 11,
                },
                maxRotation: 45,
                autoSkip: true,
                maxTicksLimit: 7,
              },
              border: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              border: {
                display: false,
              },
              grid: {
                color: currentTheme === 'dark' ? 'rgba(247,249,252,0.06)' : 'rgba(7,9,25,0.06)',
                lineWidth: 1,
                drawTicks: false,
              },
              ticks: {
                color: mutedColor,
                font: {
                  size: 10,
                },
                callback: function(value) {
                  return formatMoney(value as number, undefined, decimalSeparator);
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'index' as const,
          },
        }}
      />
    </div>
  );
}
