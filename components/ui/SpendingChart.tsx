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
  height = "400px",
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

  // Add budgeted dataset if requested
  if (showBudgeted) {
    datasets.push({
      label: 'Budgeted',
      data: chartData.map(item => item.budgeted),
      backgroundColor: currentTheme === 'dark' ? '#374151' : '#E5E7EB',
      borderColor: currentTheme === 'dark' ? '#6B7280' : '#9CA3AF',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    });
  }

  // Add spent dataset
  datasets.push({
    label: 'Spent',
    data: chartData.map(item => item.spent),
    backgroundColor: chartData.map((item, index) => 
      item.overBudget 
        ? '#EF4444' // Red for over budget
        : getChartColors(index)
    ),
    borderColor: chartData.map((item, index) => 
      item.overBudget 
        ? '#EF4444' // Red for over budget
        : getChartColors(index)
    ),
    borderWidth: 1,
    borderRadius: 6,
    borderSkipped: false,
  });

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
                  size: 14,
                  weight: 'bold',
                },
                usePointStyle: true,
                padding: 25,
                boxWidth: 20,
                boxHeight: 8,
              },
            },
            tooltip: {
              backgroundColor: currentTheme === 'dark' ? '#1F2937' : '#FFFFFF',
              titleColor: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
              bodyColor: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
              borderColor: currentTheme === 'dark' ? '#6B7280' : '#D1D5DB',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              titleFont: {
                size: 14,
                weight: 'bold',
              },
              bodyFont: {
                size: 12,
              },
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return `${label}: ${formatMoney(value)}`;
                },
                ...(showBudgeted && {
                  afterBody: function(context) {
                    const dataIndex = context[0].dataIndex;
                    const budgeted = chartData[dataIndex]?.budgeted || 0;
                    const spent = chartData[dataIndex]?.spent || 0;
                    const difference = spent - budgeted;
                    
                    if (context[0].dataset.label === 'Budgeted') {
                      return [
                        `Spent: ${formatMoney(spent)}`,
                        `Difference: ${formatMoney(difference)}`
                      ];
                    }
                    return [];
                  },
                }),
              },
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
                font: {
                  size: data.length > 6 ? 10 : 12,
                  weight: 'normal',
                },
                maxRotation: 45,
                minRotation: 0,
                autoSkip: true,
                maxTicksLimit: data.length > 6 ? 6 : 8,
              },
              border: {
                color: currentTheme === 'dark' ? '#6B7280' : '#D1D5DB',
              },
            },
            y: {
              border: {
                color: currentTheme === 'dark' ? '#6B7280' : '#D1D5DB',
              },
              grid: {
                color: currentTheme === 'dark' ? '#374151' : '#E5E7EB',
              },
              ticks: {
                color: currentTheme === 'dark' ? '#F9FAFB' : '#374151',
                font: {
                  size: 11,
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
            easing: 'easeInOutQuart',
          },
        }}
      />
    </div>
  );
} 