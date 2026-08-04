"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from "next-themes";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import { useTranslation } from "@/lib/i18n";
import { useCurrentDecimalSeparator } from "@/lib/hooks";
import { theme, getChartColor } from "@/lib/theme";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  name: string;
  spent: number;
}

interface DistributionChartProps {
  data: CategoryData[];
  height?: string;
  className?: string;
}

export function DistributionChart({ 
  data, 
  height = "300px",
  className = ""
}: DistributionChartProps) {
  const { theme: currentTheme } = useTheme();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { formatAmount } = useFormatMoney();
  const { t } = useTranslation();

  const chartColor = (index: number) => getChartColor(index).hex;
  const palette = currentTheme === 'dark' ? theme.dark : theme.light;
  const textColor = palette.foreground.hex;
  const tooltipBg = palette.card.background.hex;
  const borderColor = palette.border.hex;

  const validData = data.filter(d => d.spent > 0).sort((a, b) => b.spent - a.spent);
  const totalSpent = validData.reduce((sum, item) => sum + item.spent, 0);

  const chartData = {
    labels: validData.map(item => item.name),
    datasets: [
      {
        data: validData.map(item => item.spent),
        backgroundColor: validData.map((_, index) => chartColor(index)),
        borderColor: palette.card.background.hex,
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className={`w-full flex items-center justify-center ${className}`} style={{ height }}>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'right' as const,
              labels: {
                color: textColor,
                font: {
                  size: 11,
                },
                usePointStyle: true,
                padding: 15,
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
                label: function(context: TooltipItem<"doughnut">) {
                  const value = context.parsed;
                  const pct = totalSpent > 0 ? Math.round((value / totalSpent) * 100) : 0;
                  return ` ${formatAmount(value, undefined, decimalSeparator)} (${pct}%)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
