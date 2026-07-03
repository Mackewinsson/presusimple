"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CashFlowData {
  date: string; // ISO string
  income: number;
  expense: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  height?: string;
  className?: string;
}

export function CashFlowChart({ 
  data, 
  height = "300px",
  className = ""
}: CashFlowChartProps) {
  const { theme: currentTheme } = useTheme();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { t } = useTranslation();

  const palette = currentTheme === 'dark' ? theme.dark : theme.light;
  const textColor = palette.foreground.hex;
  const tooltipBg = palette.card.background.hex;
  const borderColor = palette.border.hex;
  const mutedColor = palette.muted.foreground.hex;
  const destructiveHex = currentTheme === 'dark' ? theme.semantic.error.hex : theme.semantic.errorLight.hex;
  const successHex = theme.semantic.success.hex;

  // Aggregate by date
  const aggregated = data.reduce((acc, curr) => {
    const dateKey = curr.date.substring(0, 10);
    if (!acc[dateKey]) {
      acc[dateKey] = { income: 0, expense: 0 };
    }
    acc[dateKey].income += curr.income;
    acc[dateKey].expense += curr.expense;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Sort dates
  const sortedDateKeys = Object.keys(aggregated).sort();
  const sortedLabels = sortedDateKeys.map(key => format(parseISO(key), "MMM dd"));
  
  const chartData = {
    labels: sortedLabels,
    datasets: [
      {
        label: t('income') || 'Income',
        data: sortedDateKeys.map(key => aggregated[key].income),
        backgroundColor: successHex,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      },
      {
        label: t('expenses') || 'Expenses',
        data: sortedDateKeys.map(key => aggregated[key].expense),
        backgroundColor: destructiveHex,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.8,
        categoryPercentage: 0.8,
      }
    ],
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Bar
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
                label: function(context: TooltipItem<"bar">) {
                  const value = context.parsed.y;
                  return ` ${context.dataset.label}: ${formatMoney(value, undefined, decimalSeparator)}`;
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
