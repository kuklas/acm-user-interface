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
            <svg height="40px" width="50px" viewBox="0 0 100 80">
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EE0000" />
                  <stop offset="100%" stopColor="#CC0000" />
                </linearGradient>
              </defs>
              {/* Red Hat Fedora */}
              <g fill="url(#logo-gradient)">
                <path d="M15,25 C15,15 25,10 35,10 C45,10 55,15 55,25 C55,30 50,35 45,35 L40,35 L40,45 C40,50 35,55 30,55 L25,55 C20,55 15,50 15,45 L15,25 Z" />
                <path d="M35,10 C35,5 40,0 45,0 C50,0 55,5 55,10" fill="none" stroke="url(#logo-gradient)" strokeWidth="2"/>
                <path d="M25,35 L30,35 C32,35 34,37 34,39 L34,45 C34,47 32,49 30,49 L25,49 C23,49 21,47 21,45 L21,39 C21,37 23,35 25,35 Z" fill="#000000"/>
              </g>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>Red Hat</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0' }}>OpenShift</span>
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
