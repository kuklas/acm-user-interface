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
  type: role.type,
}));

interface ClusterSetRoleAssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  clusterSetName: string;
}

export const ClusterSetRoleAssignmentWizard: React.FC<ClusterSetRoleAssignmentWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  clusterSetName,
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  
  // Carousel for example tree views (0, 1, or 2 for three examples)
  const [exampleIndex, setExampleIndex] = React.useState(0);
  
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
  
  // Step 2: Resources - Option B hierarchical structure
  const [resourceScope, setResourceScope] = React.useState<'all' | 'clusters'>('all');
  const [selectedClusters, setSelectedClusters] = React.useState<number[]>([]);
  const [clusterSearch, setClusterSearch] = React.useState('');
  const [isClusterFilterOpen, setIsClusterFilterOpen] = React.useState(false);
  const [clusterFilterType, setClusterFilterType] = React.useState('Name');
  const [isResourceScopeOpen, setIsResourceScopeOpen] = React.useState(false);
  
  // Sub-level states for hierarchical navigation
  const [clusterScope, setClusterScope] = React.useState<'everything' | 'projects'>('everything');
  const [isClusterScopeOpen, setIsClusterScopeOpen] = React.useState(false);
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectFilterType, setProjectFilterType] = React.useState('Name');
  
  // Track which sub-step we're on
  const [showClusterSelection, setShowClusterSelection] = React.useState(false);
  const [showScopeSelection, setShowScopeSelection] = React.useState(false);
  const [showProjectSelection, setShowProjectSelection] = React.useState(false);
  
  // Step 3: Role
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);
  const [roleSearch, setRoleSearch] = React.useState('');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);
  const [roleFilterType, setRoleFilterType] = React.useState('All');
  
  // Bulk selector dropdowns
  const [isUserBulkSelectorOpen, setIsUserBulkSelectorOpen] = React.useState(false);
  const [isGroupBulkSelectorOpen, setIsGroupBulkSelectorOpen] = React.useState(false);
  const [isClusterBulkSelectorOpen, setIsClusterBulkSelectorOpen] = React.useState(false);
  const [isProjectBulkSelectorOpen, setIsProjectBulkSelectorOpen] = React.useState(false);
  
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
    setResourceScope('all');
    setSelectedClusters([]);
    setClusterSearch('');
    setIsResourceScopeOpen(false);
    setClusterScope('everything');
    setIsClusterScopeOpen(false);
    setSelectedProjects([]);
    setProjectSearch('');
    setShowClusterSelection(false);
    setShowScopeSelection(false);
    setShowProjectSelection(false);
    setSelectedRole(null);
    setRoleSearch('');
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 2 && resourceScope === 'clusters') {
      // Handle hierarchical navigation within step 2
      if (!showClusterSelection && !showScopeSelection) {
        // User selected "Select specific clusters" but hasn't started substeps yet
        // Show the cluster selection substep
        setShowClusterSelection(true);
      } else if (showClusterSelection && !showScopeSelection) {
        // Clusters selected - move to scope selection
        if (selectedClusters.length > 0) {
          setShowClusterSelection(false);
          setShowScopeSelection(true);
          setClusterScope('everything');
        }
      } else if (showScopeSelection) {
        // Scope selection made (projects table may be shown inline or not)
        // Move to next step regardless
        setCurrentStep(currentStep + 1);
      } else {
        // Should not reach here, but fallback to next step
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Normal step progression
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 2 && resourceScope === 'clusters') {
      // Handle hierarchical navigation backwards within step 2
      if (showScopeSelection) {
        // Go back to cluster selection
        setShowScopeSelection(false);
        setShowClusterSelection(true);
        setClusterScope('everything');
        setSelectedProjects([]);
      } else if (showClusterSelection) {
        // Go back to initial dropdown - but stay on step 2
        setShowClusterSelection(false);
        setSelectedClusters([]);
        setResourceScope('all'); // Reset to initial state
      } else {
        // At the beginning of step 2 - go to previous step
        setCurrentStep(currentStep - 1);
      }
    } else if (currentStep === 1) {
      // Don't go back before step 1
      return;
    } else {
      // Normal step progression
      setCurrentStep(currentStep - 1);
    }
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
      selectedClusters,
    });
    
    resetWizard();
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return activeTabKey === 0 ? selectedUser === null : selectedGroup === null;
    }
    if (currentStep === 2) {
      // For Option B: Check hierarchical requirements
      if (resourceScope === 'clusters') {
        if (!showClusterSelection) return false; // Initial dropdown selection is valid
        if (selectedClusters.length === 0) return true; // Need at least one cluster
        if (showScopeSelection) {
          // If "Limit to specific projects" is selected, validate that projects are selected
          if (clusterScope === 'projects' && selectedProjects.length === 0) return true;
          return false; // Otherwise scope selection is valid
        }
      }
      return false;
    }
    if (currentStep === 3) {
      return selectedRole === null;
    }
    return false;
  };

  // Find the cluster set and filter clusters that belong to it
  const mockClusters = React.useMemo(() => {
    // Find the cluster set by name
    const clusterSet = dbClusterSets.find(cs => cs.name === clusterSetName);
    if (!clusterSet) return [];
    
    // Filter clusters that belong to this cluster set
    const clustersInSet = dbClusters.filter(cluster => cluster.clusterSetId === clusterSet.id);
    
    return clustersInSet.map((cluster, index) => ({
      id: index + 1,
      dbId: cluster.id,
      name: cluster.name,
      status: cluster.status,
      infrastructure: index % 3 === 0 ? 'Amazon Web Services' : index % 3 === 1 ? 'Microsoft Azure' : 'Google Cloud Platform',
      controlPlaneType: 'Standalone',
      kubernetesVersion: cluster.kubernetesVersion,
      labels: Math.floor(Math.random() * 10) + 1,
      nodes: cluster.nodes,
    }));
  }, [clusterSetName]);

  // Filter projects based on clusters in the cluster set
  const mockProjects = React.useMemo(() => {
    // Find the cluster set by name
    const clusterSet = dbClusterSets.find(cs => cs.name === clusterSetName);
    if (!clusterSet) return [];
    
    // Get cluster IDs in this cluster set
    const clusterIdsInSet = dbClusters
      .filter(cluster => cluster.clusterSetId === clusterSet.id)
      .map(cluster => cluster.id);
    
    // Filter namespaces that belong to clusters in this cluster set
    const namespacesInSet = dbNamespaces.filter(namespace => 
      clusterIdsInSet.includes(namespace.clusterId)
    );
    
    return namespacesInSet.map((namespace, index) => ({
      id: index + 1,
      name: namespace.name,
      displayName: namespace.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: namespace.type,
      clusterId: namespace.clusterId,
      clusterName: dbClusters.find(c => c.id === namespace.clusterId)?.name || 'Unknown',
    }));
  }, [clusterSetName]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredClusters = mockClusters.filter(cluster =>
    cluster.name.toLowerCase().includes(clusterSearch.toLowerCase())
  );

  const filteredRoles = mockRoles.filter(role => {
    // Filter by search
    const matchesSearch = role.name.toLowerCase().includes(roleSearch.toLowerCase());
    
    // Filter by type
    const matchesType = roleFilterType === 'All' || role.type === roleFilterType;
    
    return matchesSearch && matchesType;
  });

  // Filter projects based on selected clusters and search
  const filteredProjects = React.useMemo(() => {
    let projects = mockProjects;
    
    // Filter by selected clusters
    if (selectedClusters.length > 0) {
      const selectedClusterDbIds = selectedClusters
        .map(id => mockClusters.find(c => c.id === id)?.dbId)
        .filter(Boolean) as string[];
      
      // First, get all projects from the selected clusters
      projects = projects.filter(p => selectedClusterDbIds.includes(p.clusterId));
      
      // SINGLE CLUSTER: Show ALL projects from that cluster (e.g., dev-team-a shows all its 3 projects)
      // MULTIPLE CLUSTERS: Show ONLY common projects (projects with same name across ALL selected clusters)
      if (selectedClusters.length > 1) {
        // Group projects by name to find which ones exist in all selected clusters
        const projectsByName = new Map<string, typeof mockProjects>();
        projects.forEach(project => {
          if (!projectsByName.has(project.name)) {
            projectsByName.set(project.name, []);
          }
          projectsByName.get(project.name)?.push(project);
        });
        
        // Find project names that appear in ALL selected clusters
        const commonProjectNames = Array.from(projectsByName.entries())
          .filter(([_, projs]) => projs.length === selectedClusters.length)
          .map(([name]) => name);
        
        // Filter to show only common projects
        projects = projects.filter(p => commonProjectNames.includes(p.name));
      }
    }
    
    // Filter by search
    if (projectSearch) {
      projects = projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()));
    }
    
    return projects;
  }, [selectedClusters, projectSearch, mockProjects, mockClusters]);

  // Render step indicator to match the original wizard
  const renderStepIndicator = (stepNum: number, label: string, isSubStep: boolean = false) => {
    const isActive = currentStep === stepNum;
    const isCompleted = currentStep > stepNum;
    
    // Render substeps without circles
    if (isSubStep) {
      const isSubStepActive = 
        (currentStep === 2 && stepNum === 2 && 
          ((label === 'Select clusters' && showClusterSelection) ||
           (label === 'Choose scope' && showScopeSelection) ||
           (label === 'Select projects' && showProjectSelection)));
      
      return (
        <div style={{ position: 'relative', marginBottom: '0.25rem', paddingLeft: '3.5rem' }}>
          <span
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 0.75rem',
              fontSize: '14px',
              color: '#6a6e73',
              cursor: 'default',
              backgroundColor: isSubStepActive ? '#f0f0f0' : 'transparent',
              borderRadius: '4px'
            }}
          >
            {label}
          </span>
        </div>
      );
    }
    
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
          <Title headingLevel="h1" size="2xl" id="cluster-set-wizard-title">
            Create role assignment for {clusterSetName}
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
            {currentStep === 2 && resourceScope === 'clusters' && (
              <>
                {(showClusterSelection || showScopeSelection) && (
                  <div style={{ marginLeft: '3.5rem', marginTop: '0', marginBottom: '0.5rem' }}>
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      fontSize: '14px',
                      color: '#6a6e73',
                      cursor: 'default',
                      backgroundColor: showClusterSelection ? '#f5f5f5' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '0'
                    }}>
                      Select clusters
                    </div>
                    {showScopeSelection && (
                      <div style={{ 
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        color: '#6a6e73',
                        cursor: 'default',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '0'
                      }}>
                        Define access level
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
              padding: '1.5rem 0 1.5rem 1.5rem', 
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
                            position: 'bottom-start',
                            strategy: 'fixed',
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
                            position: 'bottom-start',
                            strategy: 'fixed',
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
              Define the scope of access by selecting which resources this role will apply to. You can grant access to the entire cluster set or narrow it down to specific clusters and projects.
            </Content>

            {/* Only show dropdown when NOT in any substep */}
            {!showClusterSelection && !showScopeSelection && !showProjectSelection && (
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
                    {resourceScope === 'all' ? 'Everything in the cluster set' : 'Select specific clusters'}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
                popperProps={{
                  appendTo: () => document.body,
                  position: 'bottom-start',
                  strategy: 'fixed',
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      enabled: true,
                    },
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8],
                      },
                    },
                  ],
                }}
              >
                <DropdownList>
                  <DropdownItem
                    key="all"
                    onClick={() => {
                      setResourceScope('all');
                      setSelectedClusters([]);
                      setSelectedProjects([]);
                      setShowClusterSelection(false);
                      setShowScopeSelection(false);
                      setShowProjectSelection(false);
                      setIsResourceScopeOpen(false);
                    }}
                    description="Applies to all current and future clusters and resources in this cluster set"
                  >
                    Everything in the cluster set
                  </DropdownItem>
                  <DropdownItem
                    key="clusters"
                    onClick={() => {
                      setResourceScope('clusters');
                      setShowClusterSelection(false);
                      setSelectedClusters([]);
                      setSelectedProjects([]);
                      setShowScopeSelection(false);
                      setShowProjectSelection(false);
                      setIsResourceScopeOpen(false);
                    }}
                    description="Choose individual clusters, then optionally narrow down to specific projects"
                  >
                    Select specific clusters
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            )}

            {/* Tree view - Visual representation of selection scope */}
            {!showClusterSelection && !showScopeSelection && !showProjectSelection && (
              <div style={{ 
                marginTop: '16px', 
                padding: '16px 16px 8px 16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '6px',
                border: '1px solid #d2d2d2'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  {/* Example title on the left */}
                  <Content component="p" style={{ fontSize: '11px', color: '#6a6e73', margin: 0, fontStyle: 'italic' }}>
                    {resourceScope === 'all' && 'Example scope: Full cluster set access'}
                    {resourceScope === 'clusters' && exampleIndex === 0 && 'Example scope: Partial single cluster access'}
                    {resourceScope === 'clusters' && exampleIndex === 1 && 'Example scope: Full single cluster access'}
                    {resourceScope === 'clusters' && exampleIndex === 2 && 'Example scope: Common projects across multiple clusters'}
                  </Content>
                  
                  {/* Carousel navigation on the right */}
                  {resourceScope === 'clusters' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Button 
                        variant="plain" 
                        onClick={() => setExampleIndex(Math.max(0, exampleIndex - 1))}
                        isDisabled={exampleIndex === 0}
                        aria-label="Previous example"
                      >
                        <AngleLeftIcon />
                      </Button>
                      <span style={{ fontSize: '12px', color: '#6a6e73' }}>
                        {exampleIndex + 1} of 3
                      </span>
                      <Button 
                        variant="plain" 
                        onClick={() => setExampleIndex(Math.min(2, exampleIndex + 1))}
                        isDisabled={exampleIndex === 2}
                        aria-label="Next example"
                      >
                        <AngleRightIcon />
                      </Button>
                    </div>
                  )}
                </div>
                <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                  {resourceScope === 'all' || (resourceScope === 'clusters' && exampleIndex === 2) ? (
                    <>
                      {/* Example for "Everything" OR Example 3: Common projects across clusters */}
                      
                      {/* Cluster set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      
                      {/* Cluster 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project (highlighted if in "clusters" mode for common project) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        ...(resourceScope === 'clusters' && { 
                          backgroundColor: '#E7F1FA', 
                          marginLeft: '20px', 
                          marginRight: '-8px', 
                          padding: '4px 8px 4px 0', 
                          borderRadius: '4px' 
                        })
                      }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: resourceScope === 'clusters' ? '-14px' : '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: resourceScope === 'clusters' ? '-14px' : '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: resourceScope === 'clusters' ? '6px' : '40px' }}></span>
                        {resourceScope === 'all' || (resourceScope === 'clusters' && exampleIndex === 2) ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515', fontWeight: resourceScope === 'clusters' ? 600 : 'normal' }}>
                          {resourceScope === 'clusters' ? 'Common project' : 'Project'}
                        </span>
                      </div>
                      
                      {/* VM 1 under project */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 2 under project (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 on Cluster 1 (not selected in Example 1) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative'
                      }}>
                        <span style={{ width: '1px', height: 'calc(50% + 3px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 3 under project 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 under project 2 (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Common project (highlighted again if in "clusters" mode) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        ...(resourceScope === 'clusters' && { 
                          backgroundColor: '#E7F1FA', 
                          marginLeft: '20px', 
                          marginRight: '-8px', 
                          padding: '4px 8px 4px 0', 
                          borderRadius: '4px' 
                        })
                      }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: resourceScope === 'clusters' ? '-14px' : '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: resourceScope === 'clusters' ? '6px' : '40px' }}></span>
                        {resourceScope === 'all' || (resourceScope === 'clusters' && exampleIndex === 2) ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515', fontWeight: resourceScope === 'clusters' ? 600 : 'normal' }}>
                          {resourceScope === 'clusters' ? 'Common project' : 'Project'}
                        </span>
                      </div>
                      
                      {/* VM 3 under project on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 under project on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 on Cluster 2 (not selected in Example 1) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative'
                      }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 5 under project 2 on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 6 under project 2 on cluster 2 (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        {resourceScope === 'all' ? (
                          <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        ) : (
                          <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        )}
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                    </>
                  ) : resourceScope === 'clusters' && exampleIndex === 1 ? (
                    <>
                      {/* Example 2: Whole cluster selected */}
                      
                      {/* Cluster set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      
                      {/* Cluster 1 (highlighted) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        backgroundColor: '#E7F1FA', 
                        marginLeft: '20px', 
                        marginRight: '-8px', 
                        padding: '4px 8px 4px 0', 
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '50%' }}></span>
                        <span style={{ marginLeft: '6px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Cluster</span>
                      </div>
                      
                      {/* Project (highlighted) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        backgroundColor: '#E7F1FA', 
                        marginLeft: '20px', 
                        marginRight: '-8px', 
                        padding: '4px 8px 4px 0', 
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '26px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Project</span>
                      </div>
                      
                      {/* VM 1 under project */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 2 under project (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 (not highlighted) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(50% + 3px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 3 under project 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 under project 2 (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project under Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 3 under project on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 under project on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 under Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 5 under project 2 on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 6 under project 2 on cluster 2 (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                    </>
                  ) : resourceScope === 'clusters' && exampleIndex === 0 ? (
                    <>
                      {/* Example 1: Single cluster and single project selected */}
                      
                      {/* Cluster set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      
                      {/* Cluster (highlighted) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        backgroundColor: '#E7F1FA', 
                        marginLeft: '20px', 
                        marginRight: '-8px', 
                        padding: '4px 8px 4px 0', 
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '50%' }}></span>
                        <span style={{ marginLeft: '6px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 (highlighted) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        backgroundColor: '#E7F1FA', 
                        marginLeft: '20px', 
                        marginRight: '-8px', 
                        padding: '4px 8px 4px 0', 
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '50%' }}></span>
                        <span style={{ marginLeft: '6px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Project</span>
                      </div>
                      
                      {/* VM 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 2 (last under project 1) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 (highlighted) */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '6px', 
                        position: 'relative',
                        backgroundColor: '#E7F1FA', 
                        marginLeft: '20px', 
                        marginRight: '-8px', 
                        padding: '4px 8px 4px 0', 
                        borderRadius: '4px'
                      }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '-14px', top: '50%' }}></span>
                        <span style={{ marginLeft: '6px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Project</span>
                      </div>
                      
                      {/* VM 3 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 under Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 1 under project 1 on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 2 under project 1 on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 under Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 3 under project 2 on cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 under project 2 on cluster 2 (last) */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                    </>
                  ) : null}
                </div>
                
              </div>
            )}

            {/* SUB-STEP 1: Select Clusters - Only shows after user clicks Continue */}
            {showClusterSelection && !showScopeSelection && (
              <div style={{ marginTop: '24px' }}>
                <Toolbar style={{ marginBottom: '16px' }}>
                  <ToolbarContent>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isClusterFilterOpen}
                        onSelect={() => setIsClusterFilterOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsClusterFilterOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setIsClusterFilterOpen(!isClusterFilterOpen)} 
                            isExpanded={isClusterFilterOpen}
                            variant="default"
                          >
                            {clusterFilterType}
                          </MenuToggle>
                        )}
                        popperProps={{
                          appendTo: () => document.body,
                          position: 'bottom-start',
                          strategy: 'fixed',
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setClusterFilterType('Name'); setIsClusterFilterOpen(false); }}>
                            Name
                          </DropdownItem>
                          <DropdownItem onClick={() => { setClusterFilterType('Status'); setIsClusterFilterOpen(false); }}>
                            Status
                          </DropdownItem>
                          <DropdownItem onClick={() => { setClusterFilterType('Infrastructure'); setIsClusterFilterOpen(false); }}>
                            Infrastructure
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Search clusters"
                        value={clusterSearch}
                        onChange={(_event, value) => setClusterSearch(value)}
                        onClear={() => setClusterSearch('')}
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                <Table aria-label="Clusters table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Name</Th>
                      <Th>Namespace</Th>
                      <Th>Status</Th>
                      <Th>Infrastructure</Th>
                      <Th>Control plane type</Th>
                      <Th>Distribution version</Th>
                      <Th>Labels</Th>
                      <Th>Nodes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredClusters.map((cluster) => (
                      <Tr
                        key={cluster.id}
                        isSelectable
                        isClickable
                        isRowSelected={selectedClusters.includes(cluster.id)}
                        onRowClick={() => {
                          if (selectedClusters.includes(cluster.id)) {
                            setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                          } else {
                            setSelectedClusters([...selectedClusters, cluster.id]);
                          }
                        }}
                      >
                        <Td>
                          <Checkbox
                            id={`cluster-${cluster.id}`}
                            isChecked={selectedClusters.includes(cluster.id)}
                            onChange={() => {
                              if (selectedClusters.includes(cluster.id)) {
                                setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                              } else {
                                setSelectedClusters([...selectedClusters, cluster.id]);
                              }
                            }}
                          />
                        </Td>
                        <Td>{cluster.name}</Td>
                        <Td>{clusterSetName}</Td>
                        <Td>
                          <Label color={cluster.status === 'Ready' ? 'green' : 'red'}>
                            {cluster.status}
                          </Label>
                        </Td>
                        <Td>{cluster.infrastructure || 'N/A'}</Td>
                        <Td>{cluster.controlPlaneType || 'Standalone'}</Td>
                        <Td>{cluster.kubernetesVersion || 'N/A'}</Td>
                        <Td>{cluster.labels || 0}</Td>
                        <Td>{cluster.nodes}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                {selectedClusters.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #0066cc' }}>
                    <Content component="p" style={{ fontSize: '14px', color: '#6a6e73' }}>
                      <strong>✓ {selectedClusters.length} cluster{selectedClusters.length > 1 ? 's' : ''} selected</strong>
                    </Content>
                    <Content component="p" style={{ fontSize: '13px', color: '#6a6e73', marginTop: '4px', fontStyle: 'italic' }}>
                      Click "Next" below to define the access level for {selectedClusters.length === 1 ? 'this cluster' : 'these clusters'}.
                    </Content>
                  </div>
                )}
              </div>
            )}

            {/* SUB-STEP 2: Choose Scope */}
            {showScopeSelection && (
              <div style={{ marginTop: '24px' }}>
                <FormGroup label="Access level" style={{ marginBottom: '16px' }}>
                  <Dropdown
                    isOpen={isClusterScopeOpen}
                    onSelect={() => setIsClusterScopeOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsClusterScopeOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsClusterScopeOpen(!isClusterScopeOpen)} 
                        isExpanded={isClusterScopeOpen}
                        variant="default"
                        style={{ width: '100%' }}
                      >
                        {clusterScope === 'everything'
                          ? (selectedClusters.length === 1 ? 'Full cluster access' : 'Full access on all clusters')
                          : (selectedClusters.length === 1 ? 'Select specific projects (multiple)' : 'Select common projects (multiple)')}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                    popperProps={{
                      appendTo: () => document.body,
                      position: 'bottom-start',
                      strategy: 'fixed',
                      modifiers: [
                        {
                          name: 'preventOverflow',
                          enabled: true,
                        },
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 8],
                          },
                        },
                      ],
                    }}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="everything"
                        onClick={() => {
                          setClusterScope('everything');
                          setSelectedProjects([]);
                          setShowProjectSelection(false);
                          setIsClusterScopeOpen(false);
                        }}
                        description={selectedClusters.length === 1
                          ? '✓ Full access: All current and future projects/namespaces on this cluster'
                          : `✓ Full access: All current and future projects/namespaces across all ${selectedClusters.length} clusters`}
                      >
                        {selectedClusters.length === 1 ? 'Full cluster access' : 'Full access on all clusters'}
                      </DropdownItem>
                      <DropdownItem
                        key="projects"
                        onClick={() => {
                          setClusterScope('projects');
                          setShowProjectSelection(true);
                          setSelectedProjects([]);
                          setIsClusterScopeOpen(false);
                        }}
                        description={selectedClusters.length === 1
                          ? '→ Limited access: Choose specific projects/namespaces from this cluster'
                          : `→ Limited access: Choose projects/namespaces that exist across all ${selectedClusters.length} clusters`}
                      >
                        {selectedClusters.length === 1 ? 'Limit to specific projects' : 'Limit to common projects'}
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FormGroup>
              </div>
            )}

            {/* Projects Table - appears inline when "Limit to specific projects" is selected */}
            {showScopeSelection && clusterScope === 'projects' && (
              <div style={{ marginTop: '24px' }}>
                {selectedClusters.length > 1 && (
                  <Content component="p" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', fontSize: '13px' }}>
                    <strong>Note:</strong> Only projects that exist in <strong>all {selectedClusters.length} clusters</strong> are shown below.
                  </Content>
                )}
                
                <Toolbar style={{ marginBottom: '16px' }}>
                  <ToolbarContent>
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
                          position: 'bottom-start',
                          strategy: 'fixed',
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setProjectFilterType('Name'); setIsProjectFilterOpen(false); }}>
                            Name
                          </DropdownItem>
                          <DropdownItem onClick={() => { setProjectFilterType('Type'); setIsProjectFilterOpen(false); }}>
                            Type
                          </DropdownItem>
                          {selectedClusters.length === 1 && (
                            <DropdownItem onClick={() => { setProjectFilterType('Display name'); setIsProjectFilterOpen(false); }}>
                              Display name
                            </DropdownItem>
                          )}
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
                  </ToolbarContent>
                </Toolbar>

                <Table aria-label="Projects table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Project name</Th>
                      {selectedClusters.length === 1 ? (
                        <>
                          <Th>Display name</Th>
                          <Th>Type</Th>
                        </>
                      ) : (
                        <Th>Clusters</Th>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedClusters.length === 1 ? (
                      // Single cluster - show all project details
                      filteredProjects.length === 0 ? (
                        <Tr>
                          <Td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                            <Content component="p" style={{ color: '#6a6e73' }}>
                              No projects found in this cluster.
                            </Content>
                          </Td>
                        </Tr>
                      ) : (
                        filteredProjects.map((project) => (
                        <Tr
                          key={project.id}
                          isSelectable
                          isClickable
                          isRowSelected={selectedProjects.includes(project.id)}
                          onRowClick={() => {
                            if (selectedProjects.includes(project.id)) {
                              setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                            } else {
                              setSelectedProjects([...selectedProjects, project.id]);
                            }
                          }}
                        >
                          <Td>
                            <Checkbox
                              id={`project-${project.id}`}
                              isChecked={selectedProjects.includes(project.id)}
                              onChange={() => {
                                if (selectedProjects.includes(project.id)) {
                                  setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                } else {
                                  setSelectedProjects([...selectedProjects, project.id]);
                                }
                              }}
                            />
                          </Td>
                          <Td>{project.name}</Td>
                          <Td>{project.displayName}</Td>
                          <Td>
                            <Label color="blue">{project.type}</Label>
                          </Td>
                        </Tr>
                        ))
                      )
                    ) : (
                      // Multiple clusters - show common projects with cluster list
                      (() => {
                        const commonProjectsMap = new Map<string, { projects: typeof mockProjects, clusterNames: string[] }>();
                        
                        filteredProjects.forEach(project => {
                          if (!commonProjectsMap.has(project.name)) {
                            commonProjectsMap.set(project.name, { projects: [], clusterNames: [] });
                          }
                          const entry = commonProjectsMap.get(project.name)!;
                          entry.projects.push(project);
                          if (!entry.clusterNames.includes(project.clusterName)) {
                            entry.clusterNames.push(project.clusterName);
                          }
                        });

                        const commonProjects = Array.from(commonProjectsMap.entries())
                          .filter(([_, entry]) => entry.clusterNames.length === selectedClusters.length)
                          .map(([name, entry]) => ({
                            name,
                            projects: entry.projects,
                            clusterNames: entry.clusterNames.sort()
                          }));

                        if (commonProjects.length === 0) {
                          return (
                            <Tr>
                              <Td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>
                                <Content component="p" style={{ color: '#6a6e73' }}>
                                  No common projects found in the selected clusters.
                                </Content>
                              </Td>
                            </Tr>
                          );
                        }

                        return commonProjects.map((item, index) => {
                          const isSelected = item.projects.every(p => selectedProjects.includes(p.id));
                          
                          return (
                            <Tr
                              key={index}
                              isSelectable
                              isClickable
                              isRowSelected={isSelected}
                              onRowClick={() => {
                                if (isSelected) {
                                  setSelectedProjects(selectedProjects.filter(id => !item.projects.some(p => p.id === id)));
                                } else {
                                  setSelectedProjects([...selectedProjects, ...item.projects.map(p => p.id)]);
                                }
                              }}
                            >
                              <Td>
                                <Checkbox
                                  id={`common-project-${index}`}
                                  isChecked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedProjects(selectedProjects.filter(id => !item.projects.some(p => p.id === id)));
                                    } else {
                                      setSelectedProjects([...selectedProjects, ...item.projects.map(p => p.id)]);
                                    }
                                  }}
                                />
                              </Td>
                              <Td>{item.name}</Td>
                              <Td>
                                {item.clusterNames.map((clusterName, idx) => (
                                  <Label key={idx} color="blue" style={{ marginRight: '4px' }}>
                                    {clusterName}
                                  </Label>
                                ))}
                              </Td>
                            </Tr>
                          );
                        });
                      })()
                    )}
                  </Tbody>
                </Table>
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
                      position: 'bottom-start',
                      strategy: 'fixed',
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
            <Table aria-label="Roles table" variant="compact">
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th>Role</Th>
                  <Th>Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRoles.slice(0, 10).map((role) => (
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
                    <Td dataLabel="Role">
                      <div style={{ fontWeight: selectedRole === role.id ? '600' : 'normal' }}>
                        {role.name}
                      </div>
                    </Td>
                    <Td dataLabel="Type">
                      <Label color={role.type === 'Default' ? 'blue' : 'purple'}>
                        {role.type}
                      </Label>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
                  {resourceScope === 'all' ? 'Everything in the cluster set' : 'Assign to specific'}
                </Content>
                
                {resourceScope === 'clusters' && (
                  <>
                    <Content component="p" style={{ 
                      marginBottom: '4px', 
                      fontSize: '14px', 
                      fontWeight: 600,
                      color: '#151515',
                      marginTop: '12px'
                    }}>
                      Specify clusters
                    </Content>
                    <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                      {selectedClusters.map(id => mockClusters.find(c => c.id === id)?.name).join(', ')}
                    </Content>

                    {clusterScope === 'projects' && selectedProjects.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515',
                          marginTop: '12px'
                        }}>
                          Include projects
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '4px' }}>
                          {selectedClusters.length > 1 ? 'Common projects' : 'Projects'}
                        </Content>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515',
                          marginTop: '8px'
                        }}>
                          Projects
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73' }}>
                          {selectedProjects.map(id => {
                            const project = mockProjects.find(p => p.id === id);
                            return project?.name;
                          }).filter(Boolean).join(', ')}
                        </Content>
                      </>
                    )}
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
              padding: '1rem 0 1rem 1.5rem', 
              backgroundColor: '#ffffff',
              flexShrink: 0
            }}>
              {(currentStep > 1 || 
                (currentStep === 2 && (showClusterSelection || showScopeSelection || showProjectSelection))) && (
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

