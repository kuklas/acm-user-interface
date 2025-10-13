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
    { name: 'Core platforms', disabled: true },
    { name: 'Fleet management', disabled: false },
    { name: 'Fleet virtualization', disabled: false },
  ];

  // Fleet virtualization navigation routes
  const fleetVirtualizationRoutes: IAppRouteGroup[] = [
    {
      label: '',
      routes: [
        {
          element: null,
          label: 'Overview',
          path: '/virtualization/overview',
          title: 'Overview',
        },
        {
          element: null,
          label: 'Catalog',
          path: '/virtualization/catalog',
          title: 'Catalog',
        },
        {
          element: null,
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
          element: null,
          label: 'InstanceTypes',
          path: '/virtualization/instance-types',
          title: 'InstanceTypes',
        },
        {
          element: null,
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
          element: null,
          label: 'Identities',
          path: '/user-management/identities',
          title: 'Identities',
        },
        {
          element: null,
          label: 'Identity providers',
          path: '/user-management/identity-providers',
          title: 'Identity providers',
        },
        {
          element: null,
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
  const activeRoutes = activePerspective === 'Fleet virtualization' ? fleetVirtualizationRoutes : routes;

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
                {route.routes.map((subRoute, subIdx) => subRoute.label && renderNavItem(subRoute, `${idx}-${subIdx}`))}
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
