"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from "next-themes";
import { formatMoney } from "@/lib/utils/formatMoney";

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

  // Get high-contrast colors for dark mode
  const getChartColors = (index: number) => {
    if (currentTheme === 'dark') {
      // Bright colors for dark mode
      const darkModeColors = [
        '#60A5FA', // Blue
        '#34D399', // Green
        '#FBBF24', // Yellow
        '#F87171', // Red
        '#A78BFA', // Purple
        '#F472B6', // Pink
        '#34D399', // Teal
        '#F59E0B', // Orange
      ];
      return darkModeColors[index % darkModeColors.length];
    } else {
      // Standard colors for light mode
      const lightModeColors = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Teal
        '#F97316', // Orange
      ];
      return lightModeColors[index % lightModeColors.length];
    }
  };

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
      label: 'Gastado',
      data: chartData.map(item => Math.min(item.spent, item.budgeted)),
      backgroundColor: chartData.map((item, index) =>
        item.overBudget
          ? '#EF4444'
          : getChartColors(index)
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
      label: 'Restante',
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
        label: 'Excedido',
        data: chartData.map(item => item.overBudget ? item.spent - item.budgeted : 0),
        backgroundColor: 'rgba(239, 68, 68, 0.4)',
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
      label: 'Gastado',
      data: chartData.map(item => item.spent),
      backgroundColor: chartData.map((item, index) =>
        item.overBudget
          ? '#EF4444'
          : getChartColors(index)
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
                color: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
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
              backgroundColor: currentTheme === 'dark' ? '#1F2937' : '#FFFFFF',
              titleColor: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
              bodyColor: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
              borderColor: currentTheme === 'dark' ? '#6B7280' : '#D1D5DB',
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
                label: function(context) {
                  if (!showBudgeted) {
                    return `Gastado: ${formatMoney(context.parsed.y)}`;
                  }
                  // Only show full info on the first dataset hit
                  if (context.datasetIndex === 0) {
                    const idx = context.dataIndex;
                    const spent = chartData[idx]?.spent || 0;
                    const budgeted = chartData[idx]?.budgeted || 0;
                    const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
                    return [
                      `Presupuestado: ${formatMoney(budgeted)}`,
                      `Gastado: ${formatMoney(spent)}`,
                      `${pct}% utilizado`,
                    ];
                  }
                  return [];
                },
                // Filter out duplicate tooltip entries from stacked datasets
                filter: function(tooltipItem) {
                  return tooltipItem.datasetIndex === 0;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false,
              },
              ticks: {
                color: currentTheme === 'dark' ? '#F9FAFB' : '#6B7280',
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
                color: currentTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                lineWidth: 1,
                drawTicks: false,
              },
              ticks: {
                color: currentTheme === 'dark' ? '#F9FAFB' : '#6B7280',
                font: {
                  size: 9,
                  weight: 'normal',
                },
                callback: function(value) {
                  return formatMoney(value as number);
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