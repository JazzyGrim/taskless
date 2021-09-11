import React from "react-dom";

export const Header = () => {
  return (
    <header className="header" data-testid="header">
      <nav>
        <div className="logo">
          <img src="/images/logo.png" alt="Taskless" />
        </div>
        <div className="settings">
          <ul>
            <li>+</li>
            <li>Pizza Slice!</li>
          </ul>
        </div>
      </nav>
    </header>
  );
};
