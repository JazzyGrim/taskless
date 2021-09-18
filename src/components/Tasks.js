import React, { useEffect, useState } from "react";
import { AddTask } from "./AddTask";
import { useSections, useTasks } from "../hooks";
import { collatedTasks } from "../constants";
import { getTitle, getCollatedTitle, collatedTasksExist } from "../helpers";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import {
  useSelectedProjectValue,
  useProjectsValue,
  useAuthValues,
} from "../context";
import { Spinner } from "./helpers/Spinner";
import { Collection } from "./Collection";
import { Section } from "./Section";

export const Tasks = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { userData } = useAuthValues();
  const { selectedProject } = useSelectedProjectValue();
  const { projects } = useProjectsValue();
  const { tasks, setTasks } = useTasks(selectedProject, userData.user.uid);
  const { sections } = useSections(selectedProject, userData.user.uid);

  const [taskOrder, setTaskOrder] = useState([
    "HzEh98XmjC9aIUXxi8NN",
    "ZNDemvSmr8MJtRPKFTEW",
    "71OpNfGJstF9pIIGP6HS",
    "AAGRgN95WCfUzMBgapoV",
  ]);
  const [sectionOrder, setSectionOrder] = useState([
    "ISP8pR2SlppaEB7qN3cr",
    "dy1kbeiE8AnH6fJCzXV5",
  ]);

  const [orderedTasks, setOrderedTasks] = useState([]);
  const [orderedSections, setOrderedSections] = useState([]);

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
    // When we change projects, we need to sort the tasks
    sortTasks(taskOrder);
  }, [tasks]);

  useEffect(() => {
    sortSections();
  }, [sections]);

  // useEffect(() => {
  //   console.log(JSON.stringify(orderedTasks.map((t) => t.sectionId)));
  // }, [orderedTasks]);

  // If we change the selected task, activate the loader
  useEffect(() => {
    setShowLoader(true);
  }, [selectedProject]);

  useEffect(() => {
    document.title = `${projectName}: Taskless`;
  });

  const sortTasks = (order) => {
    console.log("🙂 Sorting tasks!");
    const ordered = tasks.slice().sort(function (a, b) {
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
    setOrderedTasks(ordered);
  };

  const sortSections = (newSectionOrder) => {
    const orderList = newSectionOrder ? newSectionOrder : sectionOrder;
    const orderedS = sections.slice().sort(function (a, b) {
      return orderList.indexOf(a.id) - orderList.indexOf(b.id);
    });
    setOrderedSections(orderedS);
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // If dropping item randomly
    if (!destination) return;
    // If the item returned to the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "section") {
      // There is only one droppable for sections
      let newSectionOrder = [...sectionOrder];
      newSectionOrder.splice(source.index, 1);
      newSectionOrder.splice(destination.index, 0, draggableId);
      sortSections(newSectionOrder);
      setSectionOrder(newSectionOrder);
    } else if (type === "task") {
      // ----------------
      // Reorder elements
      // ----------------
      let newTaskOrder = [...taskOrder];
      let sourceIndex = source.index;
      let destinationIndex = destination.index;

      if (
        source.droppableId !== destination.droppableId &&
        destinationIndex > sourceIndex
      )
        destinationIndex -= 1;

      console.log(
        "Source index: " +
          sourceIndex +
          "\nDestination index: " +
          destinationIndex
      );
      // console.log("Before removal:\n", JSON.stringify(newTaskOrder));
      newTaskOrder.splice(sourceIndex, 1);
      // console.log("Before Addition:\n", JSON.stringify(newTaskOrder));
      newTaskOrder.splice(destinationIndex, 0, draggableId);
      console.log("After addition:\n", JSON.stringify(newTaskOrder));

      setTaskOrder(newTaskOrder); // Store the task order for the DB

      // If we are moving between sections
      if (source.droppableId !== destination.droppableId) {
        let newTasks = [...tasks];
        let idInArray = newTasks.findIndex((task) => task.id === draggableId);

        // Change the section ID for the task
        newTasks[idInArray].sectionId =
          destination.droppableId === "unsorted" ? "" : destination.droppableId;

        // Update the tasks
        // !!! SHOULD CAUSE A RE-RENDER and RE-SORT
        setTasks(newTasks);

        // setOrderedTasks(newTasks);
      } else {
        sortTasks(newTaskOrder); // Update the task order
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tasks" data-testid="tasks">
        <h2 data-testid="project-name">{projectName}</h2>

        {showLoader ? (
          <Spinner />
        ) : selectedProject === "TODAY" || selectedProject === "NEXT_7" ? (
          <Collection tasks={orderedTasks} projects={projects} />
        ) : (
          <>
            <Collection
              tasks={orderedTasks.filter((task) => task.sectionId === "")}
              projects={projects}
              index={-1}
            />
            <Droppable droppableId="all-sections" type="section">
              {(provided, snapshot) => (
                <div
                  className={
                    snapshot.isDraggingOver
                      ? "tasks__sections drag-over"
                      : "tasks__sections"
                  }
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  {orderedSections.map((section, index) => {
                    const filtered = orderedTasks.filter(
                      (task) => task.sectionId === section.id
                    );
                    let offset = 0;
                    for (let i = 0; i < orderedTasks.length; i++) {
                      if (orderedTasks[i].sectionId === section.id) break;
                      offset++;
                    }
                    // console.log(section.name + " OFFSET: " + offset);
                    return (
                      <Section
                        key={section.id}
                        tasks={filtered}
                        section={section}
                        projects={projects}
                        index={index}
                        offset={offset}
                      />
                    );
                  })}

                  {/* <Collection tasks={[]} projects={projects} /> */}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <AddTask setShowLoader={setShowLoader} />
          </>
        )}
      </div>
    </DragDropContext>
  );
};
