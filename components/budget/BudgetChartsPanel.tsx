"use client";

import { SpendingChart } from "@/components/ui/SpendingChart";
import { DistributionChart } from "@/components/ui/DistributionChart";
import { TrendChart } from "@/components/ui/TrendChart";
import { BurndownChart } from "@/components/ui/BurndownChart";
import { CashFlowChart } from "@/components/ui/CashFlowChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/lib/i18n";
import {
  buildSpendingChartData,
  buildTopSpendingCategories,
  buildTrendData,
  buildBurndownData,
  buildCashFlowData,
  type BudgetCategoryInput,
  type BudgetExpenseInput,
} from "@/lib/budget-chart-data";
import { PieChart, TrendingUp, Activity, BarChart3, BarChart } from "lucide-react";

interface BudgetChartsPanelProps {
  categories: BudgetCategoryInput[];
  expenses?: BudgetExpenseInput[];
  totalBudgeted?: number;
  showTimelineCharts?: boolean;
  showTrendTab?: boolean;
  showBurndownTab?: boolean;
  showCashFlowTab?: boolean;
  chartHeightClass?: string;
}

export function BudgetChartsPanel({
  categories,
  expenses = [],
  totalBudgeted,
  showTimelineCharts = true,
  showTrendTab = true,
  showBurndownTab = true,
  showCashFlowTab = true,
  chartHeightClass = "h-[250px] sm:h-[300px] md:h-[350px]",
}: BudgetChartsPanelProps) {
  const { t } = useTranslation();

  const chartCategories = buildTopSpendingCategories(categories);
  const chartData = buildSpendingChartData(categories);
  const hasSpendingData = chartCategories.length > 0;
  const hasMultipleCategories = chartCategories.length > 1;

  const hasTimelineData = showTimelineCharts && expenses.length > 0;
  const trendData = buildTrendData(expenses);
  const burndownData = buildBurndownData(expenses);
  const cashFlowData = buildCashFlowData(expenses);
  const budgetTotal =
    totalBudgeted ??
    categories.reduce((sum, cat) => sum + cat.budgeted, 0);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-muted/30">
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("addBudgetCategoriesToSee")}
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="categories" className="w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6 flex-wrap gap-4">
        <h3 className="text-base sm:text-lg font-medium">
          {t("topSpendingCategories")}
        </h3>
        <TabsList className="bg-muted/50 h-9 p-1 flex-wrap">
          <TabsTrigger
            value="categories"
            className="h-7 text-xs px-2 sm:px-3 gap-1.5"
            title={t("tabCategories")}
          >
            <BarChart className="h-3.5 w-3.5 hidden sm:inline-block" />
            <span className="sm:hidden">{t("tabCategoriesShort")}</span>
            <span className="hidden sm:inline">{t("tabCategories")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="h-7 text-xs px-2 sm:px-3 gap-1.5"
            title={t("tabDistribution")}
          >
            <PieChart className="h-3.5 w-3.5 hidden sm:inline-block" />
            <span className="sm:hidden">{t("tabDistributionShort")}</span>
            <span className="hidden sm:inline">{t("tabDistribution")}</span>
          </TabsTrigger>
          {showTimelineCharts && showTrendTab && (
              <TabsTrigger
                value="trend"
                className="h-7 text-xs px-2 sm:px-3 gap-1.5"
                title={t("tabTrend")}
              >
                <TrendingUp className="h-3.5 w-3.5 hidden sm:inline-block" />
                <span className="sm:hidden">{t("tabTrendShort")}</span>
                <span className="hidden sm:inline">{t("tabTrend")}</span>
              </TabsTrigger>
            )}
            {showTimelineCharts && showBurndownTab && (
              <TabsTrigger
                value="burndown"
                className="h-7 text-xs px-2 sm:px-3 gap-1.5"
                title={t("tabBurndown")}
              >
                <Activity className="h-3.5 w-3.5 hidden sm:inline-block" />
                <span className="sm:hidden">{t("tabBurndownShort")}</span>
                <span className="hidden sm:inline">{t("tabBurndown")}</span>
              </TabsTrigger>
            )}
            {showTimelineCharts && showCashFlowTab && (
              <TabsTrigger
                value="cashflow"
                className="h-7 text-xs px-2 sm:px-3 gap-1.5"
                title={t("tabCashFlow")}
              >
                <BarChart3 className="h-3.5 w-3.5 hidden sm:inline-block" />
                <span className="sm:hidden">{t("tabCashFlowShort")}</span>
                <span className="hidden sm:inline">{t("tabCashFlow")}</span>
              </TabsTrigger>
            )}
        </TabsList>
      </div>

      <div className={`${chartHeightClass} flex flex-col`} data-testid="budget-charts-panel">
        {hasSpendingData ? (
          <>
            <TabsContent
              value="categories"
              className="flex-1 overflow-x-auto overflow-y-hidden mt-0 h-full border-none p-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
            >
              <div
                className="min-w-full h-full"
                style={{
                  minWidth: `${Math.max(chartCategories.length * 120, 400)}px`,
                }}
              >
                <SpendingChart
                  data={chartData}
                  showBudgeted={true}
                  showLegend={false}
                  height="100%"
                />
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="flex-1 mt-0 h-full">
              {hasMultipleCategories ? (
                <DistributionChart data={chartData} height="100%" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {t("noSpendingDataAvailable")}
                </div>
              )}
            </TabsContent>

            {showTimelineCharts && showTrendTab && (
                <TabsContent value="trend" className="flex-1 mt-0 h-full">
                  {hasTimelineData && trendData.length > 0 ? (
                    <TrendChart data={trendData} height="100%" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground px-4 text-center">
                      {t("chartsTimelineUnavailable")}
                    </div>
                  )}
                </TabsContent>
              )}

              {showTimelineCharts && showBurndownTab && (
                <TabsContent value="burndown" className="flex-1 mt-0 h-full">
                  {hasTimelineData && burndownData.length > 0 ? (
                    <BurndownChart
                      data={burndownData}
                      totalBudget={budgetTotal}
                      height="100%"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground px-4 text-center">
                      {t("chartsTimelineUnavailable")}
                    </div>
                  )}
                </TabsContent>
              )}

              {showTimelineCharts && showCashFlowTab && (
                <TabsContent value="cashflow" className="flex-1 mt-0 h-full">
                  {hasTimelineData && cashFlowData.length > 0 ? (
                    <CashFlowChart data={cashFlowData} height="100%" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground px-4 text-center">
                      {t("chartsTimelineUnavailable")}
                    </div>
                  )}
                </TabsContent>
              )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {t("noSpendingDataAvailable")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("addExpensesToSeePatterns")}
              </p>
            </div>
          </div>
        )}
      </div>
    </Tabs>
  );
}
