import React, { useEffect, useState } from "react";
import { AddTask } from "./AddTask";
import { useTasks } from "../hooks";
import { collatedTasks } from "../constants";
import { getTitle, getCollatedTitle, collatedTasksExist } from "../helpers";
import {
  useSelectedProjectValue,
  useProjectsValue,
  useAuthValues,
} from "../context";
import { IndividualTask } from "./IndividualTask";
import { Spinner } from "./helpers/Spinner";

export const Tasks = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { userData } = useAuthValues();
  const { selectedProject, setSelectedProject } = useSelectedProjectValue();
  const { projects } = useProjectsValue();
  const { tasks } = useTasks(selectedProject, userData.user.uid);

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

  // Once the tasks update, stop the loader
  useEffect(() => {
    setShowLoader(false);
  }, [tasks]);

  // If we change the selected task, activate the loader
  useEffect(() => {
    setShowLoader(true);
  }, [selectedProject]);

  useEffect(() => {
    document.title = `${projectName}: Taskless`;
  });

  return (
    <div className="tasks" data-testid="tasks">
      <h2 data-testid="project-name">{projectName}</h2>

      {showLoader ? (
        <Spinner />
      ) : (
        <>
          <ul className="tasks__list">
            {tasks.map((task) => (
              <IndividualTask
                key={task.id}
                task={task}
                project={getTitle(projects, task.projectId)}
                showProjectName={collatedTasksExist(selectedProject)}
                setSelectedProject={setSelectedProject}
              />
            ))}
          </ul>

          <AddTask setShowLoader={setShowLoader} />
        </>
      )}
    </div>
  );
};
