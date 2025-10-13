import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Button,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Icon,
} from '@patternfly/react-core';
import { IAppRoute, IAppRouteGroup, routes } from '@app/routes';
import {
  BarsIcon,
  CaretDownIcon,
  CogIcon,
  QuestionCircleIcon,
  BellIcon,
  EllipsisVIcon,
  CubeIcon,
} from '@patternfly/react-icons';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [perspectiveOpen, setPerspectiveOpen] = React.useState(false);
  const [activePerspective, setActivePerspective] = React.useState('Fleet management');

  const perspectives = [
    { name: 'Core platforms', disabled: false },
    { name: 'Fleet management', disabled: false },
    { name: 'Fleet virtualization', disabled: false },
  ];

  // Core platforms navigation routes
  const corePlatformsRoutes: IAppRouteGroup[] = [
    {
      label: 'Home',
      routes: [
        {
          element: <></>,
          label: 'Overview',
          path: '/core/home/overview',
          title: 'Overview',
        },
        {
          element: <></>,
          label: 'All projects',
          path: '/core/home/projects',
          title: 'All projects',
        },
      ],
    },
    {
      label: 'Favorites',
      routes: [
        {
          element: <></>,
          label: 'Overview',
          path: '/core/favorites/overview',
          title: 'Overview',
        },
      ],
    },
    {
      label: 'Operators',
      routes: [
        {
          element: <></>,
          label: 'OperatorHub',
          path: '/core/operators/hub',
          title: 'OperatorHub',
        },
        {
          element: <></>,
          label: 'Installed Operators',
          path: '/core/operators/installed',
          title: 'Installed Operators',
        },
      ],
    },
    {
      label: 'Helm',
      routes: [
        {
          element: <></>,
          label: 'Helm Releases',
          path: '/core/helm/releases',
          title: 'Helm Releases',
        },
      ],
    },
    {
      label: 'Workloads',
      routes: [
        {
          element: <></>,
          label: 'Pods',
          path: '/core/workloads/pods',
          title: 'Pods',
        },
        {
          element: <></>,
          label: 'Deployments',
          path: '/core/workloads/deployments',
          title: 'Deployments',
        },
        {
          element: <></>,
          label: 'StatefulSets',
          path: '/core/workloads/statefulsets',
          title: 'StatefulSets',
        },
      ],
    },
    {
      label: 'Virtualization',
      routes: [
        {
          element: <></>,
          label: 'VirtualMachines',
          path: '/core/virtualization/vms',
          title: 'VirtualMachines',
        },
        {
          element: <></>,
          label: 'Templates',
          path: '/core/virtualization/templates',
          title: 'Templates',
        },
      ],
    },
    {
      label: 'Migration',
      routes: [
        {
          element: <></>,
          label: 'Migrations',
          path: '/core/migration/migrations',
          title: 'Migrations',
        },
      ],
    },
    {
      label: 'GitOps',
      routes: [
        {
          element: <></>,
          label: 'Applications',
          path: '/core/gitops/applications',
          title: 'Applications',
        },
      ],
    },
    {
      label: 'Serverless',
      routes: [
        {
          element: <></>,
          label: 'Services',
          path: '/core/serverless/services',
          title: 'Services',
        },
        {
          element: <></>,
          label: 'Revisions',
          path: '/core/serverless/revisions',
          title: 'Revisions',
        },
      ],
    },
    {
      label: 'Networking',
      routes: [
        {
          element: <></>,
          label: 'Services',
          path: '/core/networking/services',
          title: 'Services',
        },
        {
          element: <></>,
          label: 'Routes',
          path: '/core/networking/routes',
          title: 'Routes',
        },
        {
          element: <></>,
          label: 'Ingresses',
          path: '/core/networking/ingresses',
          title: 'Ingresses',
        },
      ],
    },
    {
      label: 'Storage',
      routes: [
        {
          element: <></>,
          label: 'PersistentVolumeClaims',
          path: '/core/storage/pvcs',
          title: 'PersistentVolumeClaims',
        },
        {
          element: <></>,
          label: 'StorageClasses',
          path: '/core/storage/classes',
          title: 'StorageClasses',
        },
      ],
    },
    {
      label: 'Builds',
      routes: [
        {
          element: <></>,
          label: 'BuildConfigs',
          path: '/core/builds/configs',
          title: 'BuildConfigs',
        },
        {
          element: <></>,
          label: 'Builds',
          path: '/core/builds/builds',
          title: 'Builds',
        },
      ],
    },
    {
      label: 'Pipelines',
      routes: [
        {
          element: <></>,
          label: 'Pipelines',
          path: '/core/pipelines/pipelines',
          title: 'Pipelines',
        },
        {
          element: <></>,
          label: 'PipelineRuns',
          path: '/core/pipelines/runs',
          title: 'PipelineRuns',
        },
      ],
    },
    {
      label: 'Observe',
      routes: [
        {
          element: <></>,
          label: 'Dashboards',
          path: '/core/observe/dashboards',
          title: 'Dashboards',
        },
        {
          element: <></>,
          label: 'Metrics',
          path: '/core/observe/metrics',
          title: 'Metrics',
        },
        {
          element: <></>,
          label: 'Alerts',
          path: '/core/observe/alerts',
          title: 'Alerts',
        },
      ],
    },
    {
      label: 'Compute',
      routes: [
        {
          element: <></>,
          label: 'Nodes',
          path: '/core/compute/nodes',
          title: 'Nodes',
        },
        {
          element: <></>,
          label: 'MachineSets',
          path: '/core/compute/machinesets',
          title: 'MachineSets',
        },
      ],
    },
    {
      label: 'User Management',
      routes: [
        {
          element: <></>,
          label: 'Users',
          path: '/core/user-management/users',
          title: 'Users',
        },
        {
          element: <></>,
          label: 'Groups',
          path: '/core/user-management/groups',
          title: 'Groups',
        },
        {
          element: <></>,
          label: 'Roles',
          path: '/core/user-management/roles',
          title: 'Roles',
        },
      ],
    },
    {
      label: 'Administration',
      routes: [
        {
          element: <></>,
          label: 'Cluster Settings',
          path: '/core/administration/settings',
          title: 'Cluster Settings',
        },
        {
          element: <></>,
          label: 'Namespaces',
          path: '/core/administration/namespaces',
          title: 'Namespaces',
        },
      ],
    },
  ];

  // Fleet virtualization navigation routes
  const fleetVirtualizationRoutes: IAppRouteGroup[] = [
    {
      label: '',
      routes: [
        {
          element: <></>,
          label: 'Overview',
          path: '/virtualization/overview',
          title: 'Overview',
        },
        {
          element: <></>,
          label: 'Catalog',
          path: '/virtualization/catalog',
          title: 'Catalog',
        },
        {
          element: <></>,
          label: 'Virtual machines',
          path: '/virtualization/virtual-machines',
          title: 'Virtual machines',
        },
      ],
    },
    {
      label: '',
      routes: [
        {
          element: <></>,
          label: 'InstanceTypes',
          path: '/virtualization/instance-types',
          title: 'InstanceTypes',
        },
        {
          element: <></>,
          label: 'Templates',
          path: '/virtualization/templates',
          title: 'Templates',
        },
      ],
    },
    {
      label: 'User management',
      routes: [
        {
          element: <></>,
          label: 'Identities',
          path: '/user-management/identities',
          title: 'Identities',
        },
        {
          element: <></>,
          label: 'Identity providers',
          path: '/user-management/identity-providers',
          title: 'Identity providers',
        },
        {
          element: <></>,
          label: 'Roles',
          path: '/user-management/roles',
          title: 'Roles',
        },
      ],
    },
  ];

  const onPerspectiveSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    const perspectiveName = value as string;
    const perspective = perspectives.find((p) => p.name === perspectiveName);
    if (perspective && !perspective.disabled) {
      setActivePerspective(perspectiveName);
      setPerspectiveOpen(false);
    }
  };

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <Button
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#151515', letterSpacing: '-0.02em' }}>Red Hat</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#151515', letterSpacing: '-0.01em' }}>OpenShift</span>
          </div>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar isFullHeight isStatic>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem>
                <Button variant="plain" aria-label="Settings">
                  <Icon>
                    <CogIcon />
                  </Icon>
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="plain" aria-label="Help">
                  <Icon>
                    <QuestionCircleIcon />
                  </Icon>
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="plain" aria-label="Notifications">
                  <Icon>
                    <BellIcon />
                  </Icon>
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="plain" aria-label="User menu">
                  <span style={{ color: '#000000' }}>Walter Joseph Kovacs</span>
                  <Icon>
                    <CaretDownIcon />
                  </Icon>
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  const location = useLocation();

  const renderNavItem = (route: IAppRoute, index: number) => (
    <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`} isActive={route.path === location.pathname}>
      <NavLink to={route.path}>{route.label}</NavLink>
    </NavItem>
  );

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => {
    // For disabled groups, render as non-expandable nav items (just the group title, not clickable)
    if (group.disabled) {
      return (
        <NavItem key={`${group.label}-${groupIndex}`} disabled>
          {group.label}
        </NavItem>
      );
    }
    
    // For enabled groups, render as expandable
    return (
      <NavExpandable
        key={`${group.label}-${groupIndex}`}
        id={`${group.label}-${groupIndex}`}
        title={group.label}
        isActive={group.routes.some((route) => route.path === location.pathname)}
        isExpanded={group.routes.some((route) => route.path === location.pathname)}
      >
        {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
      </NavExpandable>
    );
  };

  const PerspectiveSelector = () => {
    return (
      <div className="perspective-selector" style={{ position: 'relative' }}>
        <button
          onClick={() => setPerspectiveOpen(!perspectiveOpen)}
          style={{
            width: '100%',
            padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
            border: `1px solid var(--pf-t--global--border--color--default)`,
            borderRadius: perspectiveOpen 
              ? 'var(--pf-t--global--border--radius--small) var(--pf-t--global--border--radius--small) 0 0'
              : 'var(--pf-t--global--border--radius--small)',
            background: 'var(--pf-t--global--background--color--primary--default)',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--pf-t--global--font--size--body--default)',
            fontWeight: 'var(--pf-t--global--font--weight--body--default)',
            color: 'var(--pf-t--global--text--color--regular)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)' }}>
            <Icon size="md">
              <CubeIcon />
            </Icon>
            <span>{activePerspective}</span>
          </div>
          <CaretDownIcon />
        </button>
        
        {perspectiveOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '-1px',
              backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
              border: `1px solid var(--pf-t--global--border--color--default)`,
              borderRadius: '0 0 var(--pf-t--global--border--radius--small) var(--pf-t--global--border--radius--small)',
              boxShadow: 'var(--pf-t--global--box-shadow--lg)',
              zIndex: 9999,
              overflow: 'hidden',
            }}
          >
            {perspectives.map((perspective, index) => (
              <div
                key={index}
                onClick={() => {
                  if (!perspective.disabled) {
                    setActivePerspective(perspective.name);
                    setPerspectiveOpen(false);
                  }
                }}
                style={{
                  padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
                  cursor: perspective.disabled ? 'not-allowed' : 'pointer',
                  opacity: perspective.disabled ? 0.6 : 1,
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                  fontSize: 'var(--pf-t--global--font--size--body--default)',
                  color: perspective.disabled 
                    ? 'var(--pf-t--global--text--color--disabled)' 
                    : 'var(--pf-t--global--text--color--regular)',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!perspective.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--pf-t--global--background--color--action--hover--default)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--pf-t--global--background--color--primary--default)';
                }}
              >
                {perspective.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Select routes based on active perspective
  const activeRoutes = 
    activePerspective === 'Core platforms' ? corePlatformsRoutes :
    activePerspective === 'Fleet virtualization' ? fleetVirtualizationRoutes : 
    routes;

  const Navigation = (
    <Nav id="nav-primary-simple">
      <PerspectiveSelector />
      <NavList id="nav-list-simple">
        {activeRoutes.map((route, idx) => {
          // Handle groups with empty labels (for dividers)
          if (route.routes && route.label === '') {
            return (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <div
                    style={{
                      borderTop: '1px solid var(--pf-t--global--border--color--default)',
                      margin: 'var(--pf-t--global--spacer--md) 0',
                    }}
                  />
                )}
                {route.routes.map((subRoute, subIdx) => subRoute.label && renderNavItem(subRoute, idx * 1000 + subIdx))}
              </React.Fragment>
            );
          }
          // Handle regular routes and groups
          return route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx));
        })}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar>
      <PageSidebarBody>{Navigation}</PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        primaryContentContainer?.focus();
      }}
      href={`#${pageId}`}
    >
      Skip to Content
    </SkipToContent>
  );

  return (
    <Page
      mainContainerId={pageId}
      masthead={masthead}
      sidebar={sidebarOpen && Sidebar}
      skipToContent={PageSkipToContent}
    >
      {children}
    </Page>
  );
};

export { AppLayout };
