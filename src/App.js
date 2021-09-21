import React, { useState } from "react";
import PropTypes from "prop-types";
import { Header } from "./components/layout/Header";
import { Content } from "./components/layout/Content";
import {
  OrderedDataProvider,
  ProjectsProvider,
  SelectedProjectProvider,
} from "./context";

export const App = ({ darkModeDefault = false }) => {
  const [darkMode, setDarkMode] = useState(darkModeDefault);
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <SelectedProjectProvider>
      <ProjectsProvider>
        <OrderedDataProvider>
          <main
            data-testid="application"
            className={darkMode ? "darkmode" : undefined}
          >
            <Header
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
            <Content
              showSidebar={showSidebar}
              setShowSidebar={setShowSidebar}
            />
          </main>
        </OrderedDataProvider>
      </ProjectsProvider>
    </SelectedProjectProvider>
  );
};

App.propTypes = {
  darkModeDefault: PropTypes.bool,
};
