import React, { useEffect } from "react";
import { AddTask } from "./AddTask";
import { useTasks } from "../hooks";
import { collatedTasks } from "../constants";
import { getTitle, getCollatedTitle, collatedTasksExist } from "../helpers";
import { useSelectedProjectValue, useProjectsValue } from "../context";
import { IndividualTask } from "./IndividualTask";

export const Tasks = () => {
  const { selectedProject } = useSelectedProjectValue();
  const { projects } = useProjectsValue();
  const { tasks } = useTasks(selectedProject);

  let projectName = "";

  if (collatedTasksExist(selectedProject) && selectedProject) {
    projectName = getCollatedTitle(collatedTasks, selectedProject).name;
  }

  if (
    projects &&
    projects.length > 0 &&
    selectedProject &&
    !collatedTasksExist(selectedProject)
  ) {
    // Check if the title exists, because it will be empty for a tiny bit when deleting projects
    projectName = getTitle(projects, selectedProject)
      ? getTitle(projects, selectedProject).name
      : "";
  }

  useEffect(() => {
    document.title = `${projectName}: Taskless`;
  });

  return (
    <div className="tasks" data-testid="tasks">
      <h2 data-testid="project-name">{projectName}</h2>

      <ul className="tasks__list">
        {tasks.map((task) => (
          <IndividualTask task={task} />
        ))}
      </ul>

      <AddTask />
    </div>
  );
};
