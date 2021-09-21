import React, { useEffect, useRef, useState } from "react";
import { FaPizzaSlice, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";
import { AddTask } from "../AddTask";
import { getAuth, signOut } from "firebase/auth";
import { IconContext } from "react-icons";
import { CgClose, CgMenuLeftAlt } from "react-icons/cg";

export const Header = ({
  darkMode,
  setDarkMode,
  showSidebar,
  setShowSidebar,
}) => {
  const [shouldShowMain, setShouldShowMain] = useState(false);
  const [showQuickAddTask, setShowQuickAddTask] = useState(false);
  const [showSettings, setShouldShowSettings] = useState(false);
  const wrapperRef = useRef();
  const buttonRef = useRef();

  const handleClick = (e) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(e.target) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target)
    ) {
      setShouldShowSettings(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <header className="header" data-testid="header">
      <nav>
        <button
          className="mobile-menu"
          data-testid="menu-action"
          aria-label="Menu shown/hidden"
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <IconContext.Provider value={{ size: 24, color: "white" }}>
            {showSidebar ? <CgClose /> : <CgMenuLeftAlt />}
          </IconContext.Provider>
        </button>
        <div className="logo">
          <img src="/images/logo.png" alt="Todoist" />
        </div>
        <div className="settings">
          <ul>
            <li className="settings__add">
              <button
                data-testid="quick-add-task-action"
                aria-label="Quick add task"
                type="button"
                onClick={() => {
                  setShowQuickAddTask(true);
                  setShouldShowMain(true);
                }}
              >
                +
              </button>
            </li>
            <li className="settings__darkmode">
              <button
                data-testid="dark-mode-action"
                aria-label="Darkmode on/off"
                type="button"
                onClick={() => setDarkMode(!darkMode)}
              >
                <FaPizzaSlice />
              </button>
            </li>
            <li className="settings__profile">
              <button
                data-testid="user-settings-action"
                aria-label="User Settings"
                type="button"
                onClick={() => setShouldShowSettings((prev) => !prev)}
                ref={buttonRef}
              >
                <FaUserCircle />
              </button>
              {showSettings && (
                <div className="user-settings-modal" ref={wrapperRef}>
                  <span
                    onClick={() => {
                      logout();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        logout();
                      }
                    }}
                    aria-label="Sign out of Taskless"
                    tabIndex={0}
                    role="button"
                  >
                    <FaSignOutAlt />
                    Log out
                  </span>
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      <AddTask
        showAddTaskMain={false}
        shouldShowMain={shouldShowMain}
        showQuickAddTask={showQuickAddTask}
        setShowQuickAddTask={setShowQuickAddTask}
      />
    </header>
  );
};

Header.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};
