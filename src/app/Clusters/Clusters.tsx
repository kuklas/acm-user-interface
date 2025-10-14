import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownList,
  DropdownItem,
  Label,
  Flex,
  FlexItem,
  Pagination,
  PaginationVariant,
  Icon,
  Tooltip,
  Checkbox,
  ExpandableSection,
  Content,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td, ActionsColumn, IAction } from '@patternfly/react-table';
import { FilterIcon, InfoCircleIcon, ExternalLinkAltIcon, CheckIcon, ArrowUpIcon, SyncAltIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

// Mock cluster data using petemobile infrastructure
const mockClusters = [
  // petemobile-na-prod cluster set
  {
    id: 1,
    name: 'Us-west-prod-01',
    namespace: 'petemobile-na-prod',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    distributionUpgrade: false,
    labels: 3,
    nodes: 8,
    addOns: 4,
    creationDate: '15 Jan 2025, 10:30',
  },
  {
    id: 2,
    name: 'Us-east-prod-02',
    namespace: 'petemobile-na-prod',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    distributionUpgrade: false,
    labels: 3,
    nodes: 8,
    addOns: 4,
    creationDate: '16 Jan 2025, 14:22',
  },
  {
    id: 3,
    name: 'Na-edge-ny-01',
    namespace: 'petemobile-na-prod',
    status: 'Ready',
    infrastructure: 'Bare Metal',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 2,
    nodes: 4,
    addOns: 2,
    creationDate: '20 Jan 2025, 09:15',
  },
  // petemobile-eu-prod cluster set
  {
    id: 4,
    name: 'Eu-west-prod-01',
    namespace: 'petemobile-eu-prod',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    distributionUpgrade: false,
    labels: 3,
    nodes: 8,
    addOns: 4,
    creationDate: '15 Jan 2025, 16:45',
  },
  {
    id: 5,
    name: 'Eu-east-prod-02',
    namespace: 'petemobile-eu-prod',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    distributionUpgrade: false,
    labels: 3,
    nodes: 8,
    addOns: 4,
    creationDate: '15 Jan 2025, 11:30',
  },
  {
    id: 6,
    name: 'Eu-edge-berlin-01',
    namespace: 'petemobile-eu-prod',
    status: 'Ready',
    infrastructure: 'Bare Metal',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 2,
    nodes: 4,
    addOns: 2,
    creationDate: '18 Jan 2025, 08:20',
  },
  // petemobile-dev-clusters cluster set
  {
    id: 7,
    name: 'Dev-team-a-cluster',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 5,
    nodes: 6,
    addOns: 3,
    creationDate: '22 Jan 2025, 13:55',
  },
  {
    id: 8,
    name: 'Dev-team-b-cluster',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 5,
    nodes: 6,
    addOns: 3,
    creationDate: '22 Jan 2025, 10:10',
  },
  {
    id: 9,
    name: 'Qa-env-cluster',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 4,
    nodes: 4,
    addOns: 2,
    creationDate: '21 Jan 2025, 15:40',
  },
  {
    id: 10,
    name: 'Staging-cluster-01',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Google Cloud Platform',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 6,
    nodes: 5,
    addOns: 3,
    creationDate: '20 Jan 2025, 12:25',
  },
  {
    id: 11,
    name: 'Test-cluster-01',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Microsoft Azure',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 4,
    nodes: 3,
    addOns: 2,
    creationDate: '19 Jan 2025, 14:15',
  },
  {
    id: 12,
    name: 'Integration-cluster',
    namespace: 'petemobile-dev-clusters',
    status: 'Ready',
    infrastructure: 'Amazon Web Services',
    controlPlaneType: 'Standalone',
    distribution: 'OpenShift 4.18.19',
    labels: 7,
    nodes: 7,
    addOns: 4,
    creationDate: '18 Jan 2025, 09:30',
  },
];

// Mock cluster sets data using petemobile infrastructure
const mockClusterSets = [
  {
    id: 1,
    name: 'petemobile-na-prod',
    clusterStatus: 3,
    namespaceBindings: ['core-ntwk', '5g-api-prod', 'data-analytics', 'core-billing', 'Security-ops', 'Log-viewer', 'edge-core-app', 'Location-services'],
  },
  {
    id: 2,
    name: 'petemobile-eu-prod',
    clusterStatus: 3,
    namespaceBindings: ['core-ntwk', 'eu-5g-api', 'Data-analytics', 'core-billing', 'Security-ops', 'Log-viewer', 'edge-core-app', 'Location-services'],
  },
  {
    id: 3,
    name: 'petemobile-dev-clusters',
    clusterStatus: 6,
    namespaceBindings: ['Project-starlight-dev', 'project-starfleet-dev', 'project-pegasus-dev', 'project-quasar-dev', 'project-falcon-dev', 'qa-testing-ns', 'qa-performance-ns'],
  },
  {
    id: 4,
    name: 'petemobile-staging',
    clusterStatus: 2,
    namespaceBindings: ['staging-policies', 'openshift-gitops', 'staging-monitoring'],
  },
  {
    id: 5,
    name: 'petemobile-testing',
    clusterStatus: 1,
    namespaceBindings: ['test-policies', 'openshift-gitops'],
  },
  {
    id: 6,
    name: 'petemobile-edge',
    clusterStatus: 2,
    namespaceBindings: ['edge-policies', 'openshift-gitops', 'edge-monitoring'],
  },
  {
    id: 7,
    name: 'petemobile-global',
    clusterStatus: 12,
    namespaceBindings: ['default', 'kube-system', 'openshift-gitops', 'openshift-monitoring', 'openshift-operator-lifecycle-manager'],
  },
];

const Clusters: React.FunctionComponent = () => {
  useDocumentTitle('Clusters');
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [searchValue, setSearchValue] = React.useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const [isLabelsDropdownOpen, setIsLabelsDropdownOpen] = React.useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isTerminologyExpanded, setIsTerminologyExpanded] = React.useState(false);
  const [isRefreshDropdownOpen, setIsRefreshDropdownOpen] = React.useState(false);
  const [refreshMode, setRefreshMode] = React.useState<'auto' | 'manual'>('auto');

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const defaultActions = (cluster: any): IAction[] => [
    {
      title: 'Edit cluster',
      onClick: () => console.log('Edit cluster', cluster.name),
    },
    {
      title: 'Delete cluster',
      onClick: () => console.log('Delete cluster', cluster.name),
    },
  ];

  const defaultClusterSetActions = (clusterSet: any): IAction[] => [
    {
      title: 'Edit cluster set',
      onClick: () => console.log('Edit cluster set', clusterSet.name),
    },
    {
      title: 'Delete cluster set',
      onClick: () => console.log('Delete cluster set', clusterSet.name),
    },
  ];

  const getInfrastructureIcon = (infrastructure: string) => {
    switch (infrastructure) {
      case 'Microsoft Azure':
        return '🔵';
      case 'Amazon Web Services':
        return '🟠';
      case 'Google Cloud Platform':
        return '🔵';
      case 'VMware vSphere':
        return '🟣';
      case 'IBM Cloud':
        return '🔵';
      case 'Red Hat OpenShift Virtualization':
        return '🔴';
      case 'Host inventory':
        return '🖥️';
      case 'Other':
        return '☁️';
      default:
        return '☁️';
    }
  };

  const ClusterListTab = () => (
    <div className="table-content-card">
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Checkbox
              id="select-all-clusters"
              aria-label="Select all clusters"
            />
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isFilterDropdownOpen}
              onSelect={() => setIsFilterDropdownOpen(false)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="plain"
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  isExpanded={isFilterDropdownOpen}
                >
                  <FilterIcon />
                  Filter
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="status">Status</DropdownItem>
                <DropdownItem key="infrastructure">Infrastructure</DropdownItem>
                <DropdownItem key="control-plane">Control plane type</DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isLabelsDropdownOpen}
              onSelect={() => setIsLabelsDropdownOpen(false)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="plain"
                  onClick={() => setIsLabelsDropdownOpen(!isLabelsDropdownOpen)}
                  isExpanded={isLabelsDropdownOpen}
                >
                  <FilterIcon />
                  Labels
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="environment">Environment</DropdownItem>
                <DropdownItem key="region">Region</DropdownItem>
                <DropdownItem key="version">Version</DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem>
            <SearchInput
              placeholder="Search"
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary">Create cluster</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="secondary">Import cluster</Button>
          </ToolbarItem>
          <ToolbarItem>
            <Dropdown
              isOpen={isActionsDropdownOpen}
              onSelect={() => setIsActionsDropdownOpen(false)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  variant="plain"
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  isExpanded={isActionsDropdownOpen}
                >
                  Actions
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="bulk-edit">Bulk edit</DropdownItem>
                <DropdownItem key="bulk-delete">Bulk delete</DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Dropdown
              isOpen={isRefreshDropdownOpen}
              onSelect={() => setIsRefreshDropdownOpen(false)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsRefreshDropdownOpen(!isRefreshDropdownOpen)}
                  isExpanded={isRefreshDropdownOpen}
                  icon={<SyncAltIcon />}
                >
                  {refreshMode === 'auto' ? 'Auto refresh' : 'Manual refresh'}
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem
                  key="manual"
                  description="New data only adds when you click to refresh the page."
                  onClick={() => setRefreshMode('manual')}
                >
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>Manual refresh</FlexItem>
                    {refreshMode === 'manual' && (
                      <FlexItem>
                        <CheckIcon color="var(--pf-t--global--icon--color--brand--default)" />
                      </FlexItem>
                    )}
                  </Flex>
                </DropdownItem>
                <DropdownItem
                  key="auto"
                  description="Keeps your data updated automatically. This setting changes to manual refresh after 10 minutes of inactivity."
                  onClick={() => setRefreshMode('auto')}
                >
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>Auto refresh</FlexItem>
                    {refreshMode === 'auto' && (
                      <FlexItem>
                        <CheckIcon color="var(--pf-t--global--icon--color--brand--default)" />
                      </FlexItem>
                    )}
                  </Flex>
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Clusters table">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                id="select-all-clusters-header"
                aria-label="Select all clusters"
              />
            </Th>
            <Th sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>Name</Th>
            <Th>Namespace</Th>
            <Th>Status</Th>
            <Th>Infrastructure</Th>
            <Th>Control plane type</Th>
            <Th>Distribution version</Th>
            <Th>Labels</Th>
            <Th>Nodes</Th>
            <Th>Add-ons</Th>
            <Th>Creation date</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockClusters.slice(0, 10).map((cluster) => (
            <Tr key={cluster.id}>
              <Td>
                <Checkbox
                  id={`select-cluster-${cluster.id}`}
                  aria-label={`Select cluster ${cluster.name}`}
                />
              </Td>
              <Td dataLabel="Name">
                <Button variant="link" onClick={() => navigate(`/infrastructure/clusters/${cluster.name}`)}>
                  {cluster.name}
                </Button>
              </Td>
              <Td dataLabel="Namespace">{cluster.namespace}</Td>
              <Td dataLabel="Status">
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <CheckIcon color="green" />
                  </FlexItem>
                  <FlexItem>{cluster.status}</FlexItem>
                </Flex>
              </Td>
              <Td dataLabel="Infrastructure">
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>{getInfrastructureIcon(cluster.infrastructure)}</FlexItem>
                  <FlexItem>{cluster.infrastructure}</FlexItem>
                </Flex>
              </Td>
              <Td dataLabel="Control plane type">{cluster.controlPlaneType}</Td>
              <Td dataLabel="Distribution version">
                <div>
                  {cluster.distribution}
                  {cluster.distributionUpgrade && (
                    <div style={{ color: '#0066cc', fontSize: '12px' }}>
                      <ArrowUpIcon /> Upgrade available
                    </div>
                  )}
                </div>
              </Td>
              <Td dataLabel="Labels">
                <Button variant="link" isInline>
                  {cluster.labels} labels
                </Button>
              </Td>
              <Td dataLabel="Nodes">
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <CheckIcon color="green" />
                  </FlexItem>
                  <FlexItem>{cluster.nodes}</FlexItem>
                </Flex>
              </Td>
              <Td dataLabel="Add-ons">
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <CheckIcon color="green" />
                  </FlexItem>
                  <FlexItem>{cluster.addOns}</FlexItem>
                </Flex>
              </Td>
              <Td dataLabel="Creation date">{cluster.creationDate}</Td>
              <Td>
                <ActionsColumn items={defaultActions(cluster)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={mockClusters.length}
              perPage={perPage}
              page={page}
              onSetPage={onSetPage}
              widgetId="bottom-pagination"
              onPerPageSelect={onPerPageSelect}
              variant={PaginationVariant.bottom}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </div>
  );

  const ClusterSetsTab = () => (
    <div>
      <Card className="pf-v6-u-mb-lg">
        <CardBody>
          <ExpandableSection
            toggleText="Learn more about the terminology"
            onToggle={() => setIsTerminologyExpanded(!isTerminologyExpanded)}
            isExpanded={isTerminologyExpanded}
          >
            <div className="pf-v6-u-mb-md">
              <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
                Cluster sets
              </Title>
              <Content component="p" className="pf-v6-u-mb-sm">
                ManagedClusterSet resources allow the grouping of cluster resources, which enables role-based access control management across all of the resources in the group.
              </Content>
              <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
                View documentation <ExternalLinkAltIcon />
              </Button>
            </div>
            <div>
              <Title headingLevel="h4" size="md" className="pf-v6-u-mb-sm">
                Submariner
              </Title>
              <Content component="p" className="pf-v6-u-mb-sm">
                Submariner is an open-source tool that can be used to provide direct networking between two or more Kubernetes clusters in a given ManagedClusterSet, either on-premises or in the cloud.
              </Content>
              <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
                View documentation <ExternalLinkAltIcon />
              </Button>
            </div>
          </ExpandableSection>
        </CardBody>
      </Card>

      <div style={{ marginTop: '16px' }}>
        <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Checkbox
                id="select-all-cluster-sets"
                aria-label="Select all cluster sets"
              />
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary">Create cluster set</Button>
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isActionsDropdownOpen}
                onSelect={() => setIsActionsDropdownOpen(false)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                    isExpanded={isActionsDropdownOpen}
                  >
                    Actions
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="bulk-edit">Bulk edit</DropdownItem>
                  <DropdownItem key="bulk-delete">Bulk delete</DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="plain" aria-label="Refresh">
                <Icon>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </Icon>
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Cluster sets table">
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  id="select-all-cluster-sets-header"
                  aria-label="Select all cluster sets"
                />
              </Th>
              <Th sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>Name</Th>
              <Th>Cluster status</Th>
              <Th>
                <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>Namespace bindings</FlexItem>
                  <FlexItem>
                    <Tooltip content="Information about namespace bindings">
                      <InfoCircleIcon />
                    </Tooltip>
                  </FlexItem>
                </Flex>
              </Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockClusterSets.map((clusterSet) => (
              <Tr key={clusterSet.id}>
                <Td>
                  <Checkbox
                    id={`select-cluster-set-${clusterSet.id}`}
                    aria-label={`Select cluster set ${clusterSet.name}`}
                  />
                </Td>
                <Td dataLabel="Name">
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Button variant="link" onClick={() => navigate(`/infrastructure/clusters/${clusterSet.name}`)}>
                        {clusterSet.name}
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about this cluster set">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Td>
                <Td dataLabel="Cluster status">
                  {clusterSet.clusterStatus ? (
                    <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                      <FlexItem>
                        <CheckIcon color="green" />
                      </FlexItem>
                      <FlexItem>{clusterSet.clusterStatus}</FlexItem>
                    </Flex>
                  ) : (
                    '-'
                  )}
                </Td>
                <Td dataLabel="Namespace bindings">
                  <div>
                    <Flex spaceItems={{ default: 'spaceItemsXs' }} wrap="wrap">
                      {clusterSet.namespaceBindings.slice(0, 2).map((binding, index) => (
                        <FlexItem key={index}>
                          <Label color="grey" isCompact>
                            {binding}
                          </Label>
                        </FlexItem>
                      ))}
                    </Flex>
                    {clusterSet.namespaceBindings.length > 2 && (
                      <div>
                        <Button variant="link" isInline>
                          {clusterSet.namespaceBindings.length - 2} more
                        </Button>
                      </div>
                    )}
                  </div>
                </Td>
                <Td>
                  <ActionsColumn items={defaultClusterSetActions(clusterSet)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        <Toolbar>
          <ToolbarContent>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={mockClusterSets.length}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                widgetId="bottom-pagination"
                onPerPageSelect={onPerPageSelect}
                variant={PaginationVariant.bottom}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        </div>
      </div>
    </div>
  );

  const ClusterPoolsTab = () => (
    <div>
      <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-md">
        Cluster pools
      </Title>
      <Content component="p" className="pf-v6-u-mb-lg">
        Cluster pools are not yet configured. Create a cluster pool to get started.
      </Content>
      <Button variant="primary">Create cluster pool</Button>
    </div>
  );

  const DiscoveredClustersTab = () => (
    <div>
      <Title headingLevel="h2" size="lg" className="pf-v6-u-mb-md">
        Discovered clusters
      </Title>
      <Content component="p" className="pf-v6-u-mb-lg">
        No discovered clusters found. Import clusters to get started.
      </Content>
      <Button variant="primary">Import cluster</Button>
    </div>
  );

  return (
    <>
      <div className="page-header-section">
        <Title headingLevel="h1" size="lg">
          Clusters
        </Title>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Cluster tabs">
          <Tab eventKey={0} title={<TabTitleText>Cluster list</TabTitleText>} aria-label="Cluster list tab" />
          <Tab eventKey={1} title={<TabTitleText>Cluster sets</TabTitleText>} aria-label="Cluster sets tab" />
          <Tab eventKey={2} title={<TabTitleText>Cluster pools</TabTitleText>} aria-label="Cluster pools tab" />
          <Tab eventKey={3} title={<TabTitleText>Discovered clusters</TabTitleText>} aria-label="Discovered clusters tab" />
        </Tabs>
      </div>
      
      <div className="page-content-section">
        {activeTabKey === 0 && <ClusterListTab />}
        {activeTabKey === 1 && <ClusterSetsTab />}
        {activeTabKey === 2 && <ClusterPoolsTab />}
        {activeTabKey === 3 && <DiscoveredClustersTab />}
      </div>
    </>
  );
};

export { Clusters };