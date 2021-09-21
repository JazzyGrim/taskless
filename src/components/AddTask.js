import React, { useState } from "react";
import { FaRegListAlt, FaRegCalendarAlt } from "react-icons/fa";
import moment from "moment";
import PropTypes from "prop-types";
import {
  useAuthValues,
  useOrderedDataValue,
  useSelectedProjectValue,
} from "../context";
import { ProjectOverlay } from "./ProjectOverlay";
import { TaskDate } from "./TaskDate";
import { db } from "../firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { generatePushId } from "../helpers";

export const AddTask = ({
  showAddTaskMain = true,
  shouldShowMain = false,
  showQuickAddTask,
  setShowQuickAddTask,
  setShowLoader,
  sectionId = "",
}) => {
  const [task, setTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [project, setProject] = useState("");
  const [showMain, setShowMain] = useState(shouldShowMain);
  const [showProjectOverlay, setShowProjectOverlay] = useState(false);
  const [showTaskDate, setShowTaskDate] = useState(false);
  const { userData } = useAuthValues();

  const { selectedProject } = useSelectedProjectValue();
  const { addTaskToSection } = useOrderedDataValue();

  const addTask = () => {
    const projectId = project || selectedProject;
    let collatedDate = "";

    if (projectId === "TODAY") {
      collatedDate = moment().format("DD/MM/YYYY");
    } else if (projectId === "NEXT_7") {
      collatedDate = moment().add(7, "days").format("DD/MM/YYYY");
    }

    const taskID = generatePushId();
    const tasksRef = doc(db, "tasks", taskID);

    task &&
      projectId &&
      (async () => {
        if (setShowLoader) setShowLoader(true); // Start a loader when adding a new task
        setShowProjectOverlay(false);
        setTask("");
        setTaskDescription("");
        setProject("");
        // setShowMain(false);

        const taskData = {
          archived: false,
          projectId:
            projectId === "TODAY" || projectId === "NEXT_7"
              ? "INBOX"
              : projectId,
          sectionId: sectionId,
          task,
          description: taskDescription,
          date: collatedDate || taskDate,
          userId: userData.user.uid,
        };

        console.log(taskData);

        addTaskToSection({ ...taskData, id: taskID }, sectionId);

        // return;
        await setDoc(tasksRef, taskData);
      })();
  };

  return (
    <div
      className={showQuickAddTask ? "add-task add-task__overlay" : "add-task"}
      data-testid="add-task-comp"
    >
      {showAddTaskMain && !(showMain || showQuickAddTask) && (
        <div
          className="add-task__shallow"
          data-testid="show-main-action"
          onClick={() => setShowMain(!showMain)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setShowMain(!showMain);
          }}
          tabIndex={0}
          aria-label="Add task"
          role="button"
        >
          <span className="add-task__plus">+</span>
          <span className="add-task__text">Add Task</span>
        </div>
      )}

      {(showMain || showQuickAddTask) && (
        <div className="add-task__main" data-testid="add-task-main">
          {showQuickAddTask && (
            <>
              <div className="header-container" data-testid="quick-add-task">
                <h2 className="header">Quick Add Task</h2>
                <span
                  className="add-task__cancel-x"
                  data-testid="add-task-quick-cancel"
                  aria-label="Cancel adding task"
                  onClick={() => {
                    setShowMain(false);
                    setShowProjectOverlay(false);
                    setShowQuickAddTask(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setShowMain(false);
                      setShowProjectOverlay(false);
                      setShowQuickAddTask(false);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  X
                </span>
              </div>
            </>
          )}
          <ProjectOverlay
            setProject={setProject}
            showProjectOverlay={showProjectOverlay}
            setShowProjectOverlay={setShowProjectOverlay}
          />
          <TaskDate
            setTaskDate={setTaskDate}
            showTaskDate={showTaskDate}
            setShowTaskDate={setShowTaskDate}
          />
          <div className="add-task__input-container">
            <input
              className="add-task__content add-task__content--title"
              aria-label="Enter your task"
              data-testid="add-task-content"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  showQuickAddTask
                    ? addTask() && setShowQuickAddTask(false)
                    : addTask();
                } else if (e.key === "Escape") {
                  setShowMain(false);
                  setShowProjectOverlay(false);
                }
              }}
              placeholder="e.g. Go shopping"
              autoFocus
            />
            <input
              className="add-task__content add-task__content--description"
              aria-label="Enter your task description"
              data-testid="add-task-content"
              type="text"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  showQuickAddTask
                    ? addTask() && setShowQuickAddTask(false)
                    : addTask();
                } else if (e.key === "Escape") {
                  setShowMain(false);
                  setShowProjectOverlay(false);
                }
              }}
              placeholder="Description"
            />
          </div>
          <button
            type="button"
            className="add-task__submit"
            data-testid="add-task"
            onClick={() =>
              showQuickAddTask
                ? addTask() && setShowQuickAddTask(false)
                : addTask()
            }
          >
            Add Task
          </button>
          {!showQuickAddTask && (
            <span
              className="add-task__cancel"
              data-testid="add-task-main-cancel"
              onClick={() => {
                setShowMain(false);
                setShowProjectOverlay(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowMain(false);
                  setShowProjectOverlay(false);
                }
              }}
              aria-label="Cancel adding a task"
              tabIndex={0}
              role="button"
            >
              Cancel
            </span>
          )}
          <span
            className="add-task__project"
            data-testid="show-project-overlay"
            onClick={() => setShowProjectOverlay(!showProjectOverlay)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setShowProjectOverlay(!showProjectOverlay);
            }}
            tabIndex={0}
            role="button"
          >
            <FaRegListAlt />
          </span>
          <span
            className="add-task__date"
            data-testid="show-task-date-overlay"
            onClick={() => setShowTaskDate(!showTaskDate)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setShowTaskDate(!showTaskDate);
            }}
            tabIndex={0}
            role="button"
          >
            <FaRegCalendarAlt />
          </span>
        </div>
      )}
    </div>
  );
};

AddTask.propTypes = {
  showAddTaskMain: PropTypes.bool,
  shouldShowMain: PropTypes.bool,
  showQuickAddTask: PropTypes.bool,
  setShowQuickAddTask: PropTypes.func,
};
