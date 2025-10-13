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
    React.useEffect(() => {
      console.log('PerspectiveSelector rendered, perspectiveOpen:', perspectiveOpen);
    }, [perspectiveOpen]);

    return (
      <div className="perspective-selector">
        <button
          onClick={() => {
            console.log('Button clicked, current state:', perspectiveOpen);
            setPerspectiveOpen(!perspectiveOpen);
          }}
          style={{
            width: '100%',
            padding: '8px 16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{activePerspective}</span>
          <CaretDownIcon />
        </button>
        
        {perspectiveOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 9999,
            }}
          >
            {perspectives.map((perspective, index) => (
              <div
                key={index}
                onClick={() => {
                  if (!perspective.disabled) {
                    console.log('Perspective selected:', perspective.name);
                    setActivePerspective(perspective.name);
                    setPerspectiveOpen(false);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  cursor: perspective.disabled ? 'not-allowed' : 'pointer',
                  opacity: perspective.disabled ? 0.5 : 1,
                  backgroundColor: 'white',
                  borderBottom: index < perspectives.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!perspective.disabled) {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
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

  const Navigation = (
    <Nav id="nav-primary-simple">
      <PerspectiveSelector />
      <NavList id="nav-list-simple">
        {routes.map((route, idx) =>
          route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx)),
        )}
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
