import React, { createContext, useContext } from "react";
import { useAuthValues } from ".";
import { useProjects, useUserInfo } from "../hooks";

export const ProjectsContext = createContext();
export const ProjectsProvider = ({ children }) => {
  const { userData } = useAuthValues();
  const { projects, setProjects } = useProjects(userData.user.uid);
  const { userInfo } = useUserInfo(userData.user.uid);

  return (
    <ProjectsContext.Provider value={{ projects, setProjects, userInfo }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsValue = () => useContext(ProjectsContext);
