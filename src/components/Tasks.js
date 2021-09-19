import React, { useEffect, useState } from "react";
import { AddTask } from "./AddTask";
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
} from "../context";
import { Spinner } from "./helpers/Spinner";
import { Collection } from "./Collection";
import { Section } from "./Section";

export const Tasks = () => {
  const [showLoader, setShowLoader] = useState(false);
  const { userData } = useAuthValues();
  const { selectedProject } = useSelectedProjectValue();
  const { projects } = useProjectsValue();
  const { tasks } = useTasks(selectedProject, userData.user.uid);
  const { sections } = useSections(selectedProject, userData.user.uid);

  const [orderObject, setOrderObject] = useState({
    for: selectedProject,
    ungrouped: [],
    sectionOrder: [],
    sections: [],
  });

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

  // useEffect(() => {
  //   projects && projects.length > 0 && selectedProject && sortSections();
  // }, [sections]);

  // If we change the selected task, activate the loader
  useEffect(() => {
    setShowLoader(true);
    setOrderObject({ ...orderObject, for: selectedProject });
  }, [selectedProject]);

  useEffect(() => {
    document.title = `${projectName}: Taskless`;
  });

  useEffect(() => {
    if (!projects || !projects.length || collatedTasksExist(selectedProject))
      return;
    calculateOrder(getProjectById(projects, selectedProject));
  }, [projects, selectedProject, tasks, sections]);

  useEffect(() => {}, [tasks, sections]);

  const calculateOrder = (project) => {
    const orderedTasks =
      tasks.length && project.order ? sortArrayById(tasks, project.order) : [];
    const orderedSections =
      sections.length && project.sectionOrder
        ? sortArrayById(sections, project.sectionOrder)
        : [];

    // Find the ungrouped tasks
    const ungrouped = orderedTasks
      .filter((task) => task.sectionId === "")
      .map((task) => task.id);

    const sectionTaskOrder = {
      for: selectedProject,
      ungrouped,
      sectionOrder: project.sectionOrder,
      sections: [],
    };

    orderedSections.forEach((section) => {
      sectionTaskOrder.sections.push({
        id: section.id,
        order: orderedTasks
          .filter((task) => task.sectionId === section.id)
          .map((task) => task.id),
      });
    });

    setOrderObject(sectionTaskOrder);
  };

  const sortArrayById = (sortable, sortWith) => {
    return sortable.slice().sort(function (a, b) {
      return sortWith.indexOf(a.id) - sortWith.indexOf(b.id);
    });
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
      // First update the section order
      let newSectionOrder = [...orderObject.sectionOrder];

      newSectionOrder.splice(source.index, 1);
      newSectionOrder.splice(destination.index, 0, draggableId);

      // Now sort the sections based on the new order
      let newSections = [...orderObject.sections];
      newSections = sortArrayById(newSections, newSectionOrder);

      // Update the order object!
      setOrderObject({
        ...orderObject,
        sectionOrder: newSectionOrder,
        sections: newSections,
      });

      return;
    }
    // ----------------
    // We are dealing with a task
    // ----------------
    // Reorder elements
    // ----------------
    let newTaskOrder = [...getProjectById(projects, selectedProject).order];
    let sourceIndex = source.index;
    let destinationIndex = destination.index;

    let home = orderObject.sections.find((s) => s.id === source.droppableId);
    let foreign = orderObject.sections.find(
      (s) => s.id === destination.droppableId
    );

    // If we are dealing with the ungrouped section
    if (!home) home = { id: "ungrouped", order: orderObject.ungrouped };
    if (!foreign) foreign = { id: "ungrouped", order: orderObject.ungrouped };

    if (JSON.stringify(home) === JSON.stringify(foreign)) {
      const newTaskOrder = Array.from(home.order);
      newTaskOrder.splice(source.index, 1);
      newTaskOrder.splice(destination.index, 0, draggableId);

      // If we are setting the ungrouped order
      if (home.id === "ungrouped") {
        setOrderObject({ ...orderObject, ungrouped: newTaskOrder });
      } else {
        // We are setting a section order
        let newSections = [...orderObject.sections];
        // Go through each section
        newSections = newSections.map((section) => {
          let newSectionData = { ...section };
          // If we find the section we're updating, update it's t ask order
          if (section.id === home.id) newSectionData.order = newTaskOrder;
          return newSectionData;
        });
        setOrderObject({ ...orderObject, sections: newSections });
      }
      return;
    }

    let ungroupedOrder = [...orderObject.ungrouped];

    // Moving from one section to another
    const homeOrder = Array.from(home.order);
    homeOrder.splice(source.index, 1);
    const newHome = {
      ...home,
      order: homeOrder,
    };

    if (newHome.id === "ungrouped") ungroupedOrder = homeOrder;

    const foreignOrder = Array.from(foreign.order);
    foreignOrder.splice(destination.index, 0, draggableId);
    const newForeign = {
      ...foreign,
      order: foreignOrder,
    };

    if (newForeign.id === "ungrouped") ungroupedOrder = foreignOrder;

    // We are setting a section order
    let newSections = [...orderObject.sections];
    // Go through each section
    newSections = newSections.map((section) => {
      let newSectionData = { ...section };
      // If we find the section we're updating, update it's t ask order
      if (section.id === home.id) return newHome;
      if (section.id === foreign.id) return newForeign;
      return newSectionData;
    });

    setOrderObject({
      ...orderObject,
      ungrouped: ungroupedOrder,
      sections: newSections,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tasks" data-testid="tasks">
        <h2 data-testid="project-name">{projectName}</h2>

        {showLoader ? (
          <Spinner />
        ) : selectedProject === "TODAY" || selectedProject === "NEXT_7" ? (
          <Collection tasks={tasks} projects={projects} />
        ) : (
          <>
            {orderObject.for === selectedProject && (
              <Collection
                tasks={
                  tasks.length
                    ? sortArrayById(
                        tasks.filter((t) =>
                          orderObject.ungrouped.includes(t.id)
                        ),
                        orderObject.ungrouped
                      )
                    : []
                }
                projects={projects}
                index={-1}
              />
            )}
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
                  {orderObject.for === selectedProject &&
                    orderObject.sections.map((section, index) => {
                      return (
                        <Section
                          key={section.id}
                          tasks={
                            tasks.length
                              ? sortArrayById(
                                  tasks.filter((t) =>
                                    section.order.includes(t.id)
                                  ),
                                  section.order
                                )
                              : []
                          }
                          section={sections.find((s) => s.id === section.id)}
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
            <AddTask setShowLoader={setShowLoader} />
          </>
        )}
      </div>
    </DragDropContext>
  );
};
