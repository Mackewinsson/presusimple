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
import { theme, getChartColor } from "@/lib/theme";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CategoryData {
  name: string;
  spent: number;
  budgeted?: number;
  overBudget?: boolean;
}

interface SpendingChartProps {
  data: CategoryData[];
  showBudgeted?: boolean;
  showLegend?: boolean;
  height?: string;
  className?: string;
}

export function SpendingChart({ 
  data, 
  showBudgeted = false, 
  showLegend = false, 
  height = "300px",
  className = ""
}: SpendingChartProps) {
  const { theme: currentTheme } = useTheme();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { t } = useTranslation();

  const chartColor = (index: number) => getChartColor(index).hex;
  const destructiveHex = currentTheme === 'dark' ? theme.semantic.error.hex : theme.semantic.errorLight.hex;
  const palette = currentTheme === 'dark' ? theme.dark : theme.light;
  const textColor = palette.foreground.hex;
  const tooltipBg = palette.card.background.hex;
  const borderColor = palette.border.hex;
  const mutedColor = palette.muted.foreground.hex;

  const chartData = data.map((category, index) => ({
    name: category.name,
    spent: category.spent,
    budgeted: category.budgeted || 0,
    overBudget: category.overBudget || false,
  }));

  const datasets = [];

  if (showBudgeted) {
    // Stacked single-bar pattern:
    // Bottom (colored) = spent amount
    // Top (gray) = remaining budget (budgeted - spent)
    // Total bar height = budgeted amount

    // 1. Spent – colored portion at the bottom of the bar
    datasets.push({
      label: t('totalSpent'),
      data: chartData.map(item => Math.min(item.spent, item.budgeted)),
      backgroundColor: chartData.map((item, index) =>
        item.overBudget
          ? destructiveHex
          : chartColor(index)
      ),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0, // flat top where it meets the gray portion
      borderSkipped: false, // round the bottom
      barPercentage: 0.5,
      categoryPercentage: 0.75,
      stack: 'budget',
    });

    // 2. Remaining – gray portion on top (budget minus spent)
    datasets.push({
      label: t('remaining'),
      data: chartData.map(item => Math.max(0, item.budgeted - item.spent)),
      backgroundColor: currentTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: false,
      barPercentage: 0.5,
      categoryPercentage: 0.75,
      stack: 'budget',
    });

    // 3. Over-budget portion (if spent > budgeted, show the excess in red on top)
    const hasOverBudget = chartData.some(item => item.overBudget);
    if (hasOverBudget) {
      datasets.push({
        label: t('exceeded'),
        data: chartData.map(item => item.overBudget ? item.spent - item.budgeted : 0),
        backgroundColor: `${destructiveHex}66`,
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: { topLeft: 12, topRight: 12, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.75,
        stack: 'budget',
      });
    }
  } else {
    // Single bar mode (no budgeted background) – just show spent
    datasets.push({
      label: t('totalSpent'),
      data: chartData.map(item => item.spent),
      backgroundColor: chartData.map((item, index) =>
        item.overBudget
          ? destructiveHex
          : chartColor(index)
      ),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 12,
      borderSkipped: false,
      barPercentage: 0.5,
      categoryPercentage: 0.75,
    });
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Bar
        data={{
          labels: chartData.map(item => item.name),
          datasets,
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: showLegend,
              position: 'top' as const,
              labels: {
                color: textColor,
                font: {
                  size: 12,
                  weight: 'bold',
                },
                usePointStyle: true,
                padding: 20,
                boxWidth: 16,
                boxHeight: 6,
              },
            },
            tooltip: {
              backgroundColor: tooltipBg,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: borderColor,
              borderWidth: 1,
              cornerRadius: 12,
              displayColors: false,
              padding: 12,
              titleFont: {
                size: 13,
                weight: 'bold',
              },
              bodyFont: {
                size: 11,
              },
              callbacks: {
                // Show a combined tooltip instead of per-dataset
                label: function(this: unknown, context: TooltipItem<"bar">) {
                  if (!showBudgeted) {
                    return `${t('totalSpent')}: ${formatMoney(context.parsed.y, undefined, decimalSeparator)}`;
                  }
                  // Only show full info on the first dataset hit
                  if (context.datasetIndex === 0) {
                    const idx = context.dataIndex;
                    const spent = chartData[idx]?.spent || 0;
                    const budgeted = chartData[idx]?.budgeted || 0;
                    const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
                    return [
                      `${t('budgeted')}: ${formatMoney(budgeted, undefined, decimalSeparator)}`,
                      `${t('totalSpent')}: ${formatMoney(spent, undefined, decimalSeparator)}`,
                      `${pct}${t('percentUsed')}`,
                    ];
                  }
                  return [];
                },
              },
              // Filter out duplicate tooltip entries from stacked datasets
              filter: (e: TooltipItem<"bar">) => e.datasetIndex === 0,
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
              },
              ticks: {
                color: mutedColor,
                font: {
                  size: data.length > 6 ? 9 : 11,
                  weight: 'normal',
                },
                maxRotation: 45,
                minRotation: 0,
                autoSkip: true,
                maxTicksLimit: data.length > 6 ? 4 : 6,
              },
              border: {
                display: false,
              },
            },
            y: {
              stacked: true, // stack spent + remaining into one bar
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
                  size: 9,
                  weight: 'normal',
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
          animation: {
            duration: 750,
            easing: 'easeOutQuart',
          },
        }}
      />
    </div>
  );
} 