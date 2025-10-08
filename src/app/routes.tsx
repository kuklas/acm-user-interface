import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { Identities } from '@app/Identities/Identities';
import { IdentityDetail } from '@app/Identities/IdentityDetail';
import { Roles } from '@app/Roles/Roles';
import { IdentityProvider } from '@app/IdentityProvider/IdentityProvider';
import { Clusters } from '@app/Clusters/Clusters';
import { ClusterDetail } from '@app/Clusters/ClusterDetail';
import { NotFound } from '@app/NotFound/NotFound';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
  disabled?: boolean;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
  disabled?: boolean;
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    label: 'Home',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/',
        title: 'ACM | Home',
      },
    ],
  },
  {
    label: 'Infrastructure',
    routes: [
      {
        element: <Clusters />,
        label: 'Clusters',
        path: '/infrastructure/clusters',
        title: 'ACM | Clusters',
      },
      {
        element: <ClusterDetail />,
        path: '/infrastructure/clusters/:clusterName',
        title: 'ACM | Cluster Detail',
      },
    ],
  },
  {
    label: 'Applications',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/applications/overview',
        title: 'ACM | Applications',
      },
    ],
  },
  {
    label: 'Governance',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/governance/overview',
        title: 'ACM | Governance',
      },
    ],
  },
  {
    label: 'Credentials',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/credentials/overview',
        title: 'ACM | Credentials',
      },
    ],
  },
  {
    label: 'Observe',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/observe/overview',
        title: 'ACM | Observe',
      },
    ],
  },
  {
    label: 'Edge management',
    disabled: true,
    routes: [
      {
        element: <Dashboard />,
        label: 'Overview',
        path: '/edge-management/overview',
        title: 'ACM | Edge Management',
      },
    ],
  },
  {
    label: 'User management',
    routes: [
      {
        element: <Identities />,
        label: 'Identities',
        path: '/user-management/identities',
        title: 'ACM | Identities',
      },
      {
        element: <IdentityDetail />,
        path: '/user-management/identities/:identityName',
        title: 'ACM | Identity Detail',
      },
      {
        element: <Roles />,
        label: 'Roles',
        path: '/user-management/roles',
        title: 'ACM | Roles',
      },
      {
        element: <IdentityProvider />,
        label: 'Identity providers',
        path: '/user-management/identity-providers',
        title: 'ACM | Identity Providers',
      },
    ],
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
