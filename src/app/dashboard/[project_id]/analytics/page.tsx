import { AnalyticsComponent } from "../components/analytics_chart"
import { AnalyticsChartComponent } from "../components/new_analytics_chart"

export default async function Analytics({params}: { params: { project_id: string } }) {
  return <AnalyticsChartComponent project_id={params.project_id} />
}