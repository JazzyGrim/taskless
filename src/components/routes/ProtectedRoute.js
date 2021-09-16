import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthValues } from "../../context";

export const ProtectedRoute = (props) => {
  const { userData } = useAuthValues();
  if (userData.user == null) {
    console.log("Redirecting");
    return <Redirect to={props.redirectTo}></Redirect>;
  } else {
    return (
      <Route exact path={props.path}>
        {props.children}
      </Route>
    );
  }
};
