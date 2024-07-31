import { AnalyticsComponent } from "../components/analytics_chart"

export default async function Analytics({params}: { params: { project_id: string } }) {
  return <AnalyticsComponent project_id={params.project_id} />
}