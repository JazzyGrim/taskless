import React, { useState } from "react";
import {
  FaChevronDown,
  FaInbox,
  FaRegCalendarAlt,
  FaRegCalendar,
} from "react-icons/fa";
import { Projects } from "../Projects";
import { useSelectedProjectValue } from "../../context";

export const Sidebar = ({ show, setShow }) => {
  const { selectedProject, setSelectedProject } = useSelectedProjectValue();
  const [showProjects, setShowProjects] = useState(true);

  return (
    <>
      <div
        className={show ? "sidebar__overlay " : ""}
        onClick={() => setShow(false)}
      />
      <div
        className={show ? "sidebar sidebar--shown" : "sidebar"}
        data-testid="sidebar"
      >
        <ul className="sidebar__generic">
          <li
            data-testid="inbox"
            className={selectedProject === "INBOX" ? "active" : undefined}
          >
            <div
              data-testid="inbox-action"
              aria-label="Show inbox tasks"
              tabIndex={0}
              role="button"
              onClick={() => {
                setSelectedProject("INBOX");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSelectedProject("INBOX");
                }
              }}
            >
              <span>
                <FaInbox />
              </span>
              <span>Inbox</span>
            </div>
          </li>
          <li
            data-testid="today"
            className={selectedProject === "TODAY" ? "active" : undefined}
          >
            <div
              data-testid="today-action"
              aria-label="Show today's tasks"
              tabIndex={0}
              role="button"
              onClick={() => {
                setSelectedProject("TODAY");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSelectedProject("TODAY");
                }
              }}
            >
              <span>
                <FaRegCalendar />
              </span>
              <span>Today</span>
            </div>
          </li>
          <li
            data-testid="next_7"
            className={selectedProject === "NEXT_7" ? "active" : undefined}
          >
            <div
              data-testid="next_7-action"
              aria-label="Show tasks for the next 7 days"
              tabIndex={0}
              role="button"
              onClick={() => {
                setSelectedProject("NEXT_7");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSelectedProject("NEXT_7");
                }
              }}
            >
              <span>
                <FaRegCalendarAlt />
              </span>
              <span>Next 7 days</span>
            </div>
          </li>
        </ul>
        <div
          className="sidebar__middle"
          aria-label="Show/hide projects"
          onClick={() => setShowProjects(!showProjects)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setShowProjects(!showProjects);
          }}
          role="button"
          tabIndex={0}
        >
          <span>
            <FaChevronDown
              className={!showProjects ? "hidden-projects" : undefined}
            />
          </span>
          <h2>Projects</h2>
        </div>

        <ul className="sidebar__projects">{showProjects && <Projects />}</ul>
      </div>
    </>
  );
};
