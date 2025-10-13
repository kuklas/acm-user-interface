import * as React from 'react';
import {
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  Pagination,
  PaginationVariant,
  Radio,
  SearchInput,
  Tabs,
  Tab,
  TabTitleText,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { CaretDownIcon, FilterIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';

interface RoleAssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clusterName?: string;
  context?: 'clusters' | 'identities' | 'roles';
  preselectedIdentity?: {
    type: 'user' | 'group';
    id: number;
    name: string;
  };
  preselectedRole?: {
    id: number;
    name: string;
    type: string;
  };
}

// Mock data
const mockUsers = [
  { id: 1, name: 'Joydeep Banerjee', username: 'jbanerje', provider: 'LDAP' },
  { id: 2, name: 'awaltez', username: 'awaltez', provider: 'LDAP' },
  { id: 3, name: 'Joshua Packer', username: 'jpacker', provider: 'LDAP' },
];

const mockGroups = [
  { id: 1, name: 'Observability team', users: 38 },
  { id: 2, name: 'Security team', users: 46 },
  { id: 3, name: 'dev-team-alpha', users: 60 },
];

const mockClusters = [
  { id: 1, name: 'EU-Prod-5G-Core', infrastructure: 'Amazon Web Services', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['12 labels'] },
  { id: 2, name: 'Global Edge Sites Host Inventory', infrastructure: 'Host Inventory', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['12 labels'] },
  { id: 3, name: 'dev-team-a', infrastructure: 'Amazon Web Services', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['18 labels'] },
  { id: 4, name: 'dev-team-b', infrastructure: 'Amazon Web Services', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['18 labels'] },
  { id: 5, name: 'dev-test-a', infrastructure: 'Host Inventory', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['9 labels'] },
  { id: 6, name: 'dev-test-b', infrastructure: 'Host Inventory', controlPlane: 'Standalone', distribution: 'OpenShift 4.18.19', labels: ['9 labels'] },
];

const mockProjects = [
  { id: 1, name: 'project-starlight-dev', clusters: 'dev-linux-a, dev-linux-b' },
  { id: 2, name: 'analytics', clusters: 'dev-linux-a, dev-linux-b' },
  { id: 3, name: 'observability', clusters: 'dev-linux-a, dev-linux-b' },
  { id: 4, name: 'other', clusters: 'dev-linux-a, dev-linux-b' },
  { id: 5, name: 'test', clusters: 'dev-linux-a, dev-linux-b' },
];

const mockRoles = [
  { id: 1, name: 'Virtualization admin', type: 'kubevirt.io/admin', description: 'Full control: Create, modify, and delete all Virtualization resources' },
  { id: 2, name: 'Virtualization viewer', type: 'kubevirt.io/view', description: 'View-only: Observe Virtualization resources and configurations' },
  { id: 3, name: 'Virtualization editor', type: 'kubevirt.io/edit', description: 'Modify resources: Create, edit, and delete most Virtualization resources; cannot manage access' },
];

const RoleAssignmentWizard: React.FunctionComponent<RoleAssignmentWizardProps> = ({ 
  isOpen, 
  onClose, 
  clusterName, 
  context = 'clusters',
  preselectedIdentity,
  preselectedRole 
}) => {
  // Determine initial step based on context
  const getInitialStep = () => {
    if (context === 'identities') return 2; // Skip user/group selection
    if (context === 'roles') return 1; // Start with user/group selection
    return 1; // Default for clusters
  };

  const [currentStep, setCurrentStep] = React.useState(getInitialStep());
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  
  // Step 1: Select user or group
  const [selectedIdentityType, setSelectedIdentityType] = React.useState<'user' | 'group'>(
    preselectedIdentity?.type || 'user'
  );
  const [selectedUser, setSelectedUser] = React.useState<number | null>(
    preselectedIdentity?.type === 'user' ? preselectedIdentity.id : null
  );
  const [selectedGroup, setSelectedGroup] = React.useState<number | null>(
    preselectedIdentity?.type === 'group' ? preselectedIdentity.id : null
  );
  const [userSearchValue, setUserSearchValue] = React.useState('');
  const [isUserFilterOpen, setIsUserFilterOpen] = React.useState(false);
  const [userFilterType, setUserFilterType] = React.useState('User');
  
  // Step 2: Select resources
  const [resourceScope, setResourceScope] = React.useState<'all' | 'specific'>('specific');
  const [showSpecifyClusters, setShowSpecifyClusters] = React.useState(true);
  const [showIncludeProjects, setShowIncludeProjects] = React.useState(false);
  const [showSpecifyProjects, setShowSpecifyProjects] = React.useState(false);
  const [selectedClusters, setSelectedClusters] = React.useState<number[]>([]);
  const [clusterSearchValue, setClusterSearchValue] = React.useState('');
  const [isClusterFilterOpen, setIsClusterFilterOpen] = React.useState(false);
  const [clusterViewMode, setClusterViewMode] = React.useState<'all' | 'selected'>('all');
  const [projectScope, setProjectScope] = React.useState<'cluster' | 'project'>('cluster');
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [selectedCommonProject, setSelectedCommonProject] = React.useState<number | null>(null);
  const [projectSearchValue, setProjectSearchValue] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectViewMode, setProjectViewMode] = React.useState<'all' | 'selected'>('all');
  
  // Track which substeps have been visited (to keep them visible after step 2)
  const [hasVisitedSpecifyClusters, setHasVisitedSpecifyClusters] = React.useState(true);
  const [hasVisitedIncludeProjects, setHasVisitedIncludeProjects] = React.useState(false);
  const [hasVisitedSpecifyProjects, setHasVisitedSpecifyProjects] = React.useState(false);
  
  // Step 3: Select role
  const [selectedRole, setSelectedRole] = React.useState<number | null>(
    preselectedRole?.id || 1
  );
  const [roleSearchValue, setRoleSearchValue] = React.useState('');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);

  // Track when substeps are shown
  React.useEffect(() => {
    if (showSpecifyClusters) setHasVisitedSpecifyClusters(true);
    if (showIncludeProjects) setHasVisitedIncludeProjects(true);
    if (showSpecifyProjects) setHasVisitedSpecifyProjects(true);
  }, [showSpecifyClusters, showIncludeProjects, showSpecifyProjects]);

  const handleClose = () => {
    setCurrentStep(1);
    setActiveTabKey(0);
    // Reset substep visibility
    setShowSpecifyClusters(true);
    setShowIncludeProjects(false);
    setShowSpecifyProjects(false);
    onClose();
  };
  
  // When moving to step 2 from step 1, ensure we start with "Specify clusters"
  React.useEffect(() => {
    if (currentStep === 2 && resourceScope === 'specific') {
      if (!showSpecifyClusters && !showIncludeProjects && !showSpecifyProjects) {
        setShowSpecifyClusters(true);
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 2 && resourceScope === 'specific') {
      // From "Specify clusters" substep → go to "Include projects" if clusters selected
      if (showSpecifyClusters) {
        if (selectedClusters.length > 0) {
          setShowSpecifyClusters(false);
          setShowIncludeProjects(true);
          return;
        } else {
          // No clusters selected, can't proceed
          return;
        }
      }
      
      // From "Include projects" substep
      if (showIncludeProjects) {
        setShowIncludeProjects(false);
        
        // If "Full access" (cluster scope) → skip project selection, go to next step
        if (projectScope === 'cluster') {
          // Fall through to move to next step
        } else if (projectScope === 'project') {
          // If "Partial access" (project scope) → show project selection
          // Logic: 1 cluster = "Specify projects", >1 cluster = "Specify common projects"
          setShowSpecifyProjects(true);
          return;
        }
      }
      
      // From "Specify projects" or "Specify common projects" substep → go to next step
      if (showSpecifyProjects) {
        // Validate selection based on cluster count
        if (selectedClusters.length === 1) {
          // Multi-select projects - need at least one selected
          if (selectedProjects.length === 0) return;
        } else {
          // Single-select common project - need one selected
          if (selectedCommonProject === null) return;
        }
        setShowSpecifyProjects(false);
        // Fall through to move to next step
      }
    }
    
    // Determine next step based on context
    let nextStep = currentStep + 1;
    
    if (context === 'identities') {
      // Skip step 1 (user/group selection), step 3 (role selection)
      if (currentStep === 2) nextStep = 4; // Go from resources to review
    } else if (context === 'roles') {
      // Skip step 3 (role selection)
      if (currentStep === 2) nextStep = 4; // Go from resources to review
    }
    
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    if (currentStep === 2 && resourceScope === 'specific') {
      // From "Specify common projects" substep → go back to "Include projects"
      if (showSpecifyProjects) {
        setShowSpecifyProjects(false);
        setShowIncludeProjects(true);
        return;
      }
      
      // From "Include projects" substep → go back to "Specify clusters"
      if (showIncludeProjects) {
        setShowIncludeProjects(false);
        setShowSpecifyClusters(true);
        return;
      }
      
      // From "Specify clusters" substep → go back to previous step
      if (showSpecifyClusters) {
        // Fall through to go to previous step
      }
    }
    
    // Determine previous step based on context
    let prevStep = currentStep - 1;
    
    if (context === 'identities') {
      // Skip step 1 (user/group selection), step 3 (role selection)
      if (currentStep === 4) prevStep = 2; // Go from review to resources
    } else if (context === 'roles') {
      // Skip step 3 (role selection)
      if (currentStep === 4) prevStep = 2; // Go from review to resources
    }
    
    setCurrentStep(prevStep);
  };

  const handleFinish = () => {
    console.log('Role assignment created');
    handleClose();
  };

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
    if (tabIndex === 0) {
      setSelectedIdentityType('user');
    } else {
      setSelectedIdentityType('group');
    }
  };

  const toggleClusterSelection = (clusterId: number) => {
    if (selectedClusters.includes(clusterId)) {
      setSelectedClusters(selectedClusters.filter((id) => id !== clusterId));
    } else {
      setSelectedClusters([...selectedClusters, clusterId]);
    }
  };

  const toggleProjectSelection = (projectId: number) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  const filteredClusters = mockClusters
    .filter((cluster) => cluster.name.toLowerCase().includes(clusterSearchValue.toLowerCase()))
    .filter((cluster) => clusterViewMode === 'all' || selectedClusters.includes(cluster.id));

  const filteredProjects = mockProjects
    .filter((project) => project.name.toLowerCase().includes(projectSearchValue.toLowerCase()))
    .filter((project) => {
      // For single cluster (multi-select), use projectViewMode
      if (selectedClusters.length === 1) {
        return projectViewMode === 'all' || selectedProjects.includes(project.id);
      }
      // For multiple clusters (single-select), always show all
      return true;
    });

  const filteredRoles = mockRoles.filter((role) =>
    role.name.toLowerCase().includes(roleSearchValue.toLowerCase())
  );

  const getSelectedIdentityName = () => {
    if (selectedIdentityType === 'user' && selectedUser) {
      return mockUsers.find((u) => u.id === selectedUser)?.name;
    }
    if (selectedIdentityType === 'group' && selectedGroup) {
      return mockGroups.find((g) => g.id === selectedGroup)?.name;
    }
    return '';
  };

  const getSelectedClusterNames = () => {
    return selectedClusters.map((id) => mockClusters.find((c) => c.id === id)?.name).join(', ');
  };

  const getSelectedProjectNames = () => {
    if (selectedClusters.length === 1) {
      // Single cluster - show multiple selected projects
      return selectedProjects.map((id) => mockProjects.find((p) => p.id === id)?.name).join(', ');
    } else {
      // Multiple clusters - show single selected common project
      return selectedCommonProject ? mockProjects.find((p) => p.id === selectedCommonProject)?.name : '';
    }
  };

  const getSelectedRoleName = () => {
    return mockRoles.find((r) => r.id === selectedRole)?.name;
  };

  // Step 1: Select user or group
  const Step1SelectUserOrGroup = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
        Select user, or group you want to grant access to
      </Title>
      <Content component="p" className="pf-v6-u-mb-md">
        Select the user or group you want to grant access to. If you don't see the group you want to select, create a new group in{' '}
        <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
          Groups
        </Button>
        .
      </Content>

      <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Identity type tabs">
        <Tab eventKey={0} title={<TabTitleText>Users</TabTitleText>}>
          <div style={{ paddingTop: '24px' }}>
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
                        variant="plain"
                        onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                        isExpanded={isUserFilterOpen}
                      >
                        <FilterIcon /> Filters
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
                    placeholder="Search"
                    value={userSearchValue}
                    onChange={(_event, value) => setUserSearchValue(value)}
                    onClear={() => setUserSearchValue('')}
                  />
                </ToolbarItem>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={mockUsers.length}
                    perPage={10}
                    page={1}
                    onSetPage={() => {}}
                    widgetId="users-pagination"
                    onPerPageSelect={() => {}}
                    variant={PaginationVariant.top}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            <Table aria-label="Users table" variant="compact">
              <Thead>
                <Tr>
                  <Th />
                  <Th>Name</Th>
                  <Th>Identity provider</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockUsers
                  .filter((user) => user.name.toLowerCase().includes(userSearchValue.toLowerCase()))
                  .map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <Radio
                          isChecked={selectedUser === user.id}
                          name="selected-user"
                          onChange={() => setSelectedUser(user.id)}
                          id={`user-${user.id}`}
                        />
                      </Td>
                      <Td dataLabel="Name">
                        <div>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>{user.username}</div>
                      </Td>
                      <Td dataLabel="Identity provider">{user.provider}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>

            <Toolbar>
              <ToolbarContent>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={mockUsers.length}
                    perPage={10}
                    page={1}
                    onSetPage={() => {}}
                    widgetId="users-bottom-pagination"
                    onPerPageSelect={() => {}}
                    variant={PaginationVariant.bottom}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Groups</TabTitleText>}>
          <div style={{ paddingTop: '24px' }}>
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
                        variant="plain"
                        onClick={() => setIsUserFilterOpen(!isUserFilterOpen)}
                        isExpanded={isUserFilterOpen}
                      >
                        <FilterIcon /> Filters
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="all">All groups</DropdownItem>
                      <DropdownItem key="ldap">LDAP</DropdownItem>
                      <DropdownItem key="local">Local</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search"
                    value={userSearchValue}
                    onChange={(_event, value) => setUserSearchValue(value)}
                    onClear={() => setUserSearchValue('')}
                  />
                </ToolbarItem>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={mockGroups.length}
                    perPage={10}
                    page={1}
                    onSetPage={() => {}}
                    widgetId="groups-pagination"
                    onPerPageSelect={() => {}}
                    variant={PaginationVariant.top}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            <Table aria-label="Groups table" variant="compact">
              <Thead>
                <Tr>
                  <Th />
                  <Th>Name</Th>
                  <Th>Users</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockGroups
                  .filter((group) => group.name.toLowerCase().includes(userSearchValue.toLowerCase()))
                  .map((group) => (
                    <Tr key={group.id}>
                      <Td>
                        <Radio
                          isChecked={selectedGroup === group.id}
                          name="selected-group"
                          onChange={() => setSelectedGroup(group.id)}
                          id={`group-${group.id}`}
                        />
                      </Td>
                      <Td dataLabel="Name">{group.name}</Td>
                      <Td dataLabel="Users">{group.users}</Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>

            <Toolbar>
              <ToolbarContent>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={mockGroups.length}
                    perPage={10}
                    page={1}
                    onSetPage={() => {}}
                    widgetId="groups-bottom-pagination"
                    onPerPageSelect={() => {}}
                    variant={PaginationVariant.bottom}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        </Tab>
      </Tabs>
    </div>
  );

  // Step 2: Select resources
  const Step2SelectResources = () => (
    <div>
      {showSpecifyClusters && (
        <>
          <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
            Specify clusters
          </Title>
          <Content component="p" className="pf-v6-u-mb-md">
            Select clusters to define scope
          </Content>

          <Flex className="pf-v6-u-mb-md">
            <FlexItem>
              <Dropdown
                isOpen={isClusterFilterOpen}
                onSelect={() => setIsClusterFilterOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsClusterFilterOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsClusterFilterOpen(!isClusterFilterOpen)} isExpanded={isClusterFilterOpen}>
                    Filter
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem>All clusters</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
            <FlexItem>
              <SearchInput
                placeholder="Search"
                value={clusterSearchValue}
                onChange={(_event, value) => setClusterSearchValue(value)}
                onClear={() => setClusterSearchValue('')}
              />
            </FlexItem>
            <FlexItem align={{ default: 'alignRight' }}>
              <ToggleGroup aria-label="Cluster view toggle">
                <ToggleGroupItem
                  text="All"
                  buttonId="cluster-view-all"
                  isSelected={clusterViewMode === 'all'}
                  onChange={() => setClusterViewMode('all')}
                />
                <ToggleGroupItem
                  text={`Selected ${selectedClusters.length}`}
                  buttonId="cluster-view-selected"
                  isSelected={clusterViewMode === 'selected'}
                  onChange={() => setClusterViewMode('selected')}
                />
              </ToggleGroup>
            </FlexItem>
          </Flex>

          {clusterSearchValue && (
            <div className="pf-v6-u-mb-sm">
              <Button variant="link" isInline onClick={() => setClusterSearchValue('')}>
                {clusterSearchValue} ✕
              </Button>
              <Button variant="link" isInline onClick={() => setClusterSearchValue('')} className="pf-v6-u-ml-sm">
                Clear filters
              </Button>
            </div>
          )}

          <Table aria-label="Clusters table" variant="compact" className="pf-v6-u-mt-md">
            <Thead>
              <Tr>
                <Th />
                <Th>Name</Th>
                <Th>Infrastructure</Th>
                <Th>Control plane type</Th>
                <Th>Distribution version</Th>
                <Th>Labels</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredClusters.map((cluster) => (
                <Tr key={cluster.id}>
                  <Td
                    select={{
                      rowIndex: cluster.id,
                      onSelect: () => toggleClusterSelection(cluster.id),
                      isSelected: selectedClusters.includes(cluster.id),
                    }}
                  />
                  <Td dataLabel="Name">{cluster.name}</Td>
                  <Td dataLabel="Infrastructure">{cluster.infrastructure}</Td>
                  <Td dataLabel="Control plane type">{cluster.controlPlane}</Td>
                  <Td dataLabel="Distribution version">{cluster.distribution}</Td>
                  <Td dataLabel="Labels">{cluster.labels[0]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      {showIncludeProjects && (
        <>
          <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
            Include projects
          </Title>
          <Content component="p" className="pf-v6-u-mb-md">
            Define project scope on selected clusters
          </Content>

          <Form>
            <FormGroup>
              <Radio
                isChecked={projectScope === 'cluster'}
                name="project-scope"
                onChange={() => setProjectScope('cluster')}
                label="Apply to cluster / Full cluster scope"
                description="Not binds a cluster role to the cluster. It includes all existing and new projects."
                id="radio-cluster-scope"
              />
              <Radio
                isChecked={projectScope === 'project'}
                name="project-scope"
                onChange={() => setProjectScope('project')}
                label="Apply to project(s) / Partial / Project-specific access"
                description="Scope with projects by name to bind a role by."
                id="radio-project-scope"
                className="pf-v6-u-mt-md"
              />
            </FormGroup>
          </Form>
        </>
      )}

      {showSpecifyProjects && (
        <>
          <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-md">
            {selectedClusters.length === 1 ? 'Specify projects' : 'Specify common projects'}
          </Title>
          {selectedClusters.length > 1 && (
            <Content component="p" className="pf-v6-u-mb-md">
              Common projects are projects with the same name across selected clusters. Select one common project.
            </Content>
          )}

          <Flex className="pf-v6-u-mb-md">
            <FlexItem>
              <Dropdown
                isOpen={isProjectFilterOpen}
                onSelect={() => setIsProjectFilterOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsProjectFilterOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsProjectFilterOpen(!isProjectFilterOpen)} isExpanded={isProjectFilterOpen}>
                    Filter
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem>All projects</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
            <FlexItem>
              <SearchInput
                placeholder="Search"
                value={projectSearchValue}
                onChange={(_event, value) => setProjectSearchValue(value)}
                onClear={() => setProjectSearchValue('')}
              />
            </FlexItem>
            {selectedClusters.length === 1 && (
              <FlexItem align={{ default: 'alignRight' }}>
                <ToggleGroup aria-label="Project view toggle">
                  <ToggleGroupItem
                    text="All"
                    buttonId="project-view-all"
                    isSelected={projectViewMode === 'all'}
                    onChange={() => setProjectViewMode('all')}
                  />
                  <ToggleGroupItem
                    text={`Selected ${selectedProjects.length}`}
                    buttonId="project-view-selected"
                    isSelected={projectViewMode === 'selected'}
                    onChange={() => setProjectViewMode('selected')}
                  />
                </ToggleGroup>
              </FlexItem>
            )}
          </Flex>

          <Table aria-label="Projects table" variant="compact" className="pf-v6-u-mt-md">
            <Thead>
              <Tr>
                <Th />
                <Th>Project</Th>
                <Th>Cluster</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProjects.map((project) => (
                <Tr key={project.id}>
                  {selectedClusters.length === 1 ? (
                    // Multi-select with checkboxes for single cluster
                    <Td
                      select={{
                        rowIndex: project.id,
                        onSelect: () => toggleProjectSelection(project.id),
                        isSelected: selectedProjects.includes(project.id),
                      }}
                    />
                  ) : (
                    // Single-select with radio buttons for multiple clusters
                    <Td>
                      <Radio
                        isChecked={selectedCommonProject === project.id}
                        name="selected-common-project"
                        onChange={() => setSelectedCommonProject(project.id)}
                        id={`common-project-${project.id}`}
                      />
                    </Td>
                  )}
                  <Td dataLabel="Project">{project.name}</Td>
                  <Td dataLabel="Cluster">{project.clusters}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </div>
  );

  // Step 3: Select role
  const Step3SelectRole = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-sm">
        Select role
      </Title>
      <Content component="p" className="pf-v6-u-mb-md">
        Select one role to assign.{' '}
        <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
          Roles
        </Button>
      </Content>

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
                  variant="plain"
                  onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                  isExpanded={isRoleFilterOpen}
                >
                  <FilterIcon /> Filters
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="all">All roles</DropdownItem>
                <DropdownItem key="kubevirt">kubevirt.io</DropdownItem>
                <DropdownItem key="admin">Admin roles</DropdownItem>
                <DropdownItem key="viewer">Viewer roles</DropdownItem>
                <DropdownItem key="editor">Editor roles</DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem>
            <SearchInput
              placeholder="Search"
              value={roleSearchValue}
              onChange={(_event, value) => setRoleSearchValue(value)}
              onClear={() => setRoleSearchValue('')}
            />
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filteredRoles.length}
              perPage={10}
              page={1}
              onSetPage={() => {}}
              widgetId="roles-pagination"
              onPerPageSelect={() => {}}
              variant={PaginationVariant.top}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Roles table" variant="compact">
        <Thead>
          <Tr>
            <Th />
            <Th>Role</Th>
            <Th>Description</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredRoles.map((role) => (
            <Tr key={role.id}>
              <Td>
                <Radio
                  isChecked={selectedRole === role.id}
                  name="selected-role"
                  onChange={() => setSelectedRole(role.id)}
                  id={`role-${role.id}`}
                />
              </Td>
              <Td dataLabel="Role">
                <div>{role.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>{role.type}</div>
              </Td>
              <Td dataLabel="Description">
                <strong>{role.description.split(':')[0]}:</strong>
                {role.description.split(':')[1]}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={filteredRoles.length}
              perPage={10}
              page={1}
              onSetPage={() => {}}
              widgetId="roles-bottom-pagination"
              onPerPageSelect={() => {}}
              variant={PaginationVariant.bottom}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    </div>
  );

  // Step 4: Review
  const Step4Review = () => (
    <div>
      <Title headingLevel="h2" size="xl" className="pf-v6-u-mb-lg">
        Review
      </Title>

      <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '1rem', marginBottom: '1rem' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h3" size="md">Select user or group</Title>
          </FlexItem>
          <FlexItem>
            <Button variant="link" onClick={() => setCurrentStep(1)} isInline>
              Edit step
            </Button>
          </FlexItem>
        </Flex>
        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
          <div><strong>{selectedIdentityType === 'user' ? 'User' : 'Group'}</strong></div>
          <div>{getSelectedIdentityName()}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '1rem', marginBottom: '1rem' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h3" size="md">Select resources</Title>
          </FlexItem>
          <FlexItem>
            <Button variant="link" onClick={() => { setCurrentStep(2); setShowSpecifyClusters(true); setShowIncludeProjects(false); setShowSpecifyProjects(false); }} isInline>
              Edit step
            </Button>
          </FlexItem>
        </Flex>
        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Select resources</strong>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>Assign to specific</div>
          
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Specify clusters</strong>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>{getSelectedClusterNames()}</div>
          
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Include projects</strong>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>Common projects</div>
          
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Projects</strong>
          </div>
          <div>{getSelectedProjectNames()}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '1rem', marginBottom: '1rem' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h3" size="md">Select role</Title>
          </FlexItem>
          <FlexItem>
            <Button variant="link" onClick={() => setCurrentStep(3)} isInline>
              Edit step
            </Button>
          </FlexItem>
        </Flex>
        <div style={{ marginLeft: '2rem', marginTop: '0.5rem' }}>
          <div><strong>Role</strong></div>
          <div>{getSelectedRoleName()}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '1rem' }}>
        <Title headingLevel="h3" size="md">YAML</Title>
      </div>
    </div>
  );

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        if (context === 'identities') {
          return <Step2SelectResources />; // Skip user/group selection
        }
        return <Step1SelectUserOrGroup />;
      case 2:
        if (context === 'identities') {
          return <Step4Review />; // Skip role selection, go to review
        }
        return <Step2SelectResources />;
      case 3:
        if (context === 'roles') {
          return <Step4Review />; // Skip role selection
        }
        return <Step3SelectRole />;
      case 4:
        return <Step4Review />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    if (currentStep === 2) {
      if (showSpecifyClusters) return 'Specify clusters';
      if (showIncludeProjects) return 'Include projects';
      if (showSpecifyProjects) return 'Specify common projects';
      return 'Select resources';
    }
    
    // Adjust titles based on context
    if (context === 'identities') {
      const titles = ['', 'Select resources', 'Review'];
      return titles[currentStep] || '';
    } else if (context === 'roles') {
      const titles = ['', 'Select user or group', 'Select resources', 'Review'];
      return titles[currentStep] || '';
    }
    
    const titles = ['', 'Select user or group', 'Select resources', 'Select role', 'Review'];
    return titles[currentStep];
  };

  const renderStepIndicator = (stepNum: number, label: string, isSubStep: boolean = false, showConnector: boolean = true) => {
    const isActive = currentStep === stepNum;
    const isCompleted = currentStep > stepNum;
    
    // Render substeps without circles
    if (isSubStep) {
      // Check if this substep is currently active
      const isSubStepActive = currentStep === 2 && (
        (label === 'Specify clusters' && showSpecifyClusters) ||
        (label === 'Include projects' && showIncludeProjects) ||
        ((label === 'Specify common projects' || label === 'Specify projects') && showSpecifyProjects)
      );
      
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
    
    // Check if this step has substeps (step 2 has expandable substeps)
    const hasSubsteps = stepNum === 2;
    
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
              {hasSubsteps && isActive && (
                <CaretDownIcon style={{ fontSize: '12px', color: '#151515' }} />
              )}
            </div>
          </FlexItem>
        </Flex>
      </div>
    );
  };

  const isNextButtonDisabled = () => {
    // Step 1: Select user or group
    if (currentStep === 1) {
      if (selectedIdentityType === 'user') {
        return selectedUser === null;
      } else {
        return selectedGroup === null;
      }
    }
    
    // Step 2: Select resources
    if (currentStep === 2) {
      // If in "Specify clusters" substep
      if (showSpecifyClusters) {
        return selectedClusters.length === 0;
      }
      
      // If in "Include projects" substep, can always proceed
      if (showIncludeProjects) {
        return false;
      }
      
      // If in "Specify projects" substep
      if (showSpecifyProjects) {
        if (selectedClusters.length === 1) {
          // Multi-select projects - need at least one
          return selectedProjects.length === 0;
        } else {
          // Single-select common project - need one selected
          return selectedCommonProject === null;
        }
      }
      
      return false;
    }
    
    // Step 3: Select role
    if (currentStep === 3) {
      return selectedRole === null;
    }
    
    return false;
  };

    return (
      <Modal
        variant={ModalVariant.large}
        isOpen={isOpen}
        onClose={handleClose}
        aria-labelledby="role-assignment-wizard-title"
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
            <Title headingLevel="h1" size="2xl" id="role-assignment-wizard-title">
              {`Create role assignment${clusterName ? ` for ${clusterName}` : ''}`}
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
              {context === 'identities' ? (
                // Identities context: Skip user/group selection, skip role selection
                <>
                  {renderStepIndicator(1, 'Select resources', false, true)}
                  {(hasVisitedSpecifyClusters || (currentStep === 1 && showSpecifyClusters)) && renderStepIndicator(1, 'Specify clusters', true, true)}
                  {(hasVisitedIncludeProjects || (currentStep === 1 && showIncludeProjects)) && renderStepIndicator(1, 'Include projects', true, true)}
                  {(hasVisitedSpecifyProjects || (currentStep === 1 && showSpecifyProjects)) && renderStepIndicator(1, selectedClusters.length === 1 ? 'Specify projects' : 'Specify common projects', true, false)}
                  {renderStepIndicator(2, 'Review', false, false)}
                </>
              ) : context === 'roles' ? (
                // Roles context: Skip role selection
                <>
                  {renderStepIndicator(1, 'Select user or group', false, true)}
                  {renderStepIndicator(2, 'Select resources', false, true)}
                  {(hasVisitedSpecifyClusters || (currentStep === 2 && showSpecifyClusters)) && renderStepIndicator(2, 'Specify clusters', true, true)}
                  {(hasVisitedIncludeProjects || (currentStep === 2 && showIncludeProjects)) && renderStepIndicator(2, 'Include projects', true, true)}
                  {(hasVisitedSpecifyProjects || (currentStep === 2 && showSpecifyProjects)) && renderStepIndicator(2, selectedClusters.length === 1 ? 'Specify projects' : 'Specify common projects', true, false)}
                  {renderStepIndicator(3, 'Review', false, false)}
                </>
              ) : (
                // Default clusters context: Show all steps
                <>
                  {renderStepIndicator(1, 'Select user or group', false, true)}
                  {renderStepIndicator(2, 'Select resources', false, true)}
                  {(hasVisitedSpecifyClusters || (currentStep === 2 && showSpecifyClusters)) && renderStepIndicator(2, 'Specify clusters', true, true)}
                  {(hasVisitedIncludeProjects || (currentStep === 2 && showIncludeProjects)) && renderStepIndicator(2, 'Include projects', true, true)}
                  {(hasVisitedSpecifyProjects || (currentStep === 2 && showSpecifyProjects)) && renderStepIndicator(2, selectedClusters.length === 1 ? 'Specify projects' : 'Specify common projects', true, false)}
                  {renderStepIndicator(3, 'Select role', false, true)}
                  {renderStepIndicator(4, 'Review', false, false)}
                </>
              )}
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
                padding: '1.5rem', 
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}>
                {getCurrentStepContent()}
              </div>
              
              {/* Footer with Buttons - only spans right content area */}
              <div style={{ 
                borderTop: '1px solid #d2d2d2', 
                padding: '1rem 1.5rem', 
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}>
                {((context === 'identities' && currentStep > 1) || 
                  (context === 'roles' && currentStep > 1) || 
                  (context === 'clusters' && currentStep > 1)) && (
                  <Button variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                )}{' '}
                {((context === 'identities' && currentStep < 2) || 
                  (context === 'roles' && currentStep < 3) || 
                  (context === 'clusters' && currentStep < 4)) ? (
                  <Button variant="primary" onClick={handleNext} isDisabled={isNextButtonDisabled()}>
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

export { RoleAssignmentWizard };
