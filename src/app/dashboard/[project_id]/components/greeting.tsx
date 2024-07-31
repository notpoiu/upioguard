"use client";

import { format } from "date-fns";
import { useProjectData } from "./project_data_provider";

export default function GreetingDashText({name, managing}: {name: string, managing?: boolean}) {

  const { data } = useProjectData(); 

  return (
    <>
      {new Date().getHours() < 12 && <h1 className="text-3xl font-bold">Good morning, {name}!</h1>}
      {new Date().getHours() >= 12 && new Date().getHours() < 18 && <h1 className="text-3xl font-bold">Good afternoon, {name}!</h1>}
      {new Date().getHours() >= 18 && new Date().getHours() < 24 && <h1 className="text-3xl font-bold">Good evening, {name}!</h1>}
      {managing && <p>You are managing, <span className="font-bold">{data.name ?? "Unknown"}</span>. {data.project_type == "paid" ? "This script is paid." : "This script is freemium."} Created the <span className="font-bold">{format(data.creation_timestamp, "PPP")}</span>.</p>}
    </>
  )

}