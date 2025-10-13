import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Content,
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Card,
  CardBody,
  PageSection,
  Tabs,
  Tab,
  TabTitleText,
  Breadcrumb,
  BreadcrumbItem,
  SearchInput,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Pagination,
  PaginationVariant,
  ExpandableSection,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { InfoCircleIcon, CheckIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { CubesIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const ClusterDetail: React.FunctionComponent = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  
  // Detect if this is a cluster set (contains 'petemobile' prefix) vs individual cluster
  const isClusterSet = clusterName?.startsWith('petemobile') || false;
  
  useDocumentTitle(`ACM | ${clusterName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const OverviewTab = () => (
    <div>
      <Card>
        <CardBody>
          <ExpandableSection
            toggleText="Details"
            isExpanded={true}
          >
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Cluster resource name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about cluster resource name">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </DescriptionListTerm>
                <DescriptionListDescription>{clusterName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Control plane type</DescriptionListTerm>
                <DescriptionListDescription>Standalone</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Status</DescriptionListTerm>
                <DescriptionListDescription>
                  <Label color="green" icon={<CheckIcon />}>
                    Ready
                  </Label>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Infrastructure</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Microsoft Azure</FlexItem>
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Distribution version</DescriptionListTerm>
                <DescriptionListDescription>v1.33.3</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Labels</DescriptionListTerm>
                <DescriptionListDescription>
                  <div>
                    <Button variant="plain" isInline>
                      <Icon><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Icon>
                    </Button>
                    <div className="pf-v6-u-mt-sm">
                      <Flex spaceItems={{ default: 'spaceItemsSm' }} wrap="wrap">
                        <Label color="grey" isCompact>name={clusterName}</Label>
                        <Label color="grey" isCompact>vendor=AKS</Label>
                        <Label color="grey" isCompact>cloud=Azure</Label>
                        <Label color="grey" isCompact>cluster.open-cluster-management.io/clusterset=xks-clusters</Label>
                        <Label color="grey" isCompact>app-demo=true</Label>
                        <Label color="grey" isCompact>feature.open-cluster-management.io/addon-application-manager=available</Label>
                        <Label color="grey" isCompact>feature.open-cluster-management.io/addon-cert-policy-controller=available</Label>
                        <Label color="grey" isCompact>feature.open-cluster-management.io/addon-cluster-proxy=available</Label>
                      </Flex>
                    </div>
                  </div>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Cluster API address</DescriptionListTerm>
                <DescriptionListDescription>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Button variant="link" isInline>
                        https://sberens-aks-dns-0a38ymwa.hcp.centralus.azmk8s.io:443
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button variant="plain" isInline>
                        <Icon><path d="M8 2C6.9 2 6 2.9 6 4v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H8zm0 2h8v12H8V4z"/></Icon>
                      </Button>
                    </FlexItem>
                  </Flex>
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Console URL</DescriptionListTerm>
                <DescriptionListDescription>-</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Cluster ID</DescriptionListTerm>
                <DescriptionListDescription>-</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Username & password</DescriptionListTerm>
                <DescriptionListDescription>-</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Created by</DescriptionListTerm>
                <DescriptionListDescription>-</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Cluster set</DescriptionListTerm>
                <DescriptionListDescription>
                  <Button variant="link" isInline>xks-clusters</Button>
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ExpandableSection>
        </CardBody>
      </Card>

      <div style={{ height: '32px' }}></div>

      <Card>
        <CardBody>
          <ExpandableSection
            toggleText="Status"
            isExpanded={true}
          >
            <div className="pf-v6-u-mt-md">
              <Flex spaceItems={{ default: 'spaceItemsLg' }}>
                <FlexItem>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>2</div>
                    <div>Nodes</div>
                    <div style={{ fontSize: '0.875rem', color: '#6a6e73' }}>0 nodes inactive</div>
                  </div>
                </FlexItem>
                <FlexItem>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1</div>
                    <div>Applications</div>
                  </div>
                </FlexItem>
                <FlexItem>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#c9190b' }}>1</div>
                    <div style={{ color: '#c9190b' }}>
                      <Icon><ExclamationTriangleIcon /></Icon> Policy violations
                    </div>
                  </div>
                </FlexItem>
                <FlexItem>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</div>
                    <div>No potential issues found</div>
                  </div>
                </FlexItem>
              </Flex>
            </div>
          </ExpandableSection>
        </CardBody>
      </Card>
    </div>
  );

  const NodesTab = () => {
    const mockNodes = [
      {
        id: 1,
        name: 'aks-agentpool-62974295-vmss000000',
        status: 'Ready',
        role: 'Worker',
        region: 'centralus',
        zone: '0',
        instanceType: 'Standard_D4ds_v5',
        cpu: '4',
        ram: '15.6 Gi'
      },
      {
        id: 2,
        name: 'aks-agentpool-62974295-vmss000001',
        status: 'Ready',
        role: 'Worker',
        region: 'centralus',
        zone: '0',
        instanceType: 'Standard_D4ds_v5',
        cpu: '4',
        ram: '15.6 Gi'
      }
    ];

    const filteredNodes = mockNodes.filter(node =>
      node.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedNodes = filteredNodes.slice(
      (page - 1) * perPage,
      page * perPage
    );

    return (
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search for a node"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Nodes table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Region</Th>
              <Th>Instance type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedNodes.map((node) => (
              <Tr key={node.id}>
                <Td dataLabel="Name">
                  <Button variant="link" isInline>
                    {node.name}
                  </Button>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {node.instanceType}
                  </div>
                </Td>
                <Td dataLabel="Status">
                  <Label color="green" icon={<CheckIcon />}>
                    {node.status}
                  </Label>
                </Td>
                <Td dataLabel="Region">{node.region}</Td>
                <Td dataLabel="Instance type">{node.cpu} CPU / {node.ram} RAM</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={filteredNodes.length}
                page={page}
                perPage={perPage}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                variant={PaginationVariant.bottom}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </div>
    );
  };

  const AddOnsTab = () => {
    const mockAddOns = [
      { id: 1, name: 'application-manager', status: 'Available', version: 'v1.2.3', updated: '2 hours ago' },
      { id: 2, name: 'cert-policy-controller', status: 'Available', version: 'v2.1.0', updated: '5 hours ago' },
      { id: 3, name: 'cluster-proxy', status: 'Available', version: 'v1.5.2', updated: '1 day ago' },
      { id: 4, name: 'config-policy-controller', status: 'Available', version: 'v3.0.1', updated: '3 days ago' },
      { id: 5, name: 'gitops-addon', status: 'Available', version: 'v1.8.0', updated: '5 days ago' },
      { id: 6, name: 'governance-policy-framework', status: 'Available', version: 'v2.4.1', updated: '1 week ago' },
      { id: 7, name: 'managed-serviceaccount', status: 'Available', version: 'v1.0.5', updated: '2 weeks ago' },
      { id: 8, name: 'observability-controller', status: 'Available', version: 'v4.1.2', updated: '3 weeks ago' },
      { id: 9, name: 'search-collector', status: 'Available', version: 'v2.3.0', updated: '1 month ago' },
      { id: 10, name: 'work-manager', status: 'Available', version: 'v1.7.4', updated: '1 month ago' }
    ];

    const filteredAddOns = mockAddOns.filter(addon =>
      addon.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedAddOns = filteredAddOns.slice(
      (page - 1) * perPage,
      page * perPage
    );

    return (
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search for an add-on"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Add-ons table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedAddOns.map((addon) => (
              <Tr key={addon.id}>
                <Td dataLabel="Name">
                  <div>{addon.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    {addon.version}
                  </div>
                </Td>
                <Td dataLabel="Status">
                  <Label color="green" icon={<CheckIcon />}>
                    {addon.status}
                  </Label>
                </Td>
                <Td dataLabel="Updated">{addon.updated}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={filteredAddOns.length}
                page={page}
                perPage={perPage}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                variant={PaginationVariant.bottom}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </div>
    );
  };

  const RoleAssignmentsTab = () => (
    <div className="table-content-card">
      <EmptyState>
        <CubesIcon />
        <Title headingLevel="h2" size="lg">
          No role assignments created yet
        </Title>
        <EmptyStateBody>
          Control what users and groups can access or view by assigning them a role for your managed resources.
        </EmptyStateBody>
        <EmptyStateActions>
          <Button variant="primary" onClick={handleCreateRoleAssignment}>
            Create role assignment
          </Button>
        </EmptyStateActions>
        <EmptyStateBody>
          <Button component="a" href="#" variant="link">
            Link to documentation
          </Button>
        </EmptyStateBody>
      </EmptyState>
    </div>
  );

  // New tabs for Cluster Set
  const SubmarinerAddOnsTab = () => (
    <div className="table-content-card">
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Search for a Submariner add-on"
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Submariner add-ons table" variant="compact">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Version</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td dataLabel="Name">submariner-addon</Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Available
              </Label>
            </Td>
            <Td dataLabel="Version">0.14.0</Td>
            <Td dataLabel="Updated">2 hours ago</Td>
          </Tr>
          <Tr>
            <Td dataLabel="Name">submariner-gateway</Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Available
              </Label>
            </Td>
            <Td dataLabel="Version">0.14.0</Td>
            <Td dataLabel="Updated">2 hours ago</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );

  const ClusterListTab = () => (
    <div className="table-content-card">
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Search for a cluster"
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Clusters in set table" variant="compact">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Provider</Th>
            <Th>Region</Th>
            <Th>Nodes</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td dataLabel="Name">
              <Button 
                variant="link" 
                isInline 
                onClick={() => navigate('/infrastructure/clusters/cluster-a')}
                style={{ paddingLeft: 0 }}
              >
                cluster-a
              </Button>
            </Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Ready
              </Label>
            </Td>
            <Td dataLabel="Provider">AWS</Td>
            <Td dataLabel="Region">us-east-1</Td>
            <Td dataLabel="Nodes">5</Td>
          </Tr>
          <Tr>
            <Td dataLabel="Name">
              <Button 
                variant="link" 
                isInline 
                onClick={() => navigate('/infrastructure/clusters/cluster-b')}
                style={{ paddingLeft: 0 }}
              >
                cluster-b
              </Button>
            </Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Ready
              </Label>
            </Td>
            <Td dataLabel="Provider">Azure</Td>
            <Td dataLabel="Region">eastus</Td>
            <Td dataLabel="Nodes">3</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );

  const ClusterPoolsTab = () => (
    <div className="table-content-card">
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Search for a cluster pool"
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="primary">Create cluster pool</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Cluster pools table" variant="compact">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Size</Th>
            <Th>Available</Th>
            <Th>Provider</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td dataLabel="Name">production-pool</Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Ready
              </Label>
            </Td>
            <Td dataLabel="Size">10</Td>
            <Td dataLabel="Available">7</Td>
            <Td dataLabel="Provider">AWS</Td>
          </Tr>
          <Tr>
            <Td dataLabel="Name">dev-pool</Td>
            <Td dataLabel="Status">
              <Label color="green" icon={<CheckIcon />}>
                Ready
              </Label>
            </Td>
            <Td dataLabel="Size">5</Td>
            <Td dataLabel="Available">4</Td>
            <Td dataLabel="Provider">Azure</Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="clusters-page-container">
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/infrastructure/clusters');
              }}
            >
              Clusters
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>
          </Breadcrumb>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <Title headingLevel="h1" size="lg">
              {clusterName}
            </Title>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button variant="link" isInline>
                Grafana <Icon><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Icon>
              </Button>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </div>
          </div>
          
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Cluster detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>} aria-label="Overview tab" />
            {isClusterSet ? (
              <>
                <Tab eventKey={1} title={<TabTitleText>Submariner add-ons</TabTitleText>} aria-label="Submariner add-ons tab" />
                <Tab eventKey={2} title={<TabTitleText>Cluster list</TabTitleText>} aria-label="Cluster list tab" />
                <Tab eventKey={3} title={<TabTitleText>Cluster pools</TabTitleText>} aria-label="Cluster pools tab" />
                <Tab eventKey={4} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
              </>
            ) : (
              <>
                <Tab eventKey={1} title={<TabTitleText>Nodes</TabTitleText>} aria-label="Nodes tab" />
                <Tab eventKey={2} title={<TabTitleText>Add-ons</TabTitleText>} aria-label="Add-ons tab" />
                <Tab eventKey={3} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
              </>
            )}
          </Tabs>
        </div>

        <div className="page-content-section">
          {activeTabKey === 0 && <OverviewTab />}
          {isClusterSet ? (
            <>
              {activeTabKey === 1 && <SubmarinerAddOnsTab />}
              {activeTabKey === 2 && <ClusterListTab />}
              {activeTabKey === 3 && <ClusterPoolsTab />}
              {activeTabKey === 4 && <RoleAssignmentsTab />}
            </>
          ) : (
            <>
              {activeTabKey === 1 && <NodesTab />}
              {activeTabKey === 2 && <AddOnsTab />}
              {activeTabKey === 3 && <RoleAssignmentsTab />}
            </>
          )}
        </div>
      </div>

          <RoleAssignmentWizard 
            isOpen={isWizardOpen} 
            onClose={() => setIsWizardOpen(false)} 
            clusterName={isClusterSet ? undefined : clusterName}
            context="clusters"
          />
    </>
  );
};

export { ClusterDetail };

