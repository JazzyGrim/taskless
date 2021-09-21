import React, { useEffect, useState } from "react";
import { useSections, useTasks } from "../hooks";
import { collatedTasks } from "../constants";
import {
  getTitle,
  getCollatedTitle,
  collatedTasksExist,
  getProjectById,
} from "../helpers";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import {
  useSelectedProjectValue,
  useProjectsValue,
  useAuthValues,
  useOrderedDataValue,
} from "../context";
import { Spinner } from "./helpers/Spinner";
import { Collection } from "./Collection";
import { Section } from "./Section";

export const Tasks = () => {
  const { selectedProject } = useSelectedProjectValue();
  const { projects } = useProjectsValue();
  const { dataObject, showLoader, onDragEnd, tasks } = useOrderedDataValue();

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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tasks" data-testid="tasks">
        <h2 data-testid="project-name">{projectName}</h2>

        {showLoader ? (
          <Spinner />
        ) : selectedProject === "TODAY" || selectedProject === "NEXT_7" ? (
          <Collection tasks={tasks} projects={projects} disableDrag />
        ) : (
          <>
            {/* {dataObject.for === selectedProject && (
              <Collection
                tasks={dataObject.ungrouped}
                projects={projects}
                index={-1}
              />
            )} */}
            <Droppable droppableId="all-sections" type="section">
              {(provided, snapshot) => (
                <div
                  className={
                    snapshot.isDraggingOver
                      ? "tasks__sections drag-over"
                      : "tasks__sections"
                  }
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {dataObject.for === selectedProject && (
                    <Section
                      tasks={dataObject.ungrouped}
                      projects={projects}
                      index={-1}
                    />
                  )}
                  {dataObject.for === selectedProject &&
                    dataObject.sectionOrder.map((sectionId, index) => {
                      // const curSec = sections.find((s) => s.id === sectionId);
                      // if (!curSec || curSec.projectId !== selectedProject)
                      //   return;
                      return (
                        <Section
                          key={sectionId}
                          tasks={
                            dataObject.sections[sectionId]
                              ? dataObject.sections[sectionId].taskOrder
                              : []
                          }
                          section={dataObject.sections[sectionId]}
                          projects={projects}
                          index={index}
                        />
                      );
                    })}

                  {/* <Collection tasks={[]} projects={projects} /> */}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}
      </div>
    </DragDropContext>
  );
};
