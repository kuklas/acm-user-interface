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
    { name: 'Fleet virtualization', disabled: true },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg height="40px" width="40px" viewBox="0 0 192 145">
              <defs>
                <linearGradient id="logo-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#EE0000" />
                  <stop offset="100%" stopColor="#CC0000" />
                </linearGradient>
              </defs>
              <g fill="url(#logo-gradient)">
                <path d="M70,17.7c3.4-3.4,7.8-5.2,13.5-5.2h51.9v11.3h-51.9c-2.4,0-4.4,0.8-6.1,2.5c-1.7,1.7-2.5,3.7-2.5,6.1v22.5h60.5v11.3H74.9v22.5c0,2.4,0.8,4.4,2.5,6.1c1.7,1.7,3.7,2.5,6.1,2.5h51.9v11.3H83.5c-5.7,0-10.1-1.7-13.5-5.2c-3.4-3.4-5.2-7.8-5.2-13.5V30.9C64.8,25.5,66.6,21.1,70,17.7z"/>
                <path d="M0,17.5C3.4,14.1,7.8,12.5,13.5,12.5H55v11.3H13.5c-2.4,0-4.4,0.8-6.1,2.5C5.8,27.9,5,30,5,32.3v22.5h49.5v11.3H5v22.5c0,2.4,0.8,4.4,2.5,6.1c1.7,1.7,3.7,2.5,6.1,2.5H55v11.3H13.5c-5.7,0-10.1-1.7-13.5-5.2C0,100,0,95.6,0,89.9V30.7C0,25.3,1.7,20.9,5.1,17.5z"/>
              </g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>Red Hat</span>
              <span style={{ fontSize: '12px', color: '#f0f0f0' }}>OpenShift Container Platform</span>
            </div>
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
                  <span style={{ color: '#f0f0f0' }}>Walter Joseph Kovacs</span>
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

  const PerspectiveSelector = () => (
    <div className="perspective-selector">
      <Dropdown
        isOpen={perspectiveOpen}
        onSelect={onPerspectiveSelect}
        onOpenChange={(isOpen: boolean) => setPerspectiveOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => setPerspectiveOpen(!perspectiveOpen)}
            isExpanded={perspectiveOpen}
            isFullWidth
          >
            {activePerspective}
          </MenuToggle>
        )}
      >
        <DropdownList>
          {perspectives.map((perspective, index) => (
            <DropdownItem
              key={index}
              value={perspective.name}
              isDisabled={perspective.disabled}
            >
              {perspective.name}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </div>
  );

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
