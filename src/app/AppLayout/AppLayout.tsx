import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Modal,
  ModalVariant,
  Title,
  Content,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Alert,
  Tabs,
  Tab,
  TabTitleText,
  Card,
  CardBody,
  Label,
  Divider,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Banner,
  Spinner,
} from '@patternfly/react-core';
import { IAppRoute, IAppRouteGroup, routes } from '@app/routes';
import { VirtualMachines } from '@app/VirtualMachines/VirtualMachines';
import { IdentityProvider } from '@app/IdentityProvider/IdentityProvider';
import { OverviewPage, CatalogPage, InstanceTypesPage, TemplatesPage } from '@app/FleetVirtualization/EmptyPages';
import {
  BarsIcon,
  CaretDownIcon,
  CogIcon,
  QuestionCircleIcon,
  BellIcon,
  EllipsisVIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useImpersonation } from '@app/contexts/ImpersonationContext';
import virtIcon from '@app/bgimages/virt-icon.png';
import multiclusterIcon from '@app/bgimages/pficon-multicluster.svg';
import redHatOpenShiftLogo from '@app/bgimages/redhatopenshift.svg';

interface IAppLayout {
  children: React.ReactNode;
}

// Custom Core Platforms icon component
const CorePlatformsIcon: React.FC<{ size?: string }> = ({ size = '20px' }) => (
  <svg 
    viewBox="0 0 640 512" 
    fill="currentColor" 
    aria-hidden="true" 
    role="img" 
    width={size} 
    height={size}
    style={{ display: 'inline-block' }}
  >
    <path d="M512.1 191l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0L552 6.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zm-10.5-58.8c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.7-82.4 14.3-52.8 52.8zM386.3 286.1l33.7 16.8c10.1 5.8 14.5 18.1 10.5 29.1-8.9 24.2-26.4 46.4-42.6 65.8-7.4 8.9-20.2 11.1-30.3 5.3l-29.1-16.8c-16 13.7-34.6 24.6-54.9 31.7v33.6c0 11.6-8.3 21.6-19.7 23.6-24.6 4.2-50.4 4.4-75.9 0-11.5-2-20-11.9-20-23.6V418c-20.3-7.2-38.9-18-54.9-31.7L74 403c-10 5.8-22.9 3.6-30.3-5.3-16.2-19.4-33.3-41.6-42.2-65.7-4-10.9.4-23.2 10.5-29.1l33.3-16.8c-3.9-20.9-3.9-42.4 0-63.4L12 205.8c-10.1-5.8-14.6-18.1-10.5-29 8.9-24.2 26-46.4 42.2-65.8 7.4-8.9 20.2-11.1 30.3-5.3l29.1 16.8c16-13.7 34.6-24.6 54.9-31.7V57.1c0-11.5 8.2-21.5 19.6-23.5 24.6-4.2 50.5-4.4 76-.1 11.5 2 20 11.9 20 23.6v33.6c20.3 7.2 38.9 18 54.9 31.7l29.1-16.8c10-5.8 22.9-3.6 30.3 5.3 16.2 19.4 33.2 41.6 42.1 65.8 4 10.9.1 23.2-10 29.1l-33.7 16.8c3.9 21 3.9 42.5 0 63.5zm-117.6 21.1c59.2-77-28.7-164.9-105.7-105.7-59.2 77 28.7 164.9 105.7 105.7zm243.4 182.7l-8.2 14.3c-3 5.3-9.4 7.5-15.1 5.4-11.8-4.4-22.6-10.7-32.1-18.6-4.6-3.8-5.8-10.5-2.8-15.7l8.2-14.3c-6.9-8-12.3-17.3-15.9-27.4h-16.5c-6 0-11.2-4.3-12.2-10.3-2-12-2.1-24.6 0-37.1 1-6 6.2-10.4 12.2-10.4h16.5c3.6-10.1 9-19.4 15.9-27.4l-8.2-14.3c-3-5.2-1.9-11.9 2.8-15.7 9.5-7.9 20.4-14.2 32.1-18.6 5.7-2.1 12.1.1 15.1 5.4l8.2 14.3c10.5-1.9 21.2-1.9 31.7 0l8.2-14.3c3-5.3 9.4-7.5 15.1-5.4 11.8 4.4 22.6 10.7 32.1 18.6 4.6 3.8 5.8 10.5 2.8 15.7l-8.2 14.3c6.9 8 12.3 17.3 15.9 27.4h16.5c6 0 11.2 4.3 12.2 10.3 2 12 2.1 24.6 0 37.1-1 6-6.2 10.4-12.2 10.4h-16.5c-3.6 10.1-9 19.4-15.9 27.4l8.2 14.3c3 5.2 1.9 11.9-2.8 15.7-9.5 7.9-20.4 14.2-32.1 18.6-5.7 2.1-12.1-.1-15.1-5.4l-8.2-14.3c-10.4 1.9-21.2 1.9-31.7 0zM501.6 431c38.5 29.6 82.4-14.3 52.8-52.8-38.5-29.6-82.4 14.3-52.8 52.8z"></path>
  </svg>
);

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [perspectiveOpen, setPerspectiveOpen] = React.useState(false);
  const [activePerspective, setActivePerspective] = React.useState('Fleet management');
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const { impersonatingUser, impersonatingGroups, isLoading, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const hasNavigatedRef = React.useRef(false);

  // When impersonation starts, switch to Fleet virtualization perspective and navigate to Virtual machines (only once)
  React.useEffect(() => {
    if (impersonatingUser && !hasNavigatedRef.current) {
      setActivePerspective('Fleet virtualization');
      navigate('/virtualization/virtual-machines');
      hasNavigatedRef.current = true;
    } else if (!impersonatingUser) {
      // Reset the flag when impersonation stops
      hasNavigatedRef.current = false;
    }
  }, [impersonatingUser, navigate]);

  const allPerspectives = [
    { name: 'Core platforms', disabled: false },
    { name: 'Fleet management', disabled: false },
    { name: 'Fleet virtualization', disabled: false },
  ];

  // Filter perspectives: only show Fleet virtualization when impersonating
  const perspectives = impersonatingUser
    ? allPerspectives.filter((p) => p.name === 'Fleet virtualization')
    : allPerspectives;

  // Core platforms navigation routes
  const corePlatformsRoutes: IAppRouteGroup[] = [
    {
      label: 'Home',
      routes: [
        { element: <></>, label: 'Overview', path: '/core/home/overview', title: 'Overview' },
        { element: <></>, label: 'Projects', path: '/core/home/projects', title: 'Projects' },
        { element: <></>, label: 'Search', path: '/core/home/search', title: 'Search' },
        { element: <></>, label: 'Software Catalog', path: '/core/home/catalog', title: 'Software Catalog' },
        { element: <></>, label: 'API Explorer', path: '/core/home/api-explorer', title: 'API Explorer' },
        { element: <></>, label: 'Events', path: '/core/home/events', title: 'Events' },
      ],
    },
    {
      label: 'Favorites',
      routes: [
        { element: <></>, label: 'No favorites added', path: '/core/favorites/none', title: 'No favorites added' },
      ],
    },
    {
      label: 'Operators',
      routes: [
        { element: <></>, label: 'OperatorHub', path: '/core/operators/hub', title: 'OperatorHub' },
        { element: <></>, label: 'Installed Operators', path: '/core/operators/installed', title: 'Installed Operators' },
      ],
    },
    {
      label: 'Helm',
      routes: [
        { element: <></>, label: 'Repositories', path: '/core/helm/repositories', title: 'Repositories' },
        { element: <></>, label: 'Releases', path: '/core/helm/releases', title: 'Releases' },
      ],
    },
    {
      label: 'Workloads',
      routes: [
        { element: <></>, label: 'Topology', path: '/core/workloads/topology', title: 'Topology' },
        { element: <></>, label: 'Pods', path: '/core/workloads/pods', title: 'Pods' },
        { element: <></>, label: 'Deployments', path: '/core/workloads/deployments', title: 'Deployments' },
        { element: <></>, label: 'DeploymentConfigs', path: '/core/workloads/deploymentconfigs', title: 'DeploymentConfigs' },
        { element: <></>, label: 'StatefulSets', path: '/core/workloads/statefulsets', title: 'StatefulSets' },
        { element: <></>, label: 'Secrets', path: '/core/workloads/secrets', title: 'Secrets' },
        { element: <></>, label: 'ConfigMaps', path: '/core/workloads/configmaps', title: 'ConfigMaps' },
        { element: <></>, label: 'CronJobs', path: '/core/workloads/cronjobs', title: 'CronJobs' },
        { element: <></>, label: 'Jobs', path: '/core/workloads/jobs', title: 'Jobs' },
        { element: <></>, label: 'DaemonSets', path: '/core/workloads/daemonsets', title: 'DaemonSets' },
        { element: <></>, label: 'ReplicaSets', path: '/core/workloads/replicasets', title: 'ReplicaSets' },
        { element: <></>, label: 'ReplicationControllers', path: '/core/workloads/replicationcontrollers', title: 'ReplicationControllers' },
        { element: <></>, label: 'HorizontalPodAutoscalers', path: '/core/workloads/hpas', title: 'HorizontalPodAutoscalers' },
        { element: <></>, label: 'PodDisruptionBudgets', path: '/core/workloads/pdbs', title: 'PodDisruptionBudgets' },
      ],
    },
    {
      label: 'Virtualization',
      routes: [
        { element: <></>, label: 'Overview', path: '/core/virtualization/overview', title: 'Overview' },
        { element: <></>, label: 'Catalog', path: '/core/virtualization/catalog', title: 'Catalog' },
        { element: <></>, label: 'VirtualMachines', path: '/core/virtualization/vms', title: 'VirtualMachines' },
        { element: <></>, label: 'Templates', path: '/core/virtualization/templates', title: 'Templates' },
        { element: <></>, label: 'InstanceTypes', path: '/core/virtualization/instancetypes', title: 'InstanceTypes' },
        { element: <></>, label: 'Preferences', path: '/core/virtualization/preferences', title: 'Preferences' },
        { element: <></>, label: 'Bootable volumes', path: '/core/virtualization/bootable-volumes', title: 'Bootable volumes' },
        { element: <></>, label: 'MigrationPolicies', path: '/core/virtualization/migration-policies', title: 'MigrationPolicies' },
        { element: <></>, label: 'Checkups', path: '/core/virtualization/checkups', title: 'Checkups' },
      ],
    },
    {
      label: 'Migration',
      routes: [
        { element: <></>, label: 'Overview', path: '/core/migration/overview', title: 'Overview' },
        { element: <></>, label: 'Providers for virtualization', path: '/core/migration/providers', title: 'Providers for virtualization' },
        { element: <></>, label: 'Plans for virtualization', path: '/core/migration/plans', title: 'Plans for virtualization' },
        { element: <></>, label: 'StorageMaps for virtualization', path: '/core/migration/storage-maps', title: 'StorageMaps for virtualization' },
        { element: <></>, label: 'NetworkMaps for virtualization', path: '/core/migration/network-maps', title: 'NetworkMaps for virtualization' },
      ],
    },
    {
      label: 'GitOps',
      routes: [
        { element: <></>, label: 'Applications', path: '/core/gitops/applications', title: 'Applications' },
        { element: <></>, label: 'ApplicationSets', path: '/core/gitops/applicationsets', title: 'ApplicationSets' },
      ],
    },
    {
      label: 'Serverless',
      routes: [
        { element: <></>, label: 'Serving', path: '/core/serverless/serving', title: 'Serving' },
        { element: <></>, label: 'Functions', path: '/core/serverless/functions', title: 'Functions' },
      ],
    },
    {
      label: 'Networking',
      routes: [
        { element: <></>, label: 'Services', path: '/core/networking/services', title: 'Services' },
        { element: <></>, label: 'Routes', path: '/core/networking/routes', title: 'Routes' },
        { element: <></>, label: 'Ingresses', path: '/core/networking/ingresses', title: 'Ingresses' },
        { element: <></>, label: 'NetworkPolicies', path: '/core/networking/network-policies', title: 'NetworkPolicies' },
        { element: <></>, label: 'NetworkAttachmentDefinitions', path: '/core/networking/network-attachment-definitions', title: 'NetworkAttachmentDefinitions' },
        { element: <></>, label: 'UserDefinedNetworks', path: '/core/networking/user-defined-networks', title: 'UserDefinedNetworks' },
      ],
    },
    {
      label: 'Storage',
      routes: [
        { element: <></>, label: 'PersistentVolumes', path: '/core/storage/pvs', title: 'PersistentVolumes' },
        { element: <></>, label: 'PersistentVolumeClaims', path: '/core/storage/pvcs', title: 'PersistentVolumeClaims' },
        { element: <></>, label: 'StorageClasses', path: '/core/storage/classes', title: 'StorageClasses' },
        { element: <></>, label: 'VolumeSnapshots', path: '/core/storage/volume-snapshots', title: 'VolumeSnapshots' },
        { element: <></>, label: 'VolumeSnapshotClasses', path: '/core/storage/volume-snapshot-classes', title: 'VolumeSnapshotClasses' },
        { element: <></>, label: 'VolumeSnapshotContents', path: '/core/storage/volume-snapshot-contents', title: 'VolumeSnapshotContents' },
      ],
    },
    {
      label: 'Builds',
      routes: [
        { element: <></>, label: 'BuildConfigs', path: '/core/builds/configs', title: 'BuildConfigs' },
        { element: <></>, label: 'Builds', path: '/core/builds/builds', title: 'Builds' },
        { element: <></>, label: 'ImageStreams', path: '/core/builds/image-streams', title: 'ImageStreams' },
      ],
    },
    {
      label: 'Pipelines',
      routes: [
        { element: <></>, label: 'Overview', path: '/core/pipelines/overview', title: 'Overview' },
        { element: <></>, label: 'Pipelines', path: '/core/pipelines/pipelines', title: 'Pipelines' },
        { element: <></>, label: 'Tasks', path: '/core/pipelines/tasks', title: 'Tasks' },
        { element: <></>, label: 'Triggers', path: '/core/pipelines/triggers', title: 'Triggers' },
      ],
    },
    {
      label: 'Observe',
      routes: [
        { element: <></>, label: 'Alerting', path: '/core/observe/alerting', title: 'Alerting' },
        { element: <></>, label: 'Metrics', path: '/core/observe/metrics', title: 'Metrics' },
        { element: <></>, label: 'Dashboards', path: '/core/observe/dashboards', title: 'Dashboards' },
        { element: <></>, label: 'Targets', path: '/core/observe/targets', title: 'Targets' },
        { element: <></>, label: 'Incidents', path: '/core/observe/incidents', title: 'Incidents' },
        { element: <></>, label: 'Dashboards (Perses)', path: '/core/observe/dashboards-perses', title: 'Dashboards (Perses)' },
      ],
    },
    {
      label: 'Compute',
      routes: [
        { element: <></>, label: 'Nodes', path: '/core/compute/nodes', title: 'Nodes' },
        { element: <></>, label: 'Hardware Devices', path: '/core/compute/hardware-devices', title: 'Hardware Devices' },
      ],
    },
    {
      label: 'User Management',
      routes: [
        { element: <></>, label: 'Identities', path: '/user-management/identities', title: 'Identities' },
        { element: <IdentityProvider showClustersColumn={false} />, label: 'Identity providers', path: '/core/user-management/identity-providers', title: 'Identity providers' },
        { element: <></>, label: 'Roles', path: '/user-management/roles', title: 'Roles' },
      ],
    },
    {
      label: 'Administration',
      routes: [
        { element: <></>, label: 'Cluster Settings', path: '/core/administration/settings', title: 'Cluster Settings' },
        { element: <></>, label: 'Namespaces', path: '/core/administration/namespaces', title: 'Namespaces' },
        { element: <></>, label: 'ResourceQuotas', path: '/core/administration/resource-quotas', title: 'ResourceQuotas' },
        { element: <></>, label: 'LimitRanges', path: '/core/administration/limit-ranges', title: 'LimitRanges' },
        { element: <></>, label: 'Image Vulnerabilities', path: '/core/administration/image-vulnerabilities', title: 'Image Vulnerabilities' },
        { element: <></>, label: 'CustomResourceDefinitions', path: '/core/administration/crds', title: 'CustomResourceDefinitions' },
        { element: <></>, label: 'Dynamic Plugins', path: '/core/administration/dynamic-plugins', title: 'Dynamic Plugins' },
      ],
    },
  ];

  // Fleet virtualization navigation routes
  const fleetVirtualizationRoutes: IAppRouteGroup[] = [
    {
      label: '',
      routes: [
        {
          element: <OverviewPage />,
          label: 'Overview',
          path: '/virtualization/overview',
          title: 'Overview',
        },
        {
          element: <CatalogPage />,
          label: 'Catalog',
          path: '/virtualization/catalog',
          title: 'Catalog',
        },
        {
          element: <VirtualMachines />,
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
          element: <InstanceTypesPage />,
          label: 'InstanceTypes',
          path: '/virtualization/instance-types',
          title: 'InstanceTypes',
        },
        {
          element: <TemplatesPage />,
          label: 'Templates',
          path: '/virtualization/templates',
          title: 'Templates',
        },
      ],
    },
    {
      label: '',
      routes: [],
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
          label: 'Roles',
          path: '/user-management/roles',
          title: 'Roles',
        },
        {
          element: <IdentityProvider showClustersColumn={true} />,
          label: 'Identity providers',
          path: '/user-management/identity-providers',
          title: 'Identity providers',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src={redHatOpenShiftLogo} alt="Red Hat OpenShift" style={{ height: '40px' }} />
            <Label color="orange" isCompact>UXD prototype - work in progress</Label>
            <span style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--regular)' }}>
              Contact: Stefan Kukla (slack: @stefan)
            </span>
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
            onClick={() => !impersonatingUser && setPerspectiveOpen(!perspectiveOpen)}
          style={{
            width: '100%',
            padding: 'var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md)',
            border: `1px solid var(--pf-t--global--border--color--default)`,
            borderRadius: perspectiveOpen 
              ? 'var(--pf-t--global--border--radius--small) var(--pf-t--global--border--radius--small) 0 0'
              : 'var(--pf-t--global--border--radius--small)',
            background: 'var(--pf-t--global--background--color--primary--default)',
            textAlign: 'left',
            cursor: impersonatingUser ? 'default' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--pf-t--global--font--size--body--default)',
            fontWeight: 'var(--pf-t--global--font--weight--body--default)',
            color: 'var(--pf-t--global--text--color--regular)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--sm)' }}>
            {activePerspective === 'Fleet virtualization' ? (
              <img src={virtIcon} alt="Fleet virtualization" style={{ width: '20px', height: '20px' }} />
            ) : activePerspective === 'Fleet management' ? (
              <img src={multiclusterIcon} alt="Fleet management" style={{ width: '20px', height: '20px' }} />
            ) : (
              <CorePlatformsIcon size="20px" />
            )}
            <span>{activePerspective}</span>
          </div>
          {!impersonatingUser && <CaretDownIcon />}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--pf-t--global--spacer--sm)',
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
              {perspective.name === 'Fleet virtualization' ? (
                <img src={virtIcon} alt="" style={{ width: '16px', height: '16px' }} />
              ) : perspective.name === 'Fleet management' ? (
                <img src={multiclusterIcon} alt="" style={{ width: '16px', height: '16px' }} />
              ) : (
                <CorePlatformsIcon size="16px" />
              )}
              <span>{perspective.name}</span>
              </div>
          ))}
          </div>
        )}
    </div>
  );
  };

  // Select routes based on active perspective
  let activeRoutes = 
    activePerspective === 'Core platforms' ? corePlatformsRoutes :
    activePerspective === 'Fleet virtualization' ? fleetVirtualizationRoutes : 
    routes.filter(route => route.label !== 'Core Platforms');

  // Filter out "User management" from Fleet virtualization when impersonating
  if (impersonatingUser && activePerspective === 'Fleet virtualization') {
    activeRoutes = activeRoutes.filter((route) => route.label !== 'User management');
  }

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
    <>
    <Page
      mainContainerId={pageId}
      masthead={masthead}
      sidebar={sidebarOpen && Sidebar}
      skipToContent={PageSkipToContent}
    >
      {impersonatingUser && (
        <Banner isSticky style={{ padding: '16px 24px', backgroundColor: '#E7F1FA', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            You are currently impersonating as <strong>{impersonatingUser}</strong>.
            {impersonatingGroups.length > 0 && (
              <> You have also preselected the following group{impersonatingGroups.length > 1 ? 's' : ''}: <strong>{impersonatingGroups.join(', ')}</strong>.</>
            )}{' '}
            <Button variant="link" isInline onClick={stopImpersonation} style={{ padding: 0, fontSize: 'inherit' }}>
              Stop impersonating
            </Button>
          </div>
        </Banner>
      )}
      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 200px)'
        }}>
          <Spinner size="lg" />
        </div>
      ) : (
        children
      )}
    </Page>

      {/* Floating Action Button */}
      <Button
        variant="primary"
        onClick={() => setIsTaskModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
        }}
        aria-label="View task details"
      >
        <InfoCircleIcon />
      </Button>

      {/* Task Details Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        aria-label="Research task instructions"
      >
        <div style={{ padding: '24px' }}>
          <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Research Task
          </Title>
          
          <Content component="p" style={{ 
            marginBottom: 'var(--pf-t--global--spacer--lg)',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Complete this task naturally and think aloud. Share what you're looking for and what you expect to happen.
          </Content>

          <Alert 
            variant="info" 
            isInline 
            title="Your role"
            style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
          >
            <strong>Walter Joseph Kovacs</strong> — Tenant administrator
          </Alert>

          <Title headingLevel="h2" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Task
          </Title>

          <Content component="p" style={{ 
            marginBottom: 'var(--pf-t--global--spacer--md)',
            fontSize: '15px',
          }}>
            Grant virtual machine management permissions:
          </Content>

          <Card>
            <CardBody>
              <DescriptionList isHorizontal isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Group</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color="blue" isCompact>dev-team-alpha</Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>Role</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color="green" isCompact>Virtualization admin</Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>Scope</DescriptionListTerm>
                  <DescriptionListDescription>
                    <div style={{ marginBottom: '6px' }}>
                      Cluster set: <Label color="purple" isCompact>petemobile-dev-clusters</Label>
                    </div>
                    <div style={{ marginBottom: '6px' }}>
                      Clusters: <Label color="orange" isCompact>dev-team-a</Label> <Label color="orange" isCompact>dev-team-b</Label>
                    </div>
                    <div>
                      Project: <Label color="teal" isCompact>project-starlight-dev</Label>
                    </div>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>

          <Alert 
            variant="custom" 
            isInline 
            title="Note"
            style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}
          >
            Navigate naturally. There are no wrong approaches.
          </Alert>

          <div style={{ 
            marginTop: 'var(--pf-t--global--spacer--lg)', 
            paddingTop: 'var(--pf-t--global--spacer--md)', 
            borderTop: '1px solid var(--pf-t--global--border--color--default)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <Button variant="primary" onClick={() => setIsTaskModalOpen(false)}>
              Start task
            </Button>
          </div>
        </div>
      </Modal>

    </>
  );
};

export { AppLayout };
