"use client";

import { Project } from "@/db/schema";
import { useEffect, useState, useContext, createContext } from "react";
import { get_project } from "../../server";

export const ProjectDataContext = createContext<{data: Project, refresh: () => void, refresh_key: number}>({
  data: {
    project_id: "",
    name: "",
    description: "",
    creation_timestamp: new Date(),
    author_id: "",
    project_type: "paid",
    github_owner: "",
    github_repo: "",
    github_path: "",
    discord_link: "",
    discord_webhook: "",
    github_token: "",
    linkvertise_key_duration: "1",
    minimum_checkpoint_switch_duration: "1",
  },
  refresh: () => {},
  refresh_key: 0,
});

export const useProjectData = () => useContext(ProjectDataContext);

export default function ProjectDataProvider({ project_id, children }: { project_id: string, children: React.ReactNode }) {
  const [project_data, setProjectData] = useState<Project>({
    project_id: project_id,
    name: "",
    description: "",
    creation_timestamp: new Date(),
    author_id: "",
    project_type: "paid",
    github_owner: "",
    github_repo: "",
    github_path: "",
    discord_link: null,
    discord_webhook: null,
    github_token: "",
    linkvertise_key_duration: "1",
    minimum_checkpoint_switch_duration: "1",
  });

  const [refresh_key, setRefreshKey] = useState(0);

  const fetchProjectData = () => {
    get_project(project_id).then((project_data) => {
      setProjectData(project_data);
      setRefreshKey(refresh_key + 1);
    });
  };

  useEffect(() => {
    get_project(project_id).then((project_data) => {
      setProjectData(project_data);
      setRefreshKey(refresh_key + 1);
    });
  }, []);
  
  return (
    <ProjectDataContext.Provider value={{ data: project_data, refresh: fetchProjectData, refresh_key: refresh_key }}>
      {children}
    </ProjectDataContext.Provider>
  );
}