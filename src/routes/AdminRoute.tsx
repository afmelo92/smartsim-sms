import React from 'react';
import {
  Route as ReactDOMRoute,
  RouteProps as ReactDOMRouteProps,
  Redirect,
} from 'react-router-dom';

import { useAuth } from '../hooks/auth';

interface RouteProps extends ReactDOMRouteProps {
  isPrivate?: boolean;
  isAdmin?: boolean;
  component: React.ComponentType;
}

const AdminRoute: React.FC<RouteProps> = ({
  isAdmin = false,
  component: Component,
  ...rest
}) => {
  const { user } = useAuth();

  return (
    <ReactDOMRoute
      {...rest}
      render={({ location }) => {
        return isAdmin === !!user.admin ? (
          <Component />
        ) : (
          <Redirect
            to={{
              pathname: isAdmin ? '/' : '/dashboard',
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

export default AdminRoute;
