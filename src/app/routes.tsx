import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { Support } from '@app/Support/Support';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { IdentityDetail } from '@app/Identities/IdentityDetail';
import { GroupDetail } from '@app/Identities/GroupDetail';
import { CreateRole } from '@app/Roles/CreateRole';
import { RoleDetail } from '@app/Roles/RoleDetail';
import { IdentityProviderDetail } from '@app/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider } from '@app/IdentityProvider/AddLDAPProvider';
import { NotFound } from '@app/NotFound/NotFound';
import {
  ClustersPage,
  ClusterDetailPage,
  IdentitiesPage,
  RolesPage,
  IdentityProvidersPage
} from '@app/navigation';

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
        element: <ClustersPage />,
        label: 'Clusters',
        path: '/infrastructure/clusters',
        title: 'ACM | Clusters',
      },
      {
        element: <ClusterDetailPage />,
        path: '/infrastructure/clusters/:clusterName',
        title: 'ACM | Cluster Detail',
      },
      {
        element: <Dashboard />,
        label: 'Automation',
        path: '/infrastructure/automation',
        title: 'ACM | Automation',
      },
      {
        element: <Dashboard />,
        label: 'Host inventory',
        path: '/infrastructure/host-inventory',
        title: 'ACM | Host Inventory',
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
        element: <IdentitiesPage />,
        label: 'Identities',
        path: '/user-management/identities',
        title: 'ACM | Identities',
      },
      {
        element: <GroupDetail />,
        path: '/user-management/groups/:groupName',
        title: 'ACM | Group Detail',
      },
      {
        element: <IdentityDetail />,
        path: '/user-management/identities/:identityName',
        title: 'ACM | Identity Detail',
      },
      {
        element: <RolesPage />,
        label: 'Roles',
        path: '/user-management/roles',
        title: 'ACM | Roles',
      },
      {
        element: <CreateRole />,
        path: '/user-management/roles/create',
        title: 'ACM | Create Role',
      },
      {
        element: <RoleDetail />,
        path: '/user-management/roles/:roleName',
        title: 'ACM | Role Detail',
      },
      {
        element: <IdentityProvidersPage />,
        label: 'Identity providers',
        path: '/user-management/identity-providers',
        title: 'ACM | Identity Providers',
      },
      {
        element: <AddLDAPProvider />,
        path: '/user-management/identity-providers/add/ldap',
        title: 'ACM | Add LDAP Provider',
      },
      {
        element: <IdentityProviderDetail />,
        path: '/user-management/identity-providers/:providerName',
        title: 'ACM | Identity Provider Detail',
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
