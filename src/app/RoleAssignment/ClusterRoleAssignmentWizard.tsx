import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Title,
  Content,
  Form,
  FormGroup,
  Radio,
  SearchInput,
  Tabs,
  Tab,
  TabTitleText,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
  Label,
  Flex,
  FlexItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Alert,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CaretDownIcon, CheckCircleIcon, CircleIcon, AngleLeftIcon, AngleRightIcon, ResourcesEmptyIcon } from '@patternfly/react-icons';
import { getAllUsers, getAllGroups, getAllRoles, getAllClusters, getAllNamespaces, getAllClusterSets } from '@app/data';

const dbUsers = getAllUsers();
const dbGroups = getAllGroups();
const dbRoles = getAllRoles();
const dbClusters = getAllClusters();
const dbNamespaces = getAllNamespaces();
const dbClusterSets = getAllClusterSets();

const mockUsers = dbUsers.map((user, index) => ({
  id: index + 1,
  dbId: user.id,
  name: `${user.firstName} ${user.lastName}`,
  username: user.username,
  provider: 'LDAP',
}));

const mockGroups = dbGroups.map((group, index) => ({
  id: index + 1,
  dbId: group.id,
  name: group.name,
  users: group.userIds.length,
}));

const mockRoles = dbRoles.map((role, index) => ({
  id: index + 1,
  name: role.name,
  displayName: role.displayName,
  type: role.type === 'default' ? 'Default' : 'Custom',
  resources: role.category === 'kubevirt' 
    ? ['VirtualMachines', 'VirtualMachineInstances'] 
    : role.category === 'cluster' 
    ? ['Clusters', 'ClusterSets'] 
    : role.category === 'namespace'
    ? ['Namespaces', 'Projects']
    : ['Applications', 'Deployments'],
  permissions: role.permissions,
}));

interface ClusterRoleAssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  clusterName: string;
}

export const ClusterRoleAssignmentWizard: React.FC<ClusterRoleAssignmentWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  clusterName,
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  
  // Carousel for example tree views (0, 1, or 2 for three examples)
  // Step 1: Identity
  const [selectedUser, setSelectedUser] = React.useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = React.useState<number | null>(null);
  const [userSearch, setUserSearch] = React.useState('');
  const [groupSearch, setGroupSearch] = React.useState('');
  const [usersPage, setUsersPage] = React.useState(1);
  const [usersPerPage, setUsersPerPage] = React.useState(10);
  const [groupsPage, setGroupsPage] = React.useState(1);
  const [groupsPerPage, setGroupsPerPage] = React.useState(10);
  const [isUserFilterOpen, setIsUserFilterOpen] = React.useState(false);
  const [userFilterType, setUserFilterType] = React.useState('User');
  const [isGroupFilterOpen, setIsGroupFilterOpen] = React.useState(false);
  const [groupFilterType, setGroupFilterType] = React.useState('Group');
  
  // Step 2: Resources - Simplified for single cluster
  const [resourceScope, setResourceScope] = React.useState<'full' | 'partial'>('full');
  const [isResourceScopeOpen, setIsResourceScopeOpen] = React.useState(false);
  
  // Project selection for partial access
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectFilterType, setProjectFilterType] = React.useState('Name');
  const [projectsPage, setProjectsPage] = React.useState(1);
  const [projectsPerPage, setProjectsPerPage] = React.useState(10);
  const [isProjectBulkSelectorOpen, setIsProjectBulkSelectorOpen] = React.useState(false);
  
  // Step 3: Role
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);
  const [roleSearch, setRoleSearch] = React.useState('');
  const [rolesPage, setRolesPage] = React.useState(1);
  const [rolesPerPage, setRolesPerPage] = React.useState(10);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);
  const [roleFilterType, setRoleFilterType] = React.useState('All');
  
  // Bulk selector dropdowns
  const [isUserBulkSelectorOpen, setIsUserBulkSelectorOpen] = React.useState(false);
  const [isGroupBulkSelectorOpen, setIsGroupBulkSelectorOpen] = React.useState(false);
  const [isClusterBulkSelectorOpen, setIsClusterBulkSelectorOpen] = React.useState(false);
  
  // Selected items for bulk operations
  const [selectedUsers, setSelectedUsers] = React.useState<Set<number>>(new Set());
  const [selectedGroups, setSelectedGroups] = React.useState<Set<number>>(new Set());

  const resetWizard = () => {
    setCurrentStep(1);
    setActiveTabKey(0);
    setSelectedUser(null);
    setSelectedGroup(null);
    setUserSearch('');
    setGroupSearch('');
    setResourceScope('full');
    setIsResourceScopeOpen(false);
    setSelectedProjects([]);
    setProjectSearch('');
    setProjectsPage(1);
    setProjectsPerPage(10);
    setSelectedRole(null);
    setRoleSearch('');
    setRolesPage(1);
    setRolesPerPage(10);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleNext = () => {
    // Simple step progression for simplified wizard
        setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Don't go back before step 1
      return;
    }
    // Simple step back
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    const identityType = activeTabKey === 0 ? 'user' : 'group';
    const identityId = activeTabKey === 0 ? selectedUser : selectedGroup;
    const identityName = activeTabKey === 0 
      ? mockUsers.find(u => u.id === selectedUser)?.name || 'Unknown'
      : mockGroups.find(g => g.id === selectedGroup)?.name || 'Unknown';
    
    const roleName = mockRoles.find(r => r.id === selectedRole)?.name || 'Unknown';

    onComplete({
      identityType,
      identityId,
      identityName,
      roleId: selectedRole,
      roleName,
      resourceScope,
      selectedProjects,
    });
    
    resetWizard();
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return activeTabKey === 0 ? selectedUser === null : selectedGroup === null;
    }
    if (currentStep === 2) {
      // For partial access, must select at least one project
      if (resourceScope === 'partial' && selectedProjects.length === 0) {
        return true;
      }
      return false;
    }
    if (currentStep === 3) {
      return selectedRole === null;
    }
    return false;
  };

  // Get the single cluster and its projects
  const mockClusters = React.useMemo(() => {
    // Find the cluster by name
    const cluster = dbClusters.find(c => c.name === clusterName);
    if (!cluster) return [];
    
    return [{
      id: 1,
      dbId: cluster.id,
      name: cluster.name,
      status: cluster.status,
      infrastructure: 'Amazon Web Services', // Simplified for single cluster
      controlPlaneType: 'Standalone',
      kubernetesVersion: cluster.kubernetesVersion,
      labels: 5,
      nodes: cluster.nodes,
    }];
  }, [clusterName]);

  // Filter projects based on this specific cluster
  const mockProjects = React.useMemo(() => {
    // Find the cluster by name
    const cluster = dbClusters.find(c => c.name === clusterName);
    if (!cluster) return [];
    
    // Filter namespaces that belong to this cluster
    const namespacesInCluster = dbNamespaces.filter(namespace => 
      namespace.clusterId === cluster.id
    );
    
    return namespacesInCluster.map((namespace, index) => ({
      id: index + 1,
      name: namespace.name,
      displayName: namespace.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: namespace.type,
      clusterId: namespace.clusterId,
      clusterName: cluster.name,
    }));
  }, [clusterName]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredRoles = mockRoles.filter(role => {
    // Filter by search (search both displayName and technical name)
    const matchesSearch = role.displayName.toLowerCase().includes(roleSearch.toLowerCase()) ||
                          role.name.toLowerCase().includes(roleSearch.toLowerCase());
    
    // Filter by type
    const matchesType = roleFilterType === 'All' || role.type === roleFilterType;
    
    return matchesSearch && matchesType;
  });

  // Filter projects based on selected clusters and search
  const filteredProjects = React.useMemo(() => {
    let projects = mockProjects;
    
    // Filter by search
    if (projectSearch) {
      projects = projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()));
    }
    
    return projects;
  }, [projectSearch, mockProjects]);

  // Render step indicator to match the original wizard
  const renderStepIndicator = (stepNum: number, label: string) => {
    const isActive = currentStep === stepNum;
    const isCompleted = currentStep > stepNum;
    
    return (
      <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'nowrap' }}
          style={{ 
            cursor: isCompleted ? 'pointer' : 'default',
            padding: '0.75rem 0.75rem',
            position: 'relative',
            zIndex: 2
          }}
          onClick={() => isCompleted && setCurrentStep(stepNum)}
        >
          <FlexItem style={{ flexShrink: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#0066cc' : '#d2d2d2',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {stepNum}
            </div>
          </FlexItem>
          <FlexItem style={{ marginLeft: '12px', flex: '1' }}>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              padding: isActive ? '0.5rem 0.75rem' : '0',
              backgroundColor: isActive ? '#f0f0f0' : 'transparent',
              borderRadius: '4px',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontWeight: isActive ? '600' : 'normal', 
                fontSize: '14px',
                color: isActive ? '#151515' : '#6a6e73',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {label}
              </span>
            </div>
          </FlexItem>
        </Flex>
      </div>
    );
  };

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="cluster-set-wizard-title"
      style={{ 
        '--pf-v6-c-modal-box--m-body--PaddingTop': '0',
        '--pf-v6-c-modal-box--m-body--PaddingRight': '0',
        '--pf-v6-c-modal-box--m-body--PaddingBottom': '0',
        '--pf-v6-c-modal-box--m-body--PaddingLeft': '0'
      } as React.CSSProperties}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '1.5rem', 
          borderBottom: '1px solid #d2d2d2',
          flexShrink: 0
        }}>
          <Title headingLevel="h1" size="2xl" id="cluster-wizard-title">
            Create role assignment for {clusterName}
          </Title>
          <Content component="p" style={{ marginTop: '0.5rem', color: '#6a6e73' }}>
            A role assignment specifies a distinct action users or groups can perform when associated with a particular role.{' '}
            <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
              See example of the yaml file and learn more about User management
            </Button>
          </Content>
        </div>

        {/* Body with Steps Navigation and Content */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          minHeight: 0, 
          alignItems: 'stretch', 
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}>
          {/* Left Navigation Panel */}
          <div style={{ 
            width: '300px', 
            padding: '1.5rem 1rem',
            borderRight: '1px solid #d2d2d2',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            margin: 0
          }}>
            {renderStepIndicator(1, 'Select user or group')}
            {renderStepIndicator(2, 'Select resources')}
            {renderStepIndicator(3, 'Select role')}
            {renderStepIndicator(4, 'Review')}
          </div>
          
          {/* Right Content Area with Footer */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: 0, 
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}>
            {/* Content Area - scrollable */}
            <div style={{ 
              flex: '1 1 0',
              padding: '1.5rem 1.5rem 1.5rem 1.5rem', 
              backgroundColor: '#ffffff',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>

        {/* Step 1: Select User or Group */}
        {currentStep === 1 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              Select user or group
            </Title>
            
            <Tabs
              activeKey={activeTabKey}
              onSelect={(_event, tabIndex) => {
                setActiveTabKey(Number(tabIndex));
                setSelectedUser(null);
                setSelectedGroup(null);
              }}
              aria-label="Select user or group tabs"
              className="custom-tabs-selected"
              style={{ 
                marginBottom: 'var(--pf-t--global--spacer--md)'
              }}
            >
              <Tab eventKey={0} title={<TabTitleText>Users</TabTitleText>}>
                <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Dropdown
                          isOpen={isUserFilterOpen}
                          onSelect={() => setIsUserFilterOpen(false)}
                          onOpenChange={(isOpen: boolean) => setIsUserFilterOpen(isOpen)}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle 
                              ref={toggleRef} 
                              onClick={() => setIsUserFilterOpen(!isUserFilterOpen)} 
                              isExpanded={isUserFilterOpen}
                              variant="default"
                            >
                              {userFilterType}
                            </MenuToggle>
                          )}
                          popperProps={{
                            appendTo: () => document.body,
                            
                            
                          }}
                        >
                          <DropdownList>
                            <DropdownItem onClick={() => { setUserFilterType('User'); setIsUserFilterOpen(false); }}>
                              User
                            </DropdownItem>
                            <DropdownItem onClick={() => { setUserFilterType('Group'); setIsUserFilterOpen(false); }}>
                              Group
                            </DropdownItem>
                            <DropdownItem onClick={() => { setUserFilterType('Service account'); setIsUserFilterOpen(false); }}>
                              Service account
                            </DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </ToolbarItem>
                      <ToolbarItem>
                        <SearchInput
                          placeholder="Search users"
                          value={userSearch}
                          onChange={(_event, value) => setUserSearch(value)}
                          onClear={() => setUserSearch('')}
                        />
                      </ToolbarItem>
                      <ToolbarItem align={{ default: 'alignEnd' }}>
                        <Pagination
                          itemCount={filteredUsers.length}
                          perPage={usersPerPage}
                          page={usersPage}
                          onSetPage={(_event, pageNumber) => setUsersPage(pageNumber)}
                          onPerPageSelect={(_event, perPage) => {
                            setUsersPerPage(perPage);
                            setUsersPage(1);
                          }}
                          variant={PaginationVariant.top}
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                  <Table aria-label="Users table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th width={10}></Th>
                        <Th>User</Th>
                        <Th>Identity provider</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage).map((user) => (
                        <Tr
                          key={user.id}
                          isSelectable
                          isClickable
                          isRowSelected={selectedUser === user.id}
                          onRowClick={() => {
                            setSelectedUser(user.id);
                            setSelectedUsers(new Set([user.id]));
                          }}
                        >
                          <Td>
                            <Radio
                              id={`user-${user.id}`}
                              name="user-selection"
                              isChecked={selectedUser === user.id}
                              onChange={() => {
                                setSelectedUser(user.id);
                                setSelectedUsers(new Set([user.id]));
                              }}
                            />
                          </Td>
                          <Td dataLabel="User">
                            <div style={{ fontWeight: selectedUser === user.id ? '600' : 'normal' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {user.username}
                            </div>
                          </Td>
                          <Td dataLabel="Identity provider">LDAP</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Pagination
                    itemCount={filteredUsers.length}
                    perPage={usersPerPage}
                    page={usersPage}
                    onSetPage={(_event, pageNumber) => setUsersPage(pageNumber)}
                    onPerPageSelect={(_event, perPage) => {
                      setUsersPerPage(perPage);
                      setUsersPage(1);
                    }}
                    variant={PaginationVariant.bottom}
                    style={{ marginTop: '16px' }}
                  />
                </div>
              </Tab>
              
              <Tab eventKey={1} title={<TabTitleText>Groups</TabTitleText>}>
                <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Dropdown
                          isOpen={isGroupFilterOpen}
                          onSelect={() => setIsGroupFilterOpen(false)}
                          onOpenChange={(isOpen: boolean) => setIsGroupFilterOpen(isOpen)}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle 
                              ref={toggleRef} 
                              onClick={() => setIsGroupFilterOpen(!isGroupFilterOpen)} 
                              isExpanded={isGroupFilterOpen}
                              variant="default"
                            >
                              {groupFilterType}
                            </MenuToggle>
                          )}
                          popperProps={{
                            appendTo: () => document.body,
                            
                            
                          }}
                        >
                          <DropdownList>
                            <DropdownItem onClick={() => { setGroupFilterType('Group'); setIsGroupFilterOpen(false); }}>
                              Group
                            </DropdownItem>
                            <DropdownItem onClick={() => { setGroupFilterType('User'); setIsGroupFilterOpen(false); }}>
                              User
                            </DropdownItem>
                            <DropdownItem onClick={() => { setGroupFilterType('Service account'); setIsGroupFilterOpen(false); }}>
                              Service account
                            </DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </ToolbarItem>
                      <ToolbarItem>
                        <SearchInput
                          placeholder="Search groups"
                          value={groupSearch}
                          onChange={(_event, value) => setGroupSearch(value)}
                          onClear={() => setGroupSearch('')}
                        />
                      </ToolbarItem>
                      <ToolbarItem align={{ default: 'alignEnd' }}>
                        <Pagination
                          itemCount={filteredGroups.length}
                          perPage={groupsPerPage}
                          page={groupsPage}
                          onSetPage={(_event, pageNumber) => setGroupsPage(pageNumber)}
                          onPerPageSelect={(_event, perPage) => {
                            setGroupsPerPage(perPage);
                            setGroupsPage(1);
                          }}
                          variant={PaginationVariant.top}
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                  <Table aria-label="Groups table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th width={10}></Th>
                        <Th>Group</Th>
                        <Th>Users</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredGroups.slice((groupsPage - 1) * groupsPerPage, groupsPage * groupsPerPage).map((group) => (
                        <Tr
                          key={group.id}
                          isSelectable
                          isClickable
                          isRowSelected={selectedGroup === group.id}
                          onRowClick={() => {
                            setSelectedGroup(group.id);
                            setSelectedGroups(new Set([group.id]));
                          }}
                        >
                          <Td>
                            <Radio
                              id={`group-${group.id}`}
                              name="group-selection"
                              isChecked={selectedGroup === group.id}
                              onChange={() => {
                                setSelectedGroup(group.id);
                                setSelectedGroups(new Set([group.id]));
                              }}
                            />
                          </Td>
                          <Td dataLabel="Group">
                            <div style={{ fontWeight: selectedGroup === group.id ? '600' : 'normal' }}>
                              {group.name}
                            </div>
                          </Td>
                          <Td dataLabel="Users">{group.users}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Pagination
                    itemCount={filteredGroups.length}
                    perPage={groupsPerPage}
                    page={groupsPage}
                    onSetPage={(_event, pageNumber) => setGroupsPage(pageNumber)}
                    onPerPageSelect={(_event, perPage) => {
                      setGroupsPerPage(perPage);
                      setGroupsPage(1);
                    }}
                    variant={PaginationVariant.bottom}
                    style={{ marginTop: '16px' }}
                  />
                </div>
              </Tab>
            </Tabs>
          </>
        )}

        {/* Step 2: Select Resources */}
        {currentStep === 2 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '8px' }}>
              Select resources
            </Title>
            <Content component="p" style={{ marginBottom: '16px', color: '#6a6e73', fontSize: '14px' }}>
              Define the scope of access for this role assignment on the {clusterName} cluster.
            </Content>

              <Dropdown
                isOpen={isResourceScopeOpen}
                onSelect={() => setIsResourceScopeOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsResourceScopeOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle 
                    ref={toggleRef} 
                    onClick={() => setIsResourceScopeOpen(!isResourceScopeOpen)} 
                    isExpanded={isResourceScopeOpen}
                    variant="default"
                    style={{ width: '100%' }}
                  >
                  {resourceScope === 'full' ? 'Full access' : 'Partial access'}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
                popperProps={{
                  appendTo: () => document.body,
                  
                  
                }}
              >
                <DropdownList>
                  <DropdownItem
                  key="full"
                    onClick={() => {
                    setResourceScope('full');
                      setSelectedProjects([]);
                      setIsResourceScopeOpen(false);
                    }}
                  description="Grant access to all current and future projects in this cluster"
                  >
                  Full access
                  </DropdownItem>
                  <DropdownItem
                  key="partial"
                    onClick={() => {
                    setResourceScope('partial');
                      setSelectedProjects([]);
                      setIsResourceScopeOpen(false);
                    }}
                  description="Select specific projects to grant access to"
                  >
                  Partial access
                  </DropdownItem>
                </DropdownList>
              </Dropdown>

            {/* Projects table for partial access */}
            {resourceScope === 'partial' && (
              <div style={{ marginTop: '24px' }}>
                <Toolbar style={{ marginBottom: '16px' }}>
                  <ToolbarContent>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isProjectBulkSelectorOpen}
                        onSelect={() => setIsProjectBulkSelectorOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsProjectBulkSelectorOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setIsProjectBulkSelectorOpen(!isProjectBulkSelectorOpen)}
                            isExpanded={isProjectBulkSelectorOpen}
                            variant="default"
                            style={{
                              borderRadius: '8px',
                              height: '36px',
                              minWidth: '50px',
                              padding: '0 8px',
                            }}
                          >
                          <Checkbox
                              isChecked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                              onChange={(_event, checked) => {
                                if (checked) {
                                  setSelectedProjects(filteredProjects.slice((projectsPage - 1) * projectsPerPage, projectsPage * projectsPerPage).map(p => p.id));
                              } else {
                                  setSelectedProjects([]);
                                }
                              }}
                              aria-label="Select all projects"
                              id="bulk-select-projects"
                            />
                      </MenuToggle>
                    )}
                    popperProps={{
                      appendTo: () => document.body,
                          
                          
                    }}
                  >
                    <DropdownList>
                          <DropdownItem onClick={() => {
                            setSelectedProjects(filteredProjects.slice((projectsPage - 1) * projectsPerPage, projectsPage * projectsPerPage).map(p => p.id));
                            setIsProjectBulkSelectorOpen(false);
                          }}>
                            Select page ({Math.min(projectsPerPage, filteredProjects.length - (projectsPage - 1) * projectsPerPage)} items)
                      </DropdownItem>
                          <DropdownItem onClick={() => {
                            setSelectedProjects(filteredProjects.map(p => p.id));
                            setIsProjectBulkSelectorOpen(false);
                          }}>
                            Select all ({filteredProjects.length} items)
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isProjectFilterOpen}
                        onSelect={() => setIsProjectFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsProjectFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setIsProjectFilterOpen(!isProjectFilterOpen)} 
                            isExpanded={isProjectFilterOpen}
                            variant="default"
                          >
                            {projectFilterType}
                          </MenuToggle>
                        )}
                        popperProps={{
                          appendTo: () => document.body,
                          
                          
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setProjectFilterType('Name'); setIsProjectFilterOpen(false); }}>
                            Name
                          </DropdownItem>
                          <DropdownItem onClick={() => { setProjectFilterType('Type'); setIsProjectFilterOpen(false); }}>
                            Type
                          </DropdownItem>
                            <DropdownItem onClick={() => { setProjectFilterType('Display name'); setIsProjectFilterOpen(false); }}>
                              Display name
                            </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search projects"
                        value={projectSearch}
                        onChange={(_event, value) => setProjectSearch(value)}
                        onClear={() => setProjectSearch('')}
                      />
                    </ToolbarItem>
                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredProjects.length}
                        perPage={projectsPerPage}
                        page={projectsPage}
                        onSetPage={(_event, page) => setProjectsPage(page)}
                        onPerPageSelect={(_event, perPage) => {
                          setProjectsPerPage(perPage);
                          setProjectsPage(1);
                        }}
                        variant={PaginationVariant.top}
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                <Table aria-label="Projects table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Project name</Th>
                          <Th>Display name</Th>
                          <Th>Type</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProjects.length === 0 ? (
                        <Tr>
                          <Td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                            <Content component="p" style={{ color: '#6a6e73' }}>
                              No projects found in this cluster.
                            </Content>
                          </Td>
                        </Tr>
                      ) : (
                        filteredProjects
                          .slice((projectsPage - 1) * projectsPerPage, projectsPage * projectsPerPage)
                          .map((project) => (
                        <Tr key={project.id}>
                          <Td
                            select={{
                              rowIndex: project.id,
                              onSelect: (_event, isSelecting) => {
                                setSelectedProjects(prev => {
                                  const newSelected = new Set(prev);
                                  if (isSelecting) {
                                    newSelected.add(project.id);
                            } else {
                                    newSelected.delete(project.id);
                                  }
                                  return Array.from(newSelected);
                                });
                              },
                              isSelected: selectedProjects.includes(project.id),
                            }}
                          />
                          <Td dataLabel="Project name">{project.name}</Td>
                          <Td dataLabel="Display name">{project.displayName}</Td>
                          <Td dataLabel="Type">{project.type}</Td>
                            </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
                
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredProjects.length}
                        perPage={projectsPerPage}
                        page={projectsPage}
                        onSetPage={(_event, page) => setProjectsPage(page)}
                        onPerPageSelect={(_event, perPage) => {
                          setProjectsPerPage(perPage);
                          setProjectsPage(1);
                        }}
                        variant={PaginationVariant.bottom}
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>
              </div>
            )}
          </>
        )}

        {/* Step 3: Select Role */}
        {currentStep === 3 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
              Select role
            </Title>
            
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isRoleFilterOpen}
                    onSelect={() => setIsRoleFilterOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsRoleFilterOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)} 
                        isExpanded={isRoleFilterOpen}
                        variant="default"
                      >
                        {roleFilterType}
                      </MenuToggle>
                    )}
                    popperProps={{
                      appendTo: () => document.body,
                      
                      
                    }}
                  >
                    <DropdownList>
                      <DropdownItem onClick={() => { setRoleFilterType('All'); setIsRoleFilterOpen(false); }}>
                        All
                      </DropdownItem>
                      <DropdownItem onClick={() => { setRoleFilterType('Default'); setIsRoleFilterOpen(false); }}>
                        Default
                      </DropdownItem>
                      <DropdownItem onClick={() => { setRoleFilterType('Custom'); setIsRoleFilterOpen(false); }}>
                        Custom
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search roles"
                    value={roleSearch}
                    onChange={(_event, value) => setRoleSearch(value)}
                    onClear={() => setRoleSearch('')}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="Roles table" variant="compact" style={{ tableLayout: 'fixed', width: '100%' }}>
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th width={35}>Role</Th>
                  <Th width={15}>Type</Th>
                  <Th width={25}>Resources</Th>
                  <Th width={20}>Permissions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRoles.slice((rolesPage - 1) * rolesPerPage, rolesPage * rolesPerPage).map((role) => (
                  <Tr
                    key={role.id}
                    isSelectable
                    isClickable
                    isRowSelected={selectedRole === role.id}
                    onRowClick={() => setSelectedRole(role.id)}
                  >
                    <Td>
                      <Radio
                        id={`role-${role.id}`}
                        name="role-selection"
                        isChecked={selectedRole === role.id}
                        onChange={() => setSelectedRole(role.id)}
                      />
                    </Td>
                    <Td dataLabel="Role" style={{ textAlign: 'left', wordBreak: 'break-word' }}>
                      <div>
                        <div style={{ fontWeight: selectedRole === role.id ? '600' : 'normal' }}>
                          {role.displayName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {role.name}
                        </div>
                      </div>
                    </Td>
                    <Td dataLabel="Type">
                      <Label color={role.type === 'Default' ? 'blue' : 'green'}>{role.type}</Label>
                    </Td>
                    <Td dataLabel="Resources" style={{ wordBreak: 'break-word' }}>
                      <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        {role.resources.join(', ')}
                      </div>
                    </Td>
                    <Td dataLabel="Permissions">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {role.permissions.slice(0, 2).map((perm) => (
                          <Label key={perm} isCompact>{perm}</Label>
                        ))}
                        {role.permissions.length > 2 && (
                          <Label isCompact>+{role.permissions.length - 2} more</Label>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              itemCount={filteredRoles.length}
              perPage={rolesPerPage}
              page={rolesPage}
              onSetPage={(_event, pageNumber) => setRolesPage(pageNumber)}
              onPerPageSelect={(_event, perPage) => {
                setRolesPerPage(perPage);
                setRolesPage(1);
              }}
              variant={PaginationVariant.bottom}
            />
          </>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
              Review
            </Title>
            
            {/* Select user or group section */}
            <div style={{ 
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid #d2d2d2'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
                  Select user or group
                </Title>
                <Button 
                  variant="link" 
                  isInline 
                  onClick={() => setCurrentStep(1)}
                  style={{ fontSize: '14px' }}
                >
                  Edit step
                </Button>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Content component="p" style={{ 
                  marginBottom: '4px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#151515'
                }}>
                  {activeTabKey === 0 ? 'User' : 'Group'}
                </Content>
                <Content component="p" style={{ fontSize: '14px', color: '#6a6e73' }}>
                  {activeTabKey === 0 
                    ? mockUsers.find(u => u.id === selectedUser)?.name
                    : mockGroups.find(g => g.id === selectedGroup)?.name}
                </Content>
              </div>
            </div>

            {/* Select resources section */}
            <div style={{ 
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid #d2d2d2'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
                  Select resources
                </Title>
                <Button 
                  variant="link" 
                  isInline 
                  onClick={() => setCurrentStep(2)}
                  style={{ fontSize: '14px' }}
                >
                  Edit step
                </Button>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Content component="p" style={{ 
                  marginBottom: '8px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#151515'
                }}>
                  Select resources
                </Content>
                <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                  Cluster: {clusterName}
                    </Content>
                    <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                  Access: {resourceScope === 'full' ? 'Full access (all projects)' : 'Partial access (specific projects)'}
                    </Content>

                {resourceScope === 'partial' && selectedProjects.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515',
                          marginTop: '12px'
                        }}>
                      Selected projects
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73' }}>
                          {selectedProjects.map(id => {
                            const project = mockProjects.find(p => p.id === id);
                            return project?.name;
                          }).filter(Boolean).join(', ')}
                        </Content>
                  </>
                )}
              </div>
            </div>

            {/* Select role section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
                  Select role
                </Title>
                <Button 
                  variant="link" 
                  isInline 
                  onClick={() => setCurrentStep(3)}
                  style={{ fontSize: '14px' }}
                >
                  Edit step
                </Button>
              </div>
              <div style={{ marginLeft: '16px' }}>
                <Content component="p" style={{ 
                  marginBottom: '4px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#151515'
                }}>
                  Role
                </Content>
                <Content component="p" style={{ fontSize: '14px', color: '#6a6e73' }}>
                  {mockRoles.find(r => r.id === selectedRole)?.name}
                </Content>
              </div>
            </div>
          </>
        )}

            </div>
            
            {/* Footer with Buttons - only spans right content area */}
            <div style={{ 
              borderTop: '1px solid #d2d2d2', 
              padding: '1rem 1.5rem 1rem 1.5rem', 
              backgroundColor: '#ffffff',
              flexShrink: 0
            }}>
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              )}{' '}
              {currentStep < 4 ? (
                <Button variant="primary" onClick={handleNext} isDisabled={isNextDisabled()}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={handleFinish}>
                  Finish
                </Button>
              )}{' '}
              <Button variant="link" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

