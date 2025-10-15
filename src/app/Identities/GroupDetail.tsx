import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Content,
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
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
  Flex,
  FlexItem,
  Icon,
  Tooltip,
  Label,
  ToolbarGroup,
  Divider,
  ButtonVariant,
  Alert,
  AlertGroup,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { CubesIcon, FilterIcon, InfoCircleIcon, EllipsisVIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { GroupRoleAssignmentWizard } from '@app/RoleAssignment/GroupRoleAssignmentWizard';
import { getAllGroups, getUsersByGroup, getAllClusters, getAllClusterSets, getAllNamespaces } from '@app/data';

const GroupDetail: React.FunctionComponent = () => {
  const { groupName } = useParams<{ groupName: string }>();
  const navigate = useNavigate();
  
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
    projects: string[];
    roles: string[];
    status: 'Active' | 'Inactive';
    assignedDate: string;
    assignedBy: string;
    origin: string;
  }
  
  const [roleAssignments, setRoleAssignments] = React.useState<RoleAssignment[]>([]);
  const [showSuccessAlert, setShowSuccessAlert] = React.useState(false);
  
  useDocumentTitle(`ACM | ${groupName}`);

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
          .map((id: number) => allClusterSets.find(cs => cs.id === id)?.name)
          .filter(Boolean);
        clusterNames.push(...clusterSetNames);
        
        if (wizardData.selectedClusters && wizardData.selectedClusters.length > 0) {
          const selectedClusterNames = wizardData.selectedClusters
            .map((id: number) => allClusters.find(c => c.id === id)?.name)
            .filter(Boolean);
          clusterNames.length = 0; // Clear cluster set names
          clusterNames.push(...selectedClusterNames);
          
          if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
            const selectedProjectNames = wizardData.selectedProjects
              .map((id: number) => allNamespaces.find(n => n.id === id)?.name)
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
          .map((id: number) => allClusters.find(c => c.id === id)?.name)
          .filter(Boolean);
        clusterNames.push(...selectedClusterNames);
        
        if (wizardData.selectedProjects && wizardData.selectedProjects.length > 0) {
          const selectedProjectNames = wizardData.selectedProjects
            .map((id: number) => allNamespaces.find(n => n.id === id)?.name)
            .filter(Boolean);
          projectNames.push(...selectedProjectNames);
        } else {
          projectNames.push('All projects');
        }
      }
    }
    
    // Create new role assignment
    const newAssignment: RoleAssignment = {
      id: `ra-${Date.now()}`,
      name: groupName || 'Unknown Group',
      type: 'Group',
      clusters: clusterNames.length > 0 ? clusterNames : ['All clusters'],
      projects: projectNames.length > 0 ? projectNames : ['All projects'],
      roles: [wizardData.roleName || 'Unknown Role'],
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
  };

  const DetailsTab = () => (
    <Card>
      <CardBody>
        <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
          General information
        </Title>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>Group name</DescriptionListTerm>
            <DescriptionListDescription>{groupName}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );

  const YAMLTab = () => (
    <Card>
      <CardBody>
        <div style={{ 
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: 'var(--pf-t--global--border--radius--medium)',
          padding: 'var(--pf-t--global--spacer--md)',
          fontFamily: 'var(--pf-t--global--font--family--mono)',
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
          lineHeight: 'var(--pf-t--global--font--line-height--body)',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`kind: Group
apiVersion: user.openshift.io/v1
metadata:
  name: ${groupName?.toLowerCase().replace(/\s+/g, '-')}
  uid: 78d9f67c-e1da-431c-947a-b053adb39001
  resourceVersion: '9570553'
  creationTimestamp: '2025-07-24T02:08:30Z'
  labels:
    app: frontend
managedFields:
  - manager: htpasswd
    operation: Update
    apiVersion: user.openshift.io/v1
    time: '2025-07-24T02:08:30Z'
    fieldsType: FieldsV1
    fieldsV1:
      f:users: {}
users:
  - user1
  - user2`}
          </pre>
        </div>
      </CardBody>
    </Card>
  );

  const RoleAssignmentsTab = () => {
    const [isActionsOpen, setIsActionsOpen] = React.useState(false);
    const [selectedAssignments, setSelectedAssignments] = React.useState<Set<string>>(new Set());
    const [isBulkActionOpen, setIsBulkActionOpen] = React.useState(false);
    const [openRowMenuId, setOpenRowMenuId] = React.useState<string | null>(null);

    const isAllSelected = selectedAssignments.size === roleAssignments.length && roleAssignments.length > 0;

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
      console.log('Bulk delete assignments:', Array.from(selectedAssignments));
      setIsBulkActionOpen(false);
    };

    const toggleRowMenu = (assignmentId: string) => {
      setOpenRowMenuId(openRowMenuId === assignmentId ? null : assignmentId);
    };

    const handleDeleteAssignment = (assignmentId: string) => {
      console.log('Delete assignment:', assignmentId);
      setOpenRowMenuId(null);
    };

    if (roleAssignments.length === 0) {
      return (
        <Card>
          <CardBody>
            <EmptyState>
              <CubesIcon />
              <Title headingLevel="h2" size="lg">
                No role assignment created yet
              </Title>
              <EmptyStateBody>
                Description text that allows users to easily understand what this is for and how does it help them achieve their needs.
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
                      isOpen={isBulkActionOpen}
                      onSelect={() => setIsBulkActionOpen(false)}
                      onOpenChange={(isOpen: boolean) => setIsBulkActionOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
                          isExpanded={isBulkActionOpen}
                        >
                          Actions
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem key="delete" onClick={handleBulkDelete}>
                          Delete role assignment
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
                  <DropdownItem key="all">All</DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search for role assignment"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary" onClick={handleCreateRoleAssignment}>
                Create role assignment
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isActionsOpen}
                onSelect={() => setIsActionsOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    isExpanded={isActionsOpen}
                  >
                    Actions
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="delete">Delete</DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Role assignments table" variant="compact">
          <Thead>
            <Tr>
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: isAllSelected,
                }}
              />
              <Th>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                  <FlexItem style={{ fontWeight: 'bold' }}>Subject</FlexItem>
                  <FlexItem style={{ color: '#6a6e73', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>Name</FlexItem>
                </Flex>
              </Th>
              <Th width={10}>Type</Th>
              <Th>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                  <FlexItem style={{ fontWeight: 'bold' }}>Scope</FlexItem>
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem style={{ color: '#6a6e73', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>Clusters</FlexItem>
                      <FlexItem style={{ color: '#6a6e73', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>Project</FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </Th>
              <Th width={15}>Roles</Th>
              <Th width={10}>Status</Th>
              <Th width={15}>Assigned date</Th>
              <Th width={10}>Assigned by</Th>
              <Th width={10}>Origin</Th>
              <Th width={10}></Th>
            </Tr>
          </Thead>
          <Tbody>
            {roleAssignments.map((assignment) => (
              <Tr key={assignment.id}>
                <Td
                  select={{
                    rowIndex: assignment.id,
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
                <Td dataLabel="Scope">
                  <Flex spaceItems={{ default: 'spaceItemsMd' }} flexWrap={{ default: 'nowrap' }}>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsXs' }} flexWrap={{ default: 'wrap' }}>
                        {assignment.clusters.map((cluster, idx) => (
                          <React.Fragment key={idx}>
                            <FlexItem>
                              <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                                {cluster}
                              </Button>
                            </FlexItem>
                            {idx < assignment.clusters.length - 1 && <FlexItem>, </FlexItem>}
                          </React.Fragment>
                        ))}
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsXs' }} flexWrap={{ default: 'wrap' }}>
                        {assignment.projects.map((project, idx) => (
                          <React.Fragment key={idx}>
                            <FlexItem>
                              <Button variant="link" isInline style={{ paddingLeft: 0 }}>
                                {project}
                              </Button>
                            </FlexItem>
                            {idx < assignment.projects.length - 1 && <FlexItem>, </FlexItem>}
                          </React.Fragment>
                        ))}
                      </Flex>
                    </FlexItem>
                  </Flex>
                </Td>
                <Td dataLabel="Roles">
                  <Flex spaceItems={{ default: 'spaceItemsXs' }} flexWrap={{ default: 'wrap' }}>
                    {assignment.roles.map((role, idx) => (
                      <FlexItem key={idx}>
                        <Label color="blue">{role}</Label>
                      </FlexItem>
                    ))}
                  </Flex>
                </Td>
                <Td dataLabel="Status">
                  <Label color="green" icon={<Icon status="success" />}>
                    {assignment.status}
                  </Label>
                </Td>
                <Td dataLabel="Assigned date">{assignment.assignedDate}</Td>
                <Td dataLabel="Assigned by">{assignment.assignedBy}</Td>
                <Td dataLabel="Origin">{assignment.origin}</Td>
                <Td dataLabel="Actions" width={10}>
                  <Dropdown
                    isOpen={openRowMenuId === assignment.id}
                    onSelect={() => setOpenRowMenuId(null)}
                    onOpenChange={(isOpen: boolean) => {
                      if (!isOpen) setOpenRowMenuId(null);
                    }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        variant="plain"
                        onClick={() => toggleRowMenu(assignment.id)}
                        isExpanded={openRowMenuId === assignment.id}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="delete" onClick={() => handleDeleteAssignment(assignment.id)}>
                        Delete role assignment
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  };

  const UsersTab = () => {
    // Get group data from centralized database
    const allGroups = getAllGroups();
    const currentGroup = allGroups.find(g => g.name === groupName);
    const groupUsers = currentGroup ? getUsersByGroup(currentGroup.id) : [];
    
    // Transform users from database to component format
    const mockUsers = groupUsers.map((user, index) => ({
      id: index + 1,
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      identityProvider: 'LDAP',
      created: new Date(user.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }));

    const [selectedUsers, setSelectedUsers] = React.useState<Set<number>>(new Set());
    const [isBulkActionOpen, setIsBulkActionOpen] = React.useState(false);

    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
      (page - 1) * perPage,
      page * perPage
    );

    const isAllSelected = selectedUsers.size === filteredUsers.length && filteredUsers.length > 0;
    const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
      } else {
        setSelectedUsers(new Set());
      }
    };

    const handleSelectUser = (userId: number, isSelecting: boolean) => {
      const newSelected = new Set(selectedUsers);
      if (isSelecting) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      setSelectedUsers(newSelected);
    };

    const handleBulkAction = (action: string) => {
      console.log(`Bulk action: ${action} for users:`, Array.from(selectedUsers));
      setIsBulkActionOpen(false);
      // Here you would implement the actual bulk action logic
    };

    const handleAddUser = () => {
      console.log('Add user to group');
      // Implement add user logic
    };

    const handleRemoveUser = () => {
      console.log('Remove selected users from group');
      // Implement remove user logic
    };

    return (
      <Card>
        <CardBody>
          <Toolbar>
            <ToolbarContent>
              {selectedUsers.size > 0 && (
                <>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Content component="p" className="pf-v6-u-font-weight-bold">
                        {selectedUsers.size} selected
                      </Content>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isBulkActionOpen}
                        onSelect={() => setIsBulkActionOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsBulkActionOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
                            isExpanded={isBulkActionOpen}
                            variant="primary"
                          >
                            Actions
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="remove" onClick={() => handleBulkAction('remove')}>
                            Remove from group
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
                      <FilterIcon /> User
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all">All users</DropdownItem>
                    <DropdownItem key="ldap">LDAP</DropdownItem>
                    <DropdownItem key="local">Local</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder="Search for a user"
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.primary} onClick={handleAddUser}>
                  Add user
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.secondary} onClick={handleRemoveUser}>
                  Remove user
                </Button>
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.top}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          
          <Table aria-label="Users table" variant="compact">
            <Thead>
              <Tr>
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: isAllSelected,
                }}
              />
                <Th width={40} sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about user names">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 1, sortBy: { index: 1, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Identity provider</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about identity providers">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 2, sortBy: { index: 2, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Created</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about creation date">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={10}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedUsers.map((user) => (
                <Tr key={user.id}>
                  <Td
                    select={{
                      rowIndex: user.id,
                      onSelect: (_event, isSelecting) => handleSelectUser(user.id, isSelecting),
                      isSelected: selectedUsers.has(user.id),
                    }}
                  />
                  <Td dataLabel="Name">
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--pf-t--global--color--brand--default)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--pf-t--global--color--nonstatus--white--default)',
                          fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                          fontSize: 'var(--pf-t--global--font--size--body--default)'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <div>
                          <Button variant="link" isInline className="pf-v6-u-p-0">
                            {user.name}
                          </Button>
                          <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                            {user.username}
                          </div>
                        </div>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td dataLabel="Identity provider">
                    <Label color="blue">{user.identityProvider}</Label>
                  </Td>
                  <Td dataLabel="Created">{user.created}</Td>
                  <Td dataLabel="Actions">
                    <Button variant="plain" aria-label="Actions">
                      <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.bottom}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <div className="identities-page-container">
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              User management
            </BreadcrumbItem>
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              Identities
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{groupName}</BreadcrumbItem>
          </Breadcrumb>

          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexEnd' }} className="pf-v6-u-mb-md">
            <FlexItem>
              <Title headingLevel="h1" size="lg">
                {groupName}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </FlexItem>
          </Flex>

          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Group detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab" />
            <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab" />
            <Tab eventKey={2} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
            <Tab eventKey={3} title={<TabTitleText>Users</TabTitleText>} aria-label="Users tab" />
          </Tabs>
        </div>

        <div className="page-content-section">
          {activeTabKey === 0 && <DetailsTab />}
          {activeTabKey === 1 && <YAMLTab />}
          {activeTabKey === 2 && <RoleAssignmentsTab />}
          {activeTabKey === 3 && <UsersTab />}
        </div>
      </div>

      <GroupRoleAssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
        groupName={groupName || 'Unknown'}
      />

      {/* Success Alert */}
      <AlertGroup isToast isLiveRegion>
        {showSuccessAlert && (
          <Alert
            variant="success"
            title="Role assignment created"
            actionClose={
              <AlertActionCloseButton onClose={() => setShowSuccessAlert(false)} />
            }
            timeout={10000}
            onTimeout={() => setShowSuccessAlert(false)}
          />
        )}
      </AlertGroup>
    </>
  );
};

export { GroupDetail };
