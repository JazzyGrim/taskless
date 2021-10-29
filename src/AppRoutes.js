import React from "react";
import { App } from "./App";
import { Switch, Route, Redirect } from "react-router-dom";
import { Login } from "./components/routes/Login";
import { SignUp } from "./components/routes/Login/SignUp";
import { AuthProvider } from "./context";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <AuthProvider>
      <Switch>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/signup">
          <SignUp />
        </Route>
        <ProtectedRoute path="/app/" redirectTo="/login">
          <App />
        </ProtectedRoute>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </Switch>
    </AuthProvider>
  );
};
