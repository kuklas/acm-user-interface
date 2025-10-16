import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  CodeBlock,
  CodeBlockCode,
  Split,
  SplitItem,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
  ToolbarGroup,
  Divider,
} from '@patternfly/react-core';
import { CubesIcon, CheckIcon } from '@patternfly/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { Table, Thead, Tbody, Tr, Th, Td, ActionsColumn } from '@patternfly/react-table';
import { RoleDetailRoleAssignmentWizard } from '@app/RoleAssignment/RoleDetailRoleAssignmentWizard';
import { getAllClusters, getAllClusterSets, getAllNamespaces } from '@app/data';

const RoleDetail: React.FunctionComponent = () => {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();
  useDocumentTitle(`ACM RBAC | ${roleName}`);

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  // Role assignments state
  interface RoleAssignment {
    id: string;
    name: string;
    type: 'User' | 'Group';
    clusters: string[];
    namespaces: string[];
    roles: string[];
    status: 'Active' | 'Inactive';
    assignedDate: string;
    assignedBy: string;
    origin: string;
  }

  const [roleAssignments, setRoleAssignments] = React.useState<RoleAssignment[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);

  // Mock data for the role
  const roleData = {
    name: roleName || 'pod-reader',
    category: 'General',
    origin: 'User created',
    created: '2024-01-15T10:30:00Z',
    description: 'Read-only access to pods in default namespace',
    annotations: {
      description: 'Read-only access to pods in default namespace',
    },
    yaml: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${roleName || 'pod-reader'}
  namespace: default
  annotations:
    description: "Read-only access to pods in default namespace"
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]`,
    rules: [
      {
        apiGroups: ['""'],
        resources: ['pods'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  const handleBack = () => {
    navigate('/user-management/roles');
  };

  const handleEditRole = () => {
    console.log('Edit role:', roleName);
    // Navigate to edit page or open edit modal
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const handleWizardComplete = (wizardData: any) => {
    // Get data from database
    const allClusters = getAllClusters();
    const allClusterSets = getAllClusterSets();
    const allNamespaces = getAllNamespaces();
    
    // Extract cluster names and project names from wizard data
    const clusterNames: string[] = [];
    const projectNames: string[] = [];
    
    if (wizardData.resourceScope === 'everything') {
      clusterNames.push('All resources');
      projectNames.push('All projects');
    } else if (wizardData.resourceScope === 'cluster-sets') {
      // Handle cluster sets
      if (wizardData.selectedClusterSets && wizardData.selectedClusterSets.length > 0) {
        const clusterSetNames = wizardData.selectedClusterSets
          .map((id: string) => allClusterSets.find(cs => cs.id === id)?.name)
          .filter(Boolean);
        clusterNames.push(...clusterSetNames);
        
        if (wizardData.selectedClusters && wizardData.selectedClusters.length > 0) {
          const selectedClusterNames = wizardData.selectedClusters
            .map((id: string) => allClusters.find(c => c.id === id)?.name)
            .filter(Boolean);
          clusterNames.length = 0; // Clear cluster set names
          clusterNames.push(...selectedClusterNames);
          
          if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
            const selectedProjectNames = wizardData.selectedProjects
              .map((id: string) => allNamespaces.find(n => n.id === id)?.name)
              .filter(Boolean);
            projectNames.push(...selectedProjectNames);
          } else {
            projectNames.push('All projects');
          }
        } else {
          projectNames.push('All projects');
        }
      }
    } else if (wizardData.resourceScope === 'clusters') {
      // Handle individual clusters
      if (wizardData.selectedClusters && wizardData.selectedClusters.length > 0) {
        const selectedClusterNames = wizardData.selectedClusters
          .map((id: string) => allClusters.find(c => c.id === id)?.name)
          .filter(Boolean);
        clusterNames.push(...selectedClusterNames);
        
        if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
          const selectedProjectNames = wizardData.selectedProjects
            .map((id: string) => allNamespaces.find(n => n.id === id)?.name)
            .filter(Boolean);
          projectNames.push(...selectedProjectNames);
        } else {
          projectNames.push('All projects');
        }
      }
    }
    
    // Create new role assignment
    // Note: For role detail, we use the groupName from wizard as subject name since it could be user or group
    const newAssignment: RoleAssignment = {
      id: `ra-${Date.now()}`,
      name: wizardData.identityName || 'Unknown',
      type: wizardData.identityType === 'group' ? 'Group' : 'User',
      clusters: clusterNames.length > 0 ? clusterNames : ['All clusters'],
      namespaces: projectNames.length > 0 ? projectNames : ['All projects'],
      roles: [roleName || 'Unknown Role'],
      status: 'Active',
      assignedDate: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
      assignedBy: 'Walter Joseph Kovacs',
      origin: 'Hub cluster',
    };
    
    setRoleAssignments([...roleAssignments, newAssignment]);
    setIsWizardOpen(false);
    setShowSuccessAlert(true);
    
    // Hide alert after 10 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 10000);
  };

  const RoleAssignmentsTab = () => {
    const [selectedAssignments, setSelectedAssignments] = React.useState<Set<string>>(new Set());
    const [isBulkActionsOpen, setIsBulkActionsOpen] = React.useState(false);
    const [filterValue, setFilterValue] = React.useState<string>('all');

    const areAllSelected = selectedAssignments.size === roleAssignments.length && roleAssignments.length > 0;
    const areSomeSelected = selectedAssignments.size > 0;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedAssignments(new Set(roleAssignments.map(a => a.id)));
      } else {
        setSelectedAssignments(new Set());
      }
    };

    const handleSelectAssignment = (assignmentId: string, isSelecting: boolean) => {
      const newSelected = new Set(selectedAssignments);
      if (isSelecting) {
        newSelected.add(assignmentId);
      } else {
        newSelected.delete(assignmentId);
      }
      setSelectedAssignments(newSelected);
    };

    const handleBulkDelete = () => {
      const updatedAssignments = roleAssignments.filter(a => !selectedAssignments.has(a.id));
      setRoleAssignments(updatedAssignments);
      setSelectedAssignments(new Set());
      setIsBulkActionsOpen(false);
    };

    const handleDeleteAssignment = (assignmentId: string) => {
      const updatedAssignments = roleAssignments.filter(a => a.id !== assignmentId);
      setRoleAssignments(updatedAssignments);
    };

    // Filter and paginate assignments
    const filteredAssignments = roleAssignments.filter(assignment => {
      const matchesSearch = assignment.name.toLowerCase().includes(searchValue.toLowerCase());
      const matchesFilter = filterValue === 'all' || 
        (filterValue === 'user' && assignment.type === 'User') ||
        (filterValue === 'group' && assignment.type === 'Group') ||
        (filterValue === 'active' && assignment.status === 'Active');
      return matchesSearch && matchesFilter;
    });

    const paginatedAssignments = filteredAssignments.slice(
      (page - 1) * perPage,
      page * perPage
    );

    if (roleAssignments.length === 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState>
              <CubesIcon />
              <Title headingLevel="h2" size="lg">
                No role assignments created yet
              </Title>
              <EmptyStateBody>
                Control what users and groups can access or view by assigning them this role for your managed resources.
              </EmptyStateBody>
              <EmptyStateActions>
                <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
                  Create role assignment
                </Button>
              </EmptyStateActions>
              <EmptyStateBody>
                <Button component="a" href="#" variant="link">
                  Link to documentation
                </Button>
              </EmptyStateBody>
            </EmptyState>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            {selectedAssignments.size > 0 && (
              <>
                <ToolbarGroup>
                  <ToolbarItem>
                    <span style={{ fontWeight: 'bold', marginRight: '16px' }}>
                      {selectedAssignments.size} selected
                    </span>
                  </ToolbarItem>
                  <ToolbarItem>
                    <Dropdown
                      isOpen={isBulkActionsOpen}
                      onSelect={() => setIsBulkActionsOpen(false)}
                      onOpenChange={(isOpen) => setIsBulkActionsOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsBulkActionsOpen(!isBulkActionsOpen)}
                          isExpanded={isBulkActionsOpen}
                          variant="secondary"
                          isDisabled={!areSomeSelected}
                        >
                          Actions {areSomeSelected ? `(${selectedAssignments.size} selected)` : ''}
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem key="delete" onClick={handleBulkDelete}>
                          Delete selected
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </ToolbarItem>
                </ToolbarGroup>
                <ToolbarItem>
                  <Divider orientation={{ default: 'vertical' }} />
                </ToolbarItem>
              </>
            )}
            <ToolbarItem>
              <Dropdown
                isOpen={isFilterOpen}
                onSelect={() => setIsFilterOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    isExpanded={isFilterOpen}
                  >
                    Filter
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="all" onClick={() => setFilterValue('all')}>All</DropdownItem>
                  <DropdownItem key="user" onClick={() => setFilterValue('user')}>User</DropdownItem>
                  <DropdownItem key="group" onClick={() => setFilterValue('group')}>Group</DropdownItem>
                  <DropdownItem key="active" onClick={() => setFilterValue('active')}>Active</DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search role assignments"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
                Create role assignment
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        
        <Table aria-label="Role assignments table" variant="compact">
          <Thead>
            <Tr>
              <Th style={{ backgroundColor: '#f0f0f0' }} />
              <Th colSpan={2} style={{ backgroundColor: '#f0f0f0', fontWeight: 600 }}>Subject</Th>
              <Th colSpan={6} style={{ backgroundColor: '#f0f0f0', fontWeight: 600 }}>Scope</Th>
              <Th style={{ backgroundColor: '#f0f0f0' }}></Th>
            </Tr>
            <Tr>
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: areAllSelected,
                }}
              />
              <Th sort={{ sortBy: {}, columnIndex: 0 }}>Name</Th>
              <Th sort={{ sortBy: {}, columnIndex: 1 }}>Type</Th>
              <Th sort={{ sortBy: {}, columnIndex: 2 }}>Clusters</Th>
              <Th sort={{ sortBy: {}, columnIndex: 3 }}>Namespaces</Th>
              <Th sort={{ sortBy: {}, columnIndex: 4 }}>Status</Th>
              <Th sort={{ sortBy: {}, columnIndex: 5 }}>Assigned date</Th>
              <Th sort={{ sortBy: {}, columnIndex: 6 }}>Assigned by</Th>
              <Th sort={{ sortBy: {}, columnIndex: 7 }}>Origin</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedAssignments.map((assignment, rowIndex) => (
              <Tr key={assignment.id}>
                <Td
                  select={{
                    rowIndex,
                    onSelect: (_event, isSelecting) => handleSelectAssignment(assignment.id, isSelecting),
                    isSelected: selectedAssignments.has(assignment.id),
                  }}
                />
                <Td dataLabel="Name">
                  <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                    {assignment.name}
                  </Button>
                </Td>
                <Td dataLabel="Type">{assignment.type}</Td>
                <Td dataLabel="Clusters">
                  {assignment.clusters.map((cluster, idx) => (
                    <span key={idx}>
                      <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                        {cluster}
                      </Button>
                      {idx < assignment.clusters.length - 1 && ', '}
                    </span>
                  ))}
                </Td>
                <Td dataLabel="Namespaces">
                  {assignment.namespaces.map((ns, idx) => (
                    <span key={idx}>
                      <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                        {ns}
                      </Button>
                      {idx < assignment.namespaces.length - 1 && ', '}
                    </span>
                  ))}
                </Td>
                <Td dataLabel="Status">
                  <Label color="green" icon={<CheckIcon />}>
                    {assignment.status}
                  </Label>
                </Td>
                <Td dataLabel="Assigned date">{assignment.assignedDate}</Td>
                <Td dataLabel="Assigned by">{assignment.assignedBy}</Td>
                <Td dataLabel="Origin">{assignment.origin}</Td>
                <Td isActionCell>
                  <ActionsColumn
                    items={[
                      {
                        title: 'Edit',
                        onClick: () => console.log('Edit', assignment.id)
                      },
                      {
                        isSeparator: true
                      },
                      {
                        title: 'Delete',
                        onClick: () => handleDeleteAssignment(assignment.id)
                      }
                    ]}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={filteredAssignments.length}
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

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="detail-page-header">
        <Breadcrumb className="pf-v6-u-mb-md">
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/user-management/roles'); }}>
            Roles
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{roleData.name}</BreadcrumbItem>
        </Breadcrumb>

        <Split hasGutter className="pf-v6-u-mb-md">
          <SplitItem isFilled>
            <Title headingLevel="h1" size="2xl">
              {roleData.name}
            </Title>
          </SplitItem>
          <SplitItem>
            <Button variant="primary" onClick={handleEditRole}>
              Edit Role
            </Button>
          </SplitItem>
          <SplitItem>
            <Button variant="link" onClick={handleBack}>
              Back
            </Button>
          </SplitItem>
        </Split>

        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label="Role details tabs"
        >
        <Tab eventKey={0} title={<TabTitleText>General</TabTitleText>} aria-label="General"></Tab>
        <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML"></Tab>
        <Tab eventKey={2} title={<TabTitleText>Permissions</TabTitleText>} aria-label="Permissions"></Tab>
        <Tab eventKey={3} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments"></Tab>
      </Tabs>
      </div>

      <div className="detail-page-content">
        {activeTabKey === 0 && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Information
              </Title>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>Category</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color="grey">{roleData.category}</Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Origin</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.origin}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Created</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.created}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.description}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Annotations</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Content component="p">
                      <strong>description:</strong> {roleData.annotations.description}
                    </Content>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        )}

        {activeTabKey === 1 && (
          <Card>
            <CardBody>
              <CodeBlock>
                <CodeBlockCode>
                  {roleData.yaml}
                </CodeBlockCode>
              </CodeBlock>
            </CardBody>
          </Card>
        )}

        {activeTabKey === 2 && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Permission Rules
              </Title>
              {roleData.rules.map((rule, index) => (
                <div key={index} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                  <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    Rule {index + 1}
                  </Title>
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>API Groups</DescriptionListTerm>
                      <DescriptionListDescription>
                        {rule.apiGroups.join(', ')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Resources</DescriptionListTerm>
                      <DescriptionListDescription>
                        {rule.resources.join(', ')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Verbs</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Split hasGutter>
                          {rule.verbs.map((verb) => (
                            <SplitItem key={verb}>
                              <Label isCompact>{verb}</Label>
                            </SplitItem>
                          ))}
                        </Split>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {activeTabKey === 3 && <RoleAssignmentsTab />}
      </div>
      
      {/* Role Assignment Wizard */}
      <RoleDetailRoleAssignmentWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
        roleName={roleData.name}
      />
    </div>
  );
};

export { RoleDetail };

