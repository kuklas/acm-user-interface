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
  Split,
  SplitItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CaretDownIcon, CheckCircleIcon, AngleLeftIcon, AngleRightIcon, ResourcesEmptyIcon, TimesIcon, FilterIcon, SyncAltIcon } from '@patternfly/react-icons';
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
  created: new Date(user.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}));

const mockGroups = dbGroups.map((group, index) => {
  // Determine sync source and last synced (same logic as GroupsTable)
  const isLocal = group.name === 'local-admins' || group.name === 'test-group' || index % 7 === 0;
  const syncSources = ['PeteMobile LDAP', 'PeteMobile SSO', 'GitHub Enterprise'];
  const syncSource = isLocal ? 'Local' : syncSources[index % syncSources.length];
  const syncTimes = ['2 hours ago', '5 hours ago', '1 day ago', '3 days ago', 'Yesterday'];
  const lastSynced = isLocal ? null : syncTimes[index % syncTimes.length];
  
  return {
    id: index + 1,
    dbId: group.id,
    name: group.name,
    users: group.userIds.length,
    syncSource,
    lastSynced,
    created: '2024-01-15',
  };
});

// Map category to display category (plugin/source)
const getCategoryDisplay = (category: string): string => {
  switch (category) {
    case 'kubevirt':
      return 'Virtualization';
    case 'cluster':
      return 'OpenShift Cluster Management';
    case 'namespace':
      return 'OpenShift Namespace Management';
    case 'application':
      return 'Application Management';
    default:
      return 'OpenShift';
  }
};

const mockRoles = dbRoles.map((role, index) => ({
  id: index + 1,
  name: role.name,
  displayName: role.displayName,
  type: role.type === 'default' ? 'Default' : 'Custom',
  category: getCategoryDisplay(role.category),
  description: role.description,
  resources: role.category === 'kubevirt' 
    ? ['VirtualMachines', 'VirtualMachineInstances'] 
    : role.category === 'cluster' 
    ? ['Clusters', 'ClusterSets'] 
    : role.category === 'namespace'
    ? ['Namespaces', 'Projects']
    : ['Applications', 'Deployments'],
  permissions: role.permissions,
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
  
  // Drawer for examples
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  
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
  
  // Step 2: Resources - simplified inline structure
  const [resourceScope, setResourceScope] = React.useState<'all' | 'clusters'>('all');
  const [selectedClusters, setSelectedClusters] = React.useState<number[]>([]);
  const [clusterSearch, setClusterSearch] = React.useState('');
  const [isClusterFilterOpen, setIsClusterFilterOpen] = React.useState(false);
  const [clusterFilterType, setClusterFilterType] = React.useState('Name');
  const [isResourceScopeOpen, setIsResourceScopeOpen] = React.useState(false);
  const [clustersPage, setClustersPage] = React.useState(1);
  const [clustersPerPage, setClustersPerPage] = React.useState(10);
  
  // Substep: Access level for selected clusters (only shown when clusters are selected)
  const [showAccessLevel, setShowAccessLevel] = React.useState(false);
  const [clusterScope, setClusterScope] = React.useState<'everything' | 'projects'>('everything');
  const [isClusterScopeOpen, setIsClusterScopeOpen] = React.useState(false);
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectFilterType, setProjectFilterType] = React.useState('Name');
  
  // Step 3: Role
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);
  const [roleSearch, setRoleSearch] = React.useState('');
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);
  const [roleFilterType, setRoleFilterType] = React.useState('All');
  const [rolesPage, setRolesPage] = React.useState(1);
  const [rolesPerPage, setRolesPerPage] = React.useState(10);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState('All');
  
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
    setExampleIndex(0);
    setIsDrawerExpanded(false);
    setSelectedUser(null);
    setSelectedGroup(null);
    setUserSearch('');
    setGroupSearch('');
    setResourceScope('all');
    setSelectedClusters([]);
    setClusterSearch('');
    setIsResourceScopeOpen(false);
    setClustersPage(1);
    setClustersPerPage(10);
    setShowAccessLevel(false);
    setClusterScope('everything');
    setIsClusterScopeOpen(false);
    setSelectedProjects([]);
    setProjectSearch('');
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
    if (currentStep === 2) {
      // Handle Step 2 substep navigation
      if (resourceScope === 'clusters' && selectedClusters.length > 0 && !showAccessLevel) {
        // Show access level substep
        setShowAccessLevel(true);
        return;
      }
      // Otherwise proceed to next step
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      return;
    }
    if (currentStep === 2 && showAccessLevel) {
      // Go back from access level substep to cluster selection
      setShowAccessLevel(false);
      setClusterScope('everything');
      setSelectedProjects([]);
      return;
    }
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = () => {
    const identityType = activeTabKey === 0 ? 'user' : 'group';
    const identityId = activeTabKey === 0 ? selectedUser : selectedGroup;
    const identityName = activeTabKey === 0 
      ? mockUsers.find(u => u.id === selectedUser)?.name || 'Unknown'
      : mockGroups.find(g => g.id === selectedGroup)?.name || 'Unknown';
    
    const roleData = mockRoles.find(r => r.id === selectedRole);
    const roleName = roleData?.name || 'Unknown';
    const roleDisplayName = roleData?.displayName || roleName;

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
      if (!showAccessLevel) {
        // Initial resource selection: if clusters selected, need at least one cluster
        if (resourceScope === 'clusters' && selectedClusters.length === 0) {
          return true;
        }
        return false;
      } else {
        // Access level substep: if projects selected, need at least one project
        if (clusterScope === 'projects' && selectedProjects.length === 0) {
          return true;
        }
        return false;
      }
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

  // Get unique categories for filter
  const uniqueCategories = React.useMemo(() => {
    const categories = Array.from(new Set(mockRoles.map(role => role.category)));
    return ['All', ...categories.sort()];
  }, []);

  const filteredRoles = mockRoles.filter(role => {
    // Filter by search (search both displayName and technical name)
    const matchesSearch = role.displayName.toLowerCase().includes(roleSearch.toLowerCase()) ||
                          role.name.toLowerCase().includes(roleSearch.toLowerCase());
    
    // Filter by type
    const matchesType = roleFilterType === 'All' || role.type === roleFilterType;
    
    // Filter by category
    const matchesCategory = categoryFilter === 'All' || role.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
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
      
      // SINGLE CLUSTER: Show ALL projects from that cluster
      // MULTIPLE CLUSTERS: Show ONLY common projects (projects with same name across ALL selected clusters)
      // Group as single entry with clusters column
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
        const commonProjectGroups = Array.from(projectsByName.entries())
          .filter(([_, projs]) => projs.length === selectedClusters.length)
          .map(([name, projs]) => ({
            ...projs[0], // Use first project as base
            clusterNames: projs.map(p => p.clusterName).join(', '), // Combine cluster names
          }));
        
        // Return grouped common projects
        projects = commonProjectGroups as any;
      }
    }
    
    // Filter by search
    if (projectSearch) {
      projects = projects.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()));
    }
    
    return projects;
  }, [selectedClusters, projectSearch, mockProjects, mockClusters]);

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
      <div style={{ position: 'relative', height: '100%' }}>
        {/* Overlay Drawer Panel */}
        {isDrawerExpanded && (
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '500px',
              maxWidth: '50%',
              height: '100%',
              backgroundColor: 'white',
              zIndex: 1000,
              boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
              overflow: 'auto'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #d2d2d2'
            }}>
              <Title headingLevel="h3" size="xl">
                Example scopes
              </Title>
              <Button 
                variant="plain" 
                onClick={() => setIsDrawerExpanded(false)}
                aria-label="Close drawer"
              >
                <TimesIcon />
              </Button>
            </div>
            <div style={{ padding: '16px' }}>
              <Content component="p" style={{ marginBottom: '16px', fontSize: '14px', color: '#6a6e73' }}>
                These examples show different ways to scope role assignments.
              </Content>
              {/* Carousel navigation */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Button 
                  variant="plain" 
                  onClick={() => setExampleIndex(Math.max(0, exampleIndex - 1))}
                  isDisabled={exampleIndex === 0}
                  aria-label="Previous example"
                >
                  <AngleLeftIcon />
                </Button>
                <span style={{ fontSize: '14px', color: '#6a6e73' }}>
                  Example {exampleIndex + 1} of 4
                </span>
                <Button 
                  variant="plain" 
                  onClick={() => setExampleIndex(Math.min(3, exampleIndex + 1))}
                  isDisabled={exampleIndex === 3}
                  aria-label="Next example"
                >
                  <AngleRightIcon />
                </Button>
              </div>
              {/* Example content - tree view */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '6px',
                border: '1px solid #d2d2d2',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {exampleIndex === 0 && (
                  <>
                    <Content component="p" style={{ fontSize: '13px', marginBottom: '12px', color: '#151515', fontWeight: 600 }}>
                      Example scope: Full cluster set access
                    </Content>
                    <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                      {/* Cluster Set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Cluster set</span>
                      </div>
                      
                      {/* Cluster 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 on Cluster 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 on Cluster 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 3 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 4 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 on Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 5 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 6 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 on Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 7 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 8 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                    </div>
                  </>
                )}
                
                {exampleIndex === 1 && (
                  <>
                    <Content component="p" style={{ fontSize: '13px', marginBottom: '12px', color: '#151515', fontWeight: 600 }}>
                      Example scope: Specific clusters access
                    </Content>
                    <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                      {/* Cluster Set (not fully selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set: {clusterSetName}</span>
                      </div>
                      
                      {/* Cluster 1 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 on Cluster 1 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Project</span>
                      </div>
                      
                      {/* VMs under Project 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 on Cluster 1 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#6a6e73' }}>Cluster</span>
                      </div>
                    </div>
                  </>
                )}
                
                {exampleIndex === 2 && (
                  <>
                    <Content component="p" style={{ fontSize: '13px', marginBottom: '12px', color: '#151515', fontWeight: 600 }}>
                      Example scope: Project-level access
                    </Content>
                    <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                      {/* Cluster Set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set: {clusterSetName}</span>
                      </div>
                      
                      {/* Cluster 1 (partially selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Project</span>
                      </div>
                      
                      {/* VMs under Project 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Project 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#6a6e73' }}>Project</span>
                      </div>
                      
                      {/* Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#6a6e73' }}>Cluster</span>
                      </div>
                    </div>
                  </>
                )}
                
                {exampleIndex === 3 && (
                  <>
                    <Content component="p" style={{ fontSize: '13px', marginBottom: '12px', color: '#151515', fontWeight: 600 }}>
                      Example scope: Common projects across multiple clusters
                    </Content>
                    <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                      {/* Cluster Set */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set: {clusterSetName}</span>
                      </div>
                      
                      {/* Cluster 1 (partially selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Common Project "monitoring" on Cluster 1 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Common project</span>
                      </div>
                      
                      {/* VMs under monitoring on Cluster 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '10px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Other Project on Cluster 1 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#6a6e73' }}>Project</span>
                      </div>
                      
                      {/* Cluster 2 (partially selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Common Project "monitoring" on Cluster 2 (selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600 }}>Common project</span>
                      </div>
                      
                      {/* VMs under monitoring on Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative', backgroundColor: '#E7F1FA', padding: '2px 4px', marginLeft: '-4px', borderRadius: '4px' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '30px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '50px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Other Project on Cluster 2 (not selected) */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#6a6e73' }}>Project</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Main wizard content */}
        <div style={{ height: '100%' }}>
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
            {currentStep === 2 && showAccessLevel && (
              <div style={{ marginLeft: '3.5rem', marginTop: '0', marginBottom: '0.5rem' }}>
                <div style={{ 
                  padding: '0.5rem 0.75rem',
                  fontSize: '14px',
                  color: '#151515',
                  cursor: 'default',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  fontWeight: '600'
                }}>
                  Choose access level
                </div>
              </div>
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
                            appendTo: () => document.body
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
                        <Th>Created</Th>
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
                            <Button 
                              variant="link" 
                              isInline 
                              component="a" 
                              href={`#/user-management/identities/${encodeURIComponent(user.username)}`}
                              target="_blank"
                              style={{ padding: 0, fontSize: 'inherit', fontWeight: selectedUser === user.id ? '600' : 'normal' }}
                            >
                              {user.name}
                            </Button>
                            <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                              {user.username}
                            </div>
                          </Td>
                          <Td dataLabel="Identity provider">{user.provider}</Td>
                          <Td dataLabel="Created">{user.created}</Td>
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
                            appendTo: () => document.body
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
                        <Th width={20}>Group</Th>
                        <Th width={15}>Members</Th>
                        <Th width={20}>Sync Source</Th>
                        <Th width={20}>Last Synced</Th>
                        <Th width={15}>Created</Th>
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
                          <Td dataLabel="Group" width={20}>
                            <Button 
                              variant="link" 
                              isInline 
                              component="a" 
                              href={`#/user-management/identities/groups/${encodeURIComponent(group.name)}`}
                              target="_blank"
                              style={{ padding: 0, fontSize: 'inherit', fontWeight: selectedGroup === group.id ? '600' : 'normal' }}
                            >
                              {group.name}
                            </Button>
                          </Td>
                          <Td dataLabel="Members" width={15}>{group.users}</Td>
                          <Td dataLabel="Sync Source" width={20}>
                            {group.syncSource === 'Local' ? (
                              <Label color="grey">{group.syncSource}</Label>
                            ) : (
                              <Label color="blue" icon={<SyncAltIcon />}>{group.syncSource}</Label>
                            )}
                          </Td>
                          <Td dataLabel="Last Synced" width={20}>
                            {group.lastSynced ? (
                              <span>{group.lastSynced}</span>
                            ) : (
                              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                            )}
                          </Td>
                          <Td dataLabel="Created" width={15}>{group.created}</Td>
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
            {!showAccessLevel ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Title headingLevel="h2" size="xl" style={{ margin: 0 }}>
                    Select resources
                  </Title>
                  <Button 
                    variant="link" 
                    onClick={() => setIsDrawerExpanded(true)}
                    style={{ padding: 0 }}
                  >
                    View examples
                  </Button>
                </div>
                <Content component="p" style={{ marginBottom: '16px', color: '#6a6e73', fontSize: '14px' }}>
                  Define the scope of access by selecting which resources this role will apply to.
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
                      {resourceScope === 'all' ? 'Cluster set role assignment' : 'Cluster role assignment'}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>
                    <DropdownItem
                      key="all"
                      onClick={() => {
                        setResourceScope('all');
                        setSelectedClusters([]);
                        setSelectedProjects([]);
                        setIsResourceScopeOpen(false);
                      }}
                      description="Grant access to all current and future resources on the cluster set."
                    >
                      Cluster set role assignment
                    </DropdownItem>
                    <DropdownItem
                      key="clusters"
                      onClick={() => {
                        setResourceScope('clusters');
                        setSelectedClusters([]);
                        setSelectedProjects([]);
                        setIsResourceScopeOpen(false);
                      }}
                      description="Grant access to specific clusters on the cluster set. Optionally, narrow this access to projects on the selected clusters."
                    >
                      Cluster role assignment
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>

                {/* Show clusters table inline when "Cluster role assignment" is selected */}
                {resourceScope === 'clusters' && (
                  <div style={{ marginTop: '24px' }}>
                    <Toolbar>
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
                              >
                                <span style={{ marginRight: '8px' }}>Filter:</span> {clusterFilterType}
                              </MenuToggle>
                            )}
                            shouldFocusToggleOnSelect
                          >
                            <DropdownList>
                              <DropdownItem key="Name" onClick={() => { setClusterFilterType('Name'); setIsClusterFilterOpen(false); }}>Name</DropdownItem>
                              <DropdownItem key="Status" onClick={() => { setClusterFilterType('Status'); setIsClusterFilterOpen(false); }}>Status</DropdownItem>
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
                        <ToolbarItem align={{ default: 'alignEnd' }}>
                          <Pagination
                            itemCount={filteredClusters.length}
                            perPage={clustersPerPage}
                            page={clustersPage}
                            onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                            onPerPageSelect={(_event, newPerPage) => {
                              setClustersPerPage(newPerPage);
                              setClustersPage(1);
                            }}
                            variant="top"
                            isCompact
                          />
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>

                    <Table aria-label="Clusters table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th />
                          <Th>Name</Th>
                          <Th>Status</Th>
                          <Th>Infrastructure</Th>
                          <Th>Control plane</Th>
                          <Th>Nodes</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredClusters.slice((clustersPage - 1) * clustersPerPage, clustersPage * clustersPerPage).map((cluster, index) => {
                          const isSelected = selectedClusters.includes(cluster.id);
                          return (
                            <Tr
                              key={index}
                              isSelectable
                              isClickable
                              isRowSelected={isSelected}
                              onRowClick={() => {
                                if (isSelected) {
                                  setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                                } else {
                                  setSelectedClusters([...selectedClusters, cluster.id]);
                                }
                              }}
                            >
                              <Td
                                select={{
                                  rowIndex: index,
                                  onSelect: (_event, isSelecting) => {
                                    if (isSelecting) {
                                      setSelectedClusters([...selectedClusters, cluster.id]);
                                    } else {
                                      setSelectedClusters(selectedClusters.filter(id => id !== cluster.id));
                                    }
                                  },
                                  isSelected,
                                }}
                              />
                              <Td dataLabel="Name">
                                <a 
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open(`${window.location.origin}${window.location.pathname}#/infrastructure/clusters/${encodeURIComponent(cluster.name)}`, '_blank');
                                  }}
                                  style={{ 
                                    color: 'var(--pf-t--global--color--brand--default)',
                                    textDecoration: 'none',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                  {cluster.name}
                                </a>
                              </Td>
                              <Td dataLabel="Status">
                                <Label color={cluster.status === 'Ready' ? 'green' : 'red'} isCompact>
                                  {cluster.status}
                                </Label>
                              </Td>
                              <Td dataLabel="Infrastructure">{cluster.infrastructure}</Td>
                              <Td dataLabel="Control plane">{cluster.controlPlaneType}</Td>
                              <Td dataLabel="Nodes">{cluster.nodes}</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>

                    <Pagination
                      itemCount={filteredClusters.length}
                      perPage={clustersPerPage}
                      page={clustersPage}
                      onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                      onPerPageSelect={(_event, newPerPage) => {
                        setClustersPerPage(newPerPage);
                        setClustersPage(1);
                      }}
                      variant="bottom"
                      style={{ paddingTop: '16px' }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                 {/* Substep: Choose access level */}
                 <Title headingLevel="h2" size="xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                   Choose access level
                 </Title>
                 <Content component="p" style={{ marginBottom: '16px', color: '#6a6e73', fontSize: '14px' }}>
                   {selectedClusters.length > 1 
                     ? 'Define whether you want full access or partial access to common projects across the selected clusters.'
                     : 'Define whether you want full access or partial access to specific projects on the selected cluster.'}
                 </Content>

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
                       style={{ width: '100%', marginBottom: '16px' }}
                     >
                       {clusterScope === 'everything' 
                         ? 'Full access to selected clusters' 
                         : selectedClusters.length > 1 
                           ? 'Limit to common projects' 
                           : 'Limit to specific projects'}
                     </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>
                    <DropdownItem
                      key="everything"
                      onClick={() => {
                        setClusterScope('everything');
                        setSelectedProjects([]);
                        setIsClusterScopeOpen(false);
                      }}
                      description="Grants access to all current and future resources in the selected clusters"
                    >
                      Full access to selected clusters
                    </DropdownItem>
                    <DropdownItem
                      key="projects"
                      onClick={() => {
                        setClusterScope('projects');
                        setIsClusterScopeOpen(false);
                      }}
                      description={selectedClusters.length > 1 
                        ? "Choose common projects (same name across all selected clusters)" 
                        : "Choose specific projects to limit the scope of access"}
                    >
                      {selectedClusters.length > 1 ? 'Limit to common projects' : 'Limit to specific projects'}
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>

                {/* Show projects table if "Limit to specific projects" is selected */}
                {clusterScope === 'projects' && (
                  <div style={{ marginTop: '16px' }}>
                    {/* Note alert for multiple clusters */}
                    {selectedClusters.length > 1 && (
                      <Alert
                        variant="info"
                        isInline
                        title={`Note: ${filteredProjects.length === 0 ? 'No' : filteredProjects.length} common project${filteredProjects.length === 1 ? '' : 's'} found across all ${selectedClusters.length} selected clusters.`}
                        style={{ marginBottom: '16px' }}
                      />
                    )}
                    
                    {/* Toolbar with Name dropdown and Search */}
                    <Toolbar style={{ padding: 0, marginBottom: '8px' }}>
                      <ToolbarContent style={{ padding: 0 }}>
                        <ToolbarItem>
                          <Dropdown
                            isOpen={false}
                            onSelect={() => {}}
                            toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => {}}
                                isExpanded={false}
                                style={{ width: '150px' }}
                              >
                                Name
                              </MenuToggle>
                            )}
                          >
                            <DropdownList>
                              <DropdownItem key="name">Name</DropdownItem>
                            </DropdownList>
                          </Dropdown>
                        </ToolbarItem>
                        <ToolbarItem>
                          <SearchInput
                            placeholder="Search projects"
                            value={projectSearch}
                            onChange={(_event, value) => setProjectSearch(value)}
                            onClear={() => setProjectSearch('')}
                            style={{ width: '300px' }}
                          />
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>
                    
                    <Table aria-label="Projects table" variant="compact">
                      <Thead>
                        <Tr>
                          <Th />
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>{selectedClusters.length > 1 ? 'Clusters' : 'Cluster'}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredProjects.length === 0 ? (
                          <Tr>
                            <Td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                              <Content>
                                {selectedClusters.length > 1 
                                  ? 'No common projects found across the selected clusters.'
                                  : 'No projects found.'}
                              </Content>
                            </Td>
                          </Tr>
                        ) : (
                          filteredProjects.map((project, index) => {
                            const isSelected = selectedProjects.includes(project.id);
                            return (
                              <Tr
                                key={index}
                                isSelectable
                                isClickable
                                isRowSelected={isSelected}
                                onRowClick={() => {
                                  if (isSelected) {
                                    setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                  } else {
                                    setSelectedProjects([...selectedProjects, project.id]);
                                  }
                                }}
                              >
                                <Td
                                  select={{
                                    rowIndex: index,
                                    onSelect: (_event, isSelecting) => {
                                      if (isSelecting) {
                                        setSelectedProjects([...selectedProjects, project.id]);
                                      } else {
                                        setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                                      }
                                    },
                                    isSelected,
                                  }}
                                />
                                <Td dataLabel="Name">{project.displayName}</Td>
                                <Td dataLabel="Type">
                                  <Label isCompact>{project.type}</Label>
                                </Td>
                                <Td dataLabel="Cluster">{selectedClusters.length > 1 ? (project as any).clusterNames : project.clusterName}</Td>
                              </Tr>
                            );
                          })
                        )}
                      </Tbody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Step 3: Select Role */}
        {currentStep === 3 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '8px' }}>
              Select role
            </Title>
            <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)', color: '#6a6e73' }}>
              Choose a role to assign. Need a custom role?{' '}
              <Button 
                variant="link" 
                isInline 
                component="a" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.open(`${window.location.origin}${window.location.pathname}#/user-management/roles/create`, '_blank');
                }}
              >
                Create one here
              </Button>{' '}
              and return to this workflow.
            </Content>
            
            <Toolbar style={{ flexWrap: 'nowrap' }}>
              <ToolbarContent style={{ flexWrap: 'nowrap' }}>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isCategoryFilterOpen}
                    onSelect={() => setIsCategoryFilterOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsCategoryFilterOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)} 
                        isExpanded={isCategoryFilterOpen}
                        variant="default"
                        icon={<FilterIcon />}
                      >
                        {categoryFilter === 'All' ? 'Category' : categoryFilter}
                      </MenuToggle>
                    )}
                    popperProps={{
                      appendTo: () => document.body
                    }}
                  >
                    <DropdownList>
                      {uniqueCategories.map(category => (
                        <DropdownItem 
                          key={category}
                          onClick={() => { 
                            setCategoryFilter(category); 
                            setIsCategoryFilterOpen(false);
                            setRolesPage(1);
                          }}
                        >
                          {category}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem style={{ minWidth: '180px', maxWidth: '240px' }}>
                  <SearchInput
                    placeholder="Search roles"
                    value={roleSearch}
                    onChange={(_event, value) => setRoleSearch(value)}
                    onClear={() => setRoleSearch('')}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <ToggleGroup aria-label="Role type filter">
                    <ToggleGroupItem
                      text="All"
                      isSelected={roleFilterType === 'All'}
                      onChange={() => {
                        setRoleFilterType('All');
                        setRolesPage(1);
                      }}
                    />
                    <ToggleGroupItem
                      text="Default"
                      isSelected={roleFilterType === 'Default'}
                      onChange={() => {
                        setRoleFilterType('Default');
                        setRolesPage(1);
                      }}
                    />
                    <ToggleGroupItem
                      text="Custom"
                      isSelected={roleFilterType === 'Custom'}
                      onChange={() => {
                        setRoleFilterType('Custom');
                        setRolesPage(1);
                      }}
                    />
                  </ToggleGroup>
                </ToolbarItem>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={filteredRoles.length}
                    perPage={rolesPerPage}
                    page={rolesPage}
                    onSetPage={(_event, pageNumber) => setRolesPage(pageNumber)}
                    onPerPageSelect={(_event, perPage) => {
                      setRolesPerPage(perPage);
                      setRolesPage(1);
                    }}
                    variant={PaginationVariant.top}
                    isCompact
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="Roles table" variant="compact" style={{ tableLayout: 'fixed', width: '100%' }}>
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th width={25}>Role</Th>
                  <Th width={35}>Description</Th>
                  <Th width={20}>Category</Th>
                  <Th width={10}>Type</Th>
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
                          <a 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(`${window.location.origin}${window.location.pathname}#/user-management/roles/${encodeURIComponent(role.name)}`, '_blank');
                            }}
                            style={{ 
                              color: 'var(--pf-t--global--color--brand--default)',
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {role.displayName}
                          </a>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {role.name}
                        </div>
                      </div>
                    </Td>
                    <Td dataLabel="Description" style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)', wordBreak: 'break-word' }}>
                      {role.description}
                    </Td>
                    <Td dataLabel="Category" style={{ wordBreak: 'break-word' }}>
                      {role.category}
                    </Td>
                    <Td dataLabel="Type">
                      <Label color={role.type === 'Default' ? 'blue' : 'green'}>{role.type}</Label>
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
                  {resourceScope === 'all' ? 'Cluster set role assignment' : 'Cluster role assignment'}
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
                <Content component="p" style={{ fontSize: '14px', color: '#151515' }}>
                  {mockRoles.find(r => r.id === selectedRole)?.displayName}
                </Content>
                <Content component="p" style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
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
                  Create
                </Button>
              )}{' '}
              <Button variant="link" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </Modal>
  );
};

