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
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from "next-themes";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
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
  Legend
);

interface BurndownData {
  date: string; // ISO string
  spent: number;
}

interface BurndownChartProps {
  data: BurndownData[];
  totalBudget: number;
  height?: string;
  className?: string;
}

export function BurndownChart({ 
  data,
  totalBudget,
  height = "300px",
  className = ""
}: BurndownChartProps) {
  const { theme: currentTheme } = useTheme();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { formatAmount } = useFormatMoney();
  const { t } = useTranslation();

  const palette = currentTheme === 'dark' ? theme.dark : theme.light;
  const textColor = palette.foreground.hex;
  const tooltipBg = palette.card.background.hex;
  const borderColor = palette.border.hex;
  const mutedColor = palette.muted.foreground.hex;
  const destructiveHex = currentTheme === 'dark' ? theme.semantic.error.hex : theme.semantic.errorLight.hex;

  // Aggregate spending by date
  const aggregated = data.reduce((acc, curr) => {
    const dateKey = curr.date.substring(0, 10);
    acc[dateKey] = (acc[dateKey] || 0) + curr.spent;
    return acc;
  }, {} as Record<string, number>);

  // Sort dates
  const sortedDateKeys = Object.keys(aggregated).sort();
  const sortedLabels = sortedDateKeys.map(key => format(parseISO(key), "MMM dd"));
  
  // Calculate remaining budget over time
  let currentRemaining = totalBudget;
  const remainingData = sortedDateKeys.map(key => {
    currentRemaining -= aggregated[key];
    return currentRemaining;
  });

  // Calculate ideal burndown line
  const idealData = sortedLabels.map((_, index) => {
    if (sortedLabels.length <= 1) return totalBudget;
    return totalBudget - (totalBudget / (sortedLabels.length - 1)) * index;
  });

  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: t('remainingBudget') || 'Remaining Budget',
        data: remainingData,
        borderColor: theme.brand.accent.hex,
        backgroundColor: theme.brand.accent.hex,
        borderWidth: 2,
        tension: 0.2,
        pointBackgroundColor: theme.brand.accent.hex,
        pointBorderColor: palette.card.background.hex,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: t('idealPace') || 'Ideal Pace',
        data: idealData,
        borderColor: mutedColor,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
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
              display: true,
              position: 'top' as const,
              labels: {
                color: textColor,
                font: {
                  size: 11,
                  weight: 'bold',
                },
                usePointStyle: true,
                boxWidth: 10,
              },
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: borderColor,
              borderWidth: 1,
              cornerRadius: 12,
              padding: 12,
              callbacks: {
                label: function(context: TooltipItem<"line">) {
                  const value = context.parsed.y;
                  return ` ${context.dataset.label}: ${formatAmount(value, undefined, decimalSeparator)}`;
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
                  return formatAmount(value as number, undefined, decimalSeparator);
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
