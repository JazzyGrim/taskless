import React, { useEffect, useState } from "react";
import { useSelectedProjectValue, useProjectsValue } from "../context";
import { Grabber } from "./Grabber";
import { IndividualProject } from "./IndividualProject";
import { Draggable, Droppable, DragDropContext } from "react-beautiful-dnd";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { AddProject } from "./AddProject";

export const Projects = () => {
  const { selectedProject, setSelectedProject } = useSelectedProjectValue();
  const { projects, userInfo } = useProjectsValue();
  const [projectOrder, setProjectOrder] = useState([]);
  const [orderedProjects, setOrderedProjects] = useState([]);

  const saveProjectOrder = async (projectOrder) => {
    const userRef = doc(db, "users", userInfo.docId);

    await updateDoc(userRef, {
      projectOrder,
    });
  };

  useEffect(() => {
    if (userInfo.projectOrder) {
      setProjectOrder(userInfo.projectOrder);
      sortProjects(userInfo.projectOrder);
    }
  }, [userInfo]);

  const sortProjects = (order) => {
    setOrderedProjects(
      projects.slice().sort(function (a, b) {
        return order.indexOf(a.projectId) - order.indexOf(b.projectId);
      })
    );
  };

  const addProjectToOrder = (projectId) => {
    const newOrder = [...projectOrder, projectId];
    setProjectOrder(newOrder);
    saveProjectOrder(newOrder);
  };

  const removeProjectFromOrder = (projectId) => {
    const newOrder = projectOrder.filter((id) => id !== projectId);
    setProjectOrder(newOrder);
    saveProjectOrder(newOrder);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newOrder = [...projectOrder];
    newOrder.splice(source.index, 1);
    newOrder.splice(destination.index, 0, draggableId);
    setProjectOrder(newOrder);
    sortProjects(newOrder);

    saveProjectOrder(newOrder);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="projects" type="project">
        {(provided) => (
          <div ref={provided.innerRef}>
            {orderedProjects &&
              orderedProjects.map((project, index) => {
                return (
                  <Draggable
                    draggableId={project.projectId}
                    key={project.projectId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <li
                        key={project.projectId}
                        data-testid="project-action-parent"
                        data-doc-id={project.docId}
                        className={
                          selectedProject === project.projectId
                            ? "active sidebar__project"
                            : "sidebar__project"
                        }
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                      >
                        <Grabber
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        />
                        <div
                          role="button"
                          data-testid="project-action"
                          tabIndex={0}
                          aria-label={`Select ${project.name} as the task project`}
                          onClick={() => {
                            setSelectedProject(project.projectId);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setSelectedProject(project.projectId);
                            }
                          }}
                          className={
                            snapshot.isDragging
                              ? "sidebar__project-holder dragging"
                              : "sidebar__project-holder"
                          }
                        >
                          <IndividualProject
                            project={project}
                            removeProjectFromOrder={removeProjectFromOrder}
                          />
                        </div>
                      </li>
                    )}
                  </Draggable>
                );
              })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AddProject addProjectToOrder={addProjectToOrder} />
    </DragDropContext>
  );
};
