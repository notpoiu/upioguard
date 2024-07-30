"use client";

import { Project } from "@/db/schema";
import { useEffect, useState, useContext, createContext } from "react";
import { get_project } from "../server";

export const ProjectDataContext = createContext<{data: Project, refresh: () => void, refresh_key: number}>({
  data: {
    project_id: 0,
    name: "",
    description: "",
    creation_timestamp: new Date(),
    author_id: "",
    total_executions: "0",
    project_type: "paid",
    github_owner: "",
    github_repo: "",
    github_path: "",
    discord_link: "",
  },
  refresh: () => {},
  refresh_key: 0,
});

export const useProjectData = () => useContext(ProjectDataContext);

export default function ProjectDataProvider({ children }: { children: React.ReactNode }) {
  const [project_data, setProjectData] = useState<Project>({
    project_id: 0,
    name: "",
    description: "",
    creation_timestamp: new Date(),
    author_id: "",
    total_executions: "0",
    project_type: "paid",
    github_owner: "",
    github_repo: "",
    github_path: "",
    discord_link: null,
  });

  const [refresh_key, setRefreshKey] = useState(0);

  const fetchProjectData = () => {
    get_project().then((project_data) => {
      setProjectData(project_data);
      setRefreshKey(refresh_key + 1);
    });
  };

  useEffect(() => {
    fetchProjectData();
  }, []);
  
  return (
    <ProjectDataContext.Provider value={{ data: project_data, refresh: fetchProjectData, refresh_key: refresh_key }}>
      {children}
    </ProjectDataContext.Provider>
  );
}