"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetch_project_executions, get_total_executions } from "../../server"
import NumberTicker from "@/components/magicui/number-ticker"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import Confetti, { ConfettiButton, ConfettiRef } from "@/components/magicui/confetti"

const chartConfig = {
  views: {
    label: "Script Executions",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function AnalyticsComponent({ project_id }: { project_id: string }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop")

  const [lastMonth_total, setLastMonthTotal] = React.useState<number>(0);
  const [thisMonth_total, setThisMonthTotal] = React.useState<number>(0);

  const [rawExecutionData, setRawExecutionData] = React.useState<any[]>([]);
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [total_executions, setTotalExecutions] = React.useState<number>(0);

  React.useEffect(() => {    
    get_total_executions(project_id).then((data) => {      
      setTotalExecutions(data[0].count);
    });   
  }, [project_id]);


  React.useEffect(() => {
    fetch_project_executions(project_id).then((data) => {
      setRawExecutionData(data);

      setLastMonthTotal(data.filter((execution) => execution.execution_timestamp.getMonth() === new Date().getMonth() - 1).length);
      setThisMonthTotal(data.filter((execution) => execution.execution_timestamp.getMonth() === new Date().getMonth()).length);

      let organized_data: any[] = [];
      for (const execution of data) {
        const date = execution.execution_timestamp.toISOString().split("T")[0];
        if (!organized_data.find((data) => data.date === date)) {
          organized_data.push({ date: date, desktop: 0, mobile: 0 });
        }

        if (execution.execution_type === "desktop") {
          organized_data.find((data) => data.date === date).desktop += 1;
        } else if (execution.execution_type === "mobile") {
          organized_data.find((data) => data.date === date).mobile += 1;
        }
      }

      setChartData(organized_data);
    });
  }, [project_id]);

  const total = React.useMemo(
    () => ({
      desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
      mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
    }),
    []
  )

  return (
    <>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mb-2">Shows information on how your script is doing</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Card className="mb-3">
          <CardHeader>
          <CardTitle>
            Insights 
            {(lastMonth_total != 0 && thisMonth_total != 0) &&  (
              <span className={cn("text-sm align-top ml-1", (thisMonth_total >= lastMonth_total) ? "text-green-500" : "text-red-500")}>
                ({(thisMonth_total - lastMonth_total) > 0 ? "+" : "-"}{Math.abs(Math.floor((thisMonth_total - lastMonth_total) / lastMonth_total * 100))}%)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Comparisons compared to last month
          </CardDescription>

          <Separator />

          {(lastMonth_total != 0 && thisMonth_total != 0) && (thisMonth_total >= lastMonth_total) ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground px-2 py-2">
              <p>Congratulations on the new traffic! 🎉</p>
              <p className="text-xs">
                {thisMonth_total-lastMonth_total} Extra Script Executions in the last month
              </p>
            </div>
          ) : 
            (lastMonth_total != 0 && thisMonth_total != 0) ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground px-2 py-2">
                <p className="text-sm">
                  You are <span className="font-bold">{Math.floor(thisMonth_total / lastMonth_total * 100)}%</span> there compared to last month
                </p>

                <Progress value={Math.floor(thisMonth_total / lastMonth_total * 100)} />
                <p className="text-sm">{thisMonth_total} / {lastMonth_total} Script Executions</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground px-2 py-2">
                <p>No data available, please wait for the script to be executed for the first time.</p>
              </div>
            )
          }

          </CardHeader>
        </Card>

        <Card className="mb-3">
          <CardHeader>
              <CardTitle>Total Script Executions</CardTitle>
              <CardDescription>
                Total script executions from the lifetime of the project
              </CardDescription>

              <NumberTicker value={total_executions} className="mt-2" />
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>Script Executions</CardTitle>
            <CardDescription>
              Showing total script executions for the last 3 months
            </CardDescription>
          </div>
          <div className="flex">
            {["desktop", "mobile"].map((key) => {
              const chart = key as keyof typeof chartConfig
              return (
                <button
                  key={chart}
                  data-active={activeChart === chart}
                  className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-muted-foreground">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg font-bold leading-none sm:text-3xl">
                    {total[key as keyof typeof total].toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          {chartData.length === 0 ? <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground  min-h-[250px]">
            <p>No data available, please wait for the script to be executed for the first time.</p>
          </div> : <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
            </BarChart>
          </ChartContainer>}
        </CardContent>
      </Card>

      
    </>
  )
}
