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
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CaretDownIcon, CheckCircleIcon, CircleIcon, AngleLeftIcon, AngleRightIcon, ResourcesEmptyIcon, TimesIcon } from '@patternfly/react-icons';
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

interface GroupRoleAssignmentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  groupName: string;
}

export const GroupRoleAssignmentWizard: React.FC<GroupRoleAssignmentWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  groupName,
}) => {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [clustersPage, setClustersPage] = React.useState(1);
  const [clustersPerPage, setClustersPerPage] = React.useState(10);
  
  // Step 1: Resources - Hierarchical structure for Group wizard
  const [resourceScope, setResourceScope] = React.useState<'everything' | 'cluster-sets' | 'clusters'>('everything');
  const [isResourceScopeOpen, setIsResourceScopeOpen] = React.useState(false);
  
  // Cluster sets selection
  const [selectedClusterSets, setSelectedClusterSets] = React.useState<number[]>([]);
  const [clusterSetSearch, setClusterSetSearch] = React.useState('');
  const [isClusterSetFilterOpen, setIsClusterSetFilterOpen] = React.useState(false);
  const [clusterSetFilterType, setClusterSetFilterType] = React.useState('Name');
  
  // Clusters selection (can be multiple)
  const [selectedClusters, setSelectedClusters] = React.useState<number[]>([]);
  const [clusterSearch, setClusterSearch] = React.useState('');
  const [isClusterFilterOpen, setIsClusterFilterOpen] = React.useState(false);
  const [clusterFilterType, setClusterFilterType] = React.useState('Name');
  
  // Cluster scope - after selecting clusters
  const [clusterScope, setClusterScope] = React.useState<'everything' | 'projects'>('everything');
  const [isClusterScopeOpen, setIsClusterScopeOpen] = React.useState(false);
  
  // Cluster set scope - after selecting cluster sets
  const [clusterSetScope, setClusterSetScope] = React.useState<'everything' | 'partial'>('everything');
  const [isClusterSetScopeOpen, setIsClusterSetScopeOpen] = React.useState(false);
  
  // Projects selection
  const [selectedProjects, setSelectedProjects] = React.useState<number[]>([]);
  const [projectSearch, setProjectSearch] = React.useState('');
  const [isProjectFilterOpen, setIsProjectFilterOpen] = React.useState(false);
  const [projectFilterType, setProjectFilterType] = React.useState('Name');
  
  // Substep tracking
  const [showClusterSetSelection, setShowClusterSetSelection] = React.useState(false);
  const [showClusterSelection, setShowClusterSelection] = React.useState(false);
  const [showScopeSelection, setShowScopeSelection] = React.useState(false);
  const [showProjectSelection, setShowProjectSelection] = React.useState(false);
  
  // Carousel for example tree views
  const [exampleIndex, setExampleIndex] = React.useState(0);
  // Drawer for examples
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  
  // Example expandable section states
  // Bulk selector dropdowns
  const [isClusterBulkSelectorOpen, setIsClusterBulkSelectorOpen] = React.useState(false);
  const [isProjectBulkSelectorOpen, setIsProjectBulkSelectorOpen] = React.useState(false);
  
  // Step 2: Role selection
  const [selectedRole, setSelectedRole] = React.useState<number | null>(null);
  const [roleSearch, setRoleSearch] = React.useState('');
  const [rolesPage, setRolesPage] = React.useState(1);
  const [rolesPerPage, setRolesPerPage] = React.useState(10);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = React.useState(false);
  const [roleFilterType, setRoleFilterType] = React.useState('Type');

  // Ref for wizard content to enable scrolling
  const wizardContentRef = React.useRef<HTMLDivElement>(null);

  // Scroll to top when substeps change
  React.useEffect(() => {
    if (wizardContentRef.current) {
      wizardContentRef.current.scrollTop = 0;
    }
  }, [showProjectSelection, showScopeSelection, showClusterSetSelection]);

  const resetWizard = () => {
    setCurrentStep(1);
    setResourceScope('everything');
    setIsResourceScopeOpen(false);
    setSelectedClusterSets([]);
    setClusterSetSearch('');
    setSelectedClusters([]);
    setClusterSearch('');
    setClusterScope('everything');
    setSelectedProjects([]);
    setProjectSearch('');
    setShowScopeSelection(false);
    setShowProjectSelection(false);
    setSelectedRole(null);
    setRoleSearch('');
    setRolesPage(1);
    setRolesPerPage(10);
    setRoleFilterType('Type');
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Handle hierarchical navigation within step 1 (resources)
      if (resourceScope === 'everything') {
        // No substeps needed, go directly to step 2 (role selection)
        setCurrentStep(2);
      } else if (resourceScope === 'cluster-sets') {
        if (selectedClusterSets.length > 0 && !showScopeSelection) {
          // Cluster sets selected, show scope selection (full vs partial access)
          setShowScopeSelection(true);
        } else if (showScopeSelection && clusterSetScope === 'everything' && !showProjectSelection) {
          // User chose full access to cluster sets, move to next step
          setCurrentStep(2);
        } else if (showScopeSelection && clusterSetScope === 'partial' && selectedClusters.length > 0 && !showProjectSelection) {
          // User chose partial access and selected clusters (table shows inline), now show cluster-level access selection
          setClusterScope('everything'); // Reset to default for the new substep
          setSelectedProjects([]); // Clear any previous project selections
          setShowProjectSelection(true);
        } else if (showProjectSelection && clusterScope === 'everything') {
          // User chose full cluster access, move to next step
          setCurrentStep(2);
        } else if (showProjectSelection && clusterScope === 'projects' && selectedProjects.length > 0) {
          // User chose partial access and selected projects, move to next step
          setCurrentStep(2);
        }
      } else if (resourceScope === 'clusters') {
        if (selectedClusters.length > 0 && !showScopeSelection) {
          // Clusters selected, now show access level selection
          setShowScopeSelection(true);
        } else if (showScopeSelection && clusterScope === 'everything') {
          // User chose full access, move to next step
          setCurrentStep(2);
        } else if (showScopeSelection && clusterScope === 'projects' && selectedProjects.length > 0) {
          // User chose partial access and selected projects, move to next step
          setCurrentStep(2);
        }
      }
    } else {
      // Normal step progression
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Handle hierarchical navigation backwards within step 1 (resources)
      if (showProjectSelection) {
        // Go back from project selection to cluster/scope selection
        setShowProjectSelection(false);
        setClusterScope('everything');
        setSelectedProjects([]);
      } else if (showScopeSelection) {
        // Go back from scope selection to initial dropdown (clusters and cluster sets are now inline)
        setShowScopeSelection(false);
        setClusterScope('everything');
        setSelectedProjects([]);
      } else {
        // At the beginning of step 1, can't go back
      return;
      }
    } else {
      // Normal step progression
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const roleName = mockRoles.find(r => r.id === selectedRole)?.name || 'Unknown Role';

    onComplete({
      identityType: 'group',
      identityId: null,
      identityName: groupName,
      resourceScope,
      selectedClusterSets,
      selectedClusters,
      selectedProjects,
      roleName,
    });
    
    resetWizard();
  };

  const isNextDisabled = () => {
    const disabled = (() => {
    if (currentStep === 1) {
        // Step 1: Resources - 'everything' doesn't require any selection
        if (resourceScope === 'everything') return false;
        
        // For 'cluster-sets' path
        if (resourceScope === 'cluster-sets') {
          // Must select at least one cluster set
          if (!showScopeSelection && selectedClusterSets.length === 0) return true;
          // If scope selection shown with "everything", allow Next
          if (showScopeSelection && !showProjectSelection && clusterSetScope === 'everything') return false;
          // If partial access is selected with inline cluster table, must select at least one cluster
          if (showScopeSelection && !showProjectSelection && clusterSetScope === 'partial' && selectedClusters.length === 0) return true;
          // If partial access with clusters selected, allow Next to show cluster-level access
          if (showScopeSelection && !showProjectSelection && clusterSetScope === 'partial' && selectedClusters.length > 0) return false;
          // If project selection shown (cluster-level access), check cluster scope
          if (showProjectSelection && clusterScope === 'everything') return false;
          // If partial cluster access, must select at least one project
          if (showProjectSelection && clusterScope === 'projects' && selectedProjects.length === 0) return true;
          // Special case: if multiple clusters selected with no common projects, disable Next
          if (showProjectSelection && clusterScope === 'projects' && selectedClusters.length > 1) {
            const hasCommonProjects = filteredProjectsForClusters.length > 0;
            if (!hasCommonProjects) return true;
          }
          return false;
        }
        
        // For 'clusters' path
      if (resourceScope === 'clusters') {
          // Must select at least one cluster
          if (selectedClusters.length === 0) return true;
          // If scope selection is shown and no scope chosen, disable next
          if (showScopeSelection && clusterScope === 'everything') return false;
          // If partial access (projects) is selected, must select at least one project
          if (showScopeSelection && clusterScope === 'projects' && selectedProjects.length === 0) return true;
          return false;
        }
        
      return false;
    }
    if (currentStep === 2) {
      // Step 2: Role selection - must select a role
      return selectedRole === null;
    }
      
    return false;
    })();
    
    return disabled;
  };

  // Mock cluster sets data
  const mockClusterSets = React.useMemo(() => {
    return dbClusterSets.map((clusterSet, index) => ({
      id: index + 1,
      dbId: clusterSet.id,
      name: clusterSet.name,
      clusterCount: dbClusters.filter(c => c.clusterSetId === clusterSet.id).length,
    }));
  }, []);

  // Mock clusters data - ALL clusters for specific cluster selection
  const mockClusters = React.useMemo(() => {
    return dbClusters.map((cluster, index) => ({
      id: index + 1,
      dbId: cluster.id,
      name: cluster.name,
      status: cluster.status,
      clusterSet: dbClusterSets.find(cs => cs.id === cluster.clusterSetId)?.name || 'Unknown',
      infrastructure: index % 3 === 0 ? 'Amazon Web Services' : index % 3 === 1 ? 'Microsoft Azure' : 'Google Cloud Platform',
      controlPlaneType: 'Standalone',
      kubernetesVersion: cluster.kubernetesVersion,
      labels: Math.floor(Math.random() * 10) + 1,
      nodes: cluster.nodes,
    }));
  }, []);

  const filteredClusterSets = mockClusterSets.filter(clusterSet =>
    clusterSet.name.toLowerCase().includes(clusterSetSearch.toLowerCase())
  );

  const filteredClusters = mockClusters.filter(cluster =>
    cluster.name.toLowerCase().includes(clusterSearch.toLowerCase())
  );

  // Filtered clusters for the selected cluster sets
  const filteredClustersForClusterSets = React.useMemo(() => {
    if (selectedClusterSets.length === 0) return [];
    
    // Get the database IDs of selected cluster sets
    const selectedClusterSetDbIds = selectedClusterSets
      .map(id => mockClusterSets.find(cs => cs.id === id)?.dbId)
      .filter(Boolean);
    
    // Filter clusters that belong to the selected cluster sets
    return mockClusters.filter(cluster => {
      const dbCluster = dbClusters.find(c => c.id === cluster.dbId);
      return dbCluster && selectedClusterSetDbIds.includes(dbCluster.clusterSetId);
    }).filter(cluster =>
      cluster.name.toLowerCase().includes(clusterSearch.toLowerCase())
    );
  }, [selectedClusterSets, clusterSearch, mockClusterSets, mockClusters]);

  // Mock projects data - ALL namespaces
  const mockProjects = React.useMemo(() => {
    return dbNamespaces.map((namespace, index) => ({
      id: index + 1,
      name: namespace.name,
      displayName: namespace.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: namespace.type,
      status: 'Active' as 'Active' | 'Terminating' | 'Failed',
      clusterId: namespace.clusterId,
      clusterName: dbClusters.find(c => c.id === namespace.clusterId)?.name || 'Unknown',
    }));
  }, []);

  // Filtered projects based on selected clusters
  const filteredProjectsForClusters = React.useMemo(() => {
    if (selectedClusters.length === 0) return [];
    
    // Get cluster database IDs from selected cluster IDs
      const selectedClusterDbIds = selectedClusters
        .map(id => mockClusters.find(c => c.id === id)?.dbId)
        .filter(Boolean) as string[];
      
    // Filter projects that belong to selected clusters
    let projects = mockProjects.filter(p => selectedClusterDbIds.includes(p.clusterId));
      
    // If multiple clusters selected, show only COMMON projects (same name across all selected clusters)
      if (selectedClusters.length > 1) {
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
        
      // Show only common projects
        projects = projects.filter(p => commonProjectNames.includes(p.name));
    }
    
    // Apply search filter
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
      return (
        <div style={{ position: 'relative', marginBottom: '0.25rem', paddingLeft: '3.5rem' }}>
          <span
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 0.75rem',
              fontSize: '14px',
              color: '#6a6e73',
              cursor: 'default',
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
                  Example {exampleIndex + 1} of 9
                </span>
                <Button 
                  variant="plain" 
                  onClick={() => setExampleIndex(Math.min(8, exampleIndex + 1))}
                  isDisabled={exampleIndex === 8}
                  aria-label="Next example"
                >
                  <AngleRightIcon />
                </Button>
              </div>
              {/* Example content - will be populated next */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '6px',
                border: '1px solid #d2d2d2',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                <Content component="p" style={{ fontSize: '13px', marginBottom: '12px', color: '#151515', fontWeight: 600 }}>
                  {exampleIndex === 0 && 'Example scope: Full access to all resources'}
                  {exampleIndex === 1 && 'Example scope: Single cluster set → Single cluster → Partial access'}
                  {exampleIndex === 2 && 'Example scope: Single cluster set → Multiple clusters → Common projects'}
                  {exampleIndex === 3 && 'Example scope: Multiple cluster sets → Full access'}
                  {exampleIndex === 4 && 'Example scope: Multiple cluster sets → Partial access → Common projects'}
                  {exampleIndex === 5 && 'Example scope: Single cluster → Full access'}
                  {exampleIndex === 6 && 'Example scope: Single cluster → Partial access'}
                  {exampleIndex === 7 && 'Example scope: Multiple clusters → Full access'}
                  {exampleIndex === 8 && 'Example scope: Multiple clusters → Common projects'}
                </Content>
                <div style={{ paddingLeft: '8px', fontSize: '12px', lineHeight: '1.6' }}>
                  {/* Example 0: Everything */}
                  {exampleIndex === 0 && (
                    <>
                      {/* CLUSTER SET 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      
                      {/* Cluster 1 in Set 1 */}
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
                      
                      {/* Cluster 2 in Set 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      
                      {/* Project 1 on Cluster 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      
                      {/* VM 5 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* VM 6 */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '46px', top: '50%' }}></span>
                        <span style={{ marginLeft: '60px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Virtual machine</span>
                      </div>
                      
                      {/* Additional cluster sets abbreviated for brevity */}
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 1: Single cluster set → Single cluster → Partial access */}
                  {exampleIndex === 1 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 2: Single cluster set → Multiple clusters → Common projects */}
                  {exampleIndex === 2 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 3: Multiple cluster sets → Full access */}
                  {exampleIndex === 3 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 4: Multiple cluster sets → Partial access → Common projects */}
                  {exampleIndex === 4 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster set</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '26px', top: '50%' }}></span>
                        <span style={{ marginLeft: '40px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 5: Single cluster → Full access */}
                  {exampleIndex === 5 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 6: Single cluster → Partial access */}
                  {exampleIndex === 6 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 7: Multiple clusters → Full access */}
                  {exampleIndex === 7 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                    </>
                  )}
                  
                  {/* Example 8: Multiple clusters → Common projects */}
                  {exampleIndex === 8 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', marginTop: '12px' }}>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Cluster</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <CheckCircleIcon style={{ color: '#3E8635', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515', fontWeight: 600, backgroundColor: '#e7f1fa', padding: '2px 6px', borderRadius: '3px' }}>Common project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '1px', height: 'calc(100% + 6px)', borderLeft: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '-6px' }}></span>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', position: 'relative' }}>
                        <span style={{ width: '14px', height: '1px', borderTop: '1px solid #d2d2d2', position: 'absolute', left: '6px', top: '50%' }}></span>
                        <span style={{ marginLeft: '20px' }}></span>
                        <ResourcesEmptyIcon style={{ color: '#151515', marginRight: '8px', fontSize: '12px', flexShrink: 0 }} />
                        <span style={{ color: '#151515' }}>Project</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main wizard content */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header Section */}
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '1.5rem', 
          borderBottom: '1px solid #d2d2d2',
          flexShrink: 0
        }}>
          <Title headingLevel="h1" size="2xl" id="group-wizard-title">
            Create role assignment for {groupName}
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
            {renderStepIndicator(1, 'Select resources')}
            
            {/* Substeps for cluster-sets */}
            {currentStep === 1 && resourceScope === 'cluster-sets' && (
              <>
                {(showScopeSelection || showProjectSelection) && (
                  <div style={{ marginLeft: '3.5rem', marginTop: '0', marginBottom: '0.5rem' }}>
                    {showScopeSelection && (
                    <div style={{ 
                      padding: '0.5rem 0.75rem',
                      fontSize: '14px',
                      color: '#6a6e73',
                      cursor: 'default',
                        backgroundColor: showScopeSelection && !showProjectSelection ? '#f5f5f5' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '0'
                    }}>
                        Choose access level
                    </div>
                    )}
                    {showProjectSelection && (
                      <div style={{ 
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        color: '#6a6e73',
                        cursor: 'default',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '0'
                      }}>
                        Choose cluster-level access
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Substeps for clusters */}
            {currentStep === 1 && resourceScope === 'clusters' && (
              <>
                {(showScopeSelection || showProjectSelection) && (
                  <div style={{ marginLeft: '3.5rem', marginTop: '0', marginBottom: '0.5rem' }}>
                    {showScopeSelection && (
                      <div style={{ 
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        color: '#6a6e73',
                        cursor: 'default',
                        backgroundColor: showScopeSelection && !showProjectSelection ? '#f5f5f5' : 'transparent',
                        borderRadius: '4px',
                        marginBottom: '0'
                      }}>
                        Choose access level
                      </div>
                    )}
                    {showProjectSelection && (
                      <div style={{ 
                        padding: '0.5rem 0.75rem',
                        fontSize: '14px',
                        color: '#6a6e73',
                        cursor: 'default',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        marginBottom: '0'
                      }}>
                        Select projects
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {renderStepIndicator(2, 'Select role')}
            {renderStepIndicator(3, 'Review')}
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
            <div 
              ref={wizardContentRef}
              style={{ 
              flex: '1 1 0',
              padding: '1.5rem 1.5rem 1.5rem 1.5rem', 
              backgroundColor: '#ffffff',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>


        {/* Step 1: Select Resources */}
        {currentStep === 1 && (
          <>
            {/* Only show title, description, and initial dropdown when NOT in any substep */}
            {!showClusterSetSelection && !showScopeSelection && (
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
                      {resourceScope === 'everything' && 'Everything'}
                      {resourceScope === 'cluster-sets' && 'Select cluster set(s)'}
                      {resourceScope === 'clusters' && 'Select cluster(s)'}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
                popperProps={{
                  appendTo: () => document.body,
                  
                  
                }}
              >
                <DropdownList>
                    <DropdownItem
                      key="everything"
                      onClick={() => {
                        setResourceScope('everything');
                      setSelectedClusterSets([]);
                      setSelectedClusters([]);
                      setSelectedProjects([]);
                      setShowScopeSelection(false);
                      setIsResourceScopeOpen(false);
                    }}
                      description="Grant access to all resources across all clusters registered in ACM"
                    >
                      Everything
                    </DropdownItem>
                    <DropdownItem
                      key="cluster-sets"
                      onClick={() => {
                        setResourceScope('cluster-sets');
                        setSelectedClusterSets([]);
                        setSelectedClusters([]);
                        setSelectedProjects([]);
                        setShowScopeSelection(false);
                        setClusterSetScope('everything'); // Reset to default
                        setIsResourceScopeOpen(false);
                      }}
                      description="Select one or more cluster sets, then optionally drill down to specific clusters and projects"
                    >
                      Select cluster set(s)
                  </DropdownItem>
                  <DropdownItem
                    key="clusters"
                    onClick={() => {
                      setResourceScope('clusters');
                        setSelectedClusterSets([]);
                      setSelectedClusters([]);
                      setSelectedProjects([]);
                      setShowScopeSelection(false);
                        setClusterScope('everything'); // Reset to default
                      setIsResourceScopeOpen(false);
                    }}
                      description="Select specific cluster(s), then optionally narrow down to projects"
                  >
                      Select cluster(s)
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
                
                {/* Cluster sets table - inline below dropdown */}
                {resourceScope === 'cluster-sets' && (
                  <div style={{ marginTop: '16px' }}>
                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem>
                        <Dropdown
                            isOpen={isClusterSetFilterOpen}
                            onSelect={() => setIsClusterSetFilterOpen(false)}
                            onOpenChange={(isOpen: boolean) => setIsClusterSetFilterOpen(isOpen)}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle 
                              ref={toggleRef} 
                                onClick={() => setIsClusterSetFilterOpen(!isClusterSetFilterOpen)} 
                                isExpanded={isClusterSetFilterOpen}
                              variant="default"
                            >
                                {clusterSetFilterType}
                            </MenuToggle>
                          )}
                          popperProps={{
                            appendTo: () => document.body,
                            
                            
                          }}
                        >
                          <DropdownList>
                              <DropdownItem onClick={() => { setClusterSetFilterType('Name'); setIsClusterSetFilterOpen(false); }}>
                                Name
                            </DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </ToolbarItem>
                      <ToolbarItem>
                        <SearchInput
                            placeholder="Search cluster sets"
                            value={clusterSetSearch}
                            onChange={(_event, value) => setClusterSetSearch(value)}
                            onClear={() => setClusterSetSearch('')}
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                    <Table aria-label="Cluster sets table" variant="compact">
                    <Thead>
                      <Tr>
                        <Th width={10}></Th>
                          <Th>Cluster set name</Th>
                          <Th>Clusters</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                        {filteredClusterSets.map((clusterSet) => (
                        <Tr
                            key={clusterSet.id}
                          isSelectable
                          isClickable
                            isRowSelected={selectedClusterSets.includes(clusterSet.id)}
                          onRowClick={() => {
                              if (selectedClusterSets.includes(clusterSet.id)) {
                                setSelectedClusterSets(selectedClusterSets.filter(id => id !== clusterSet.id));
                              } else {
                                setSelectedClusterSets([...selectedClusterSets, clusterSet.id]);
                              }
                          }}
                        >
                          <Td>
                              <Checkbox
                                id={`cluster-set-${clusterSet.id}`}
                                isChecked={selectedClusterSets.includes(clusterSet.id)}
                              onChange={() => {
                                  if (selectedClusterSets.includes(clusterSet.id)) {
                                    setSelectedClusterSets(selectedClusterSets.filter(id => id !== clusterSet.id));
                                  } else {
                                    setSelectedClusterSets([...selectedClusterSets, clusterSet.id]);
                                  }
                              }}
                            />
                          </Td>
                            <Td dataLabel="Cluster set name">
                              <div style={{ fontWeight: selectedClusterSets.includes(clusterSet.id) ? '600' : 'normal' }}>
                                {clusterSet.name}
                            </div>
                          </Td>
                            <Td dataLabel="Clusters">{clusterSet.clusterCount}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
                )}
              
                {/* Clusters table - inline below dropdown */}
                {resourceScope === 'clusters' && (
                  <div style={{ marginTop: '16px' }}>
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
                              variant="default"
                            >
                                {clusterFilterType}
                            </MenuToggle>
                          )}
                          popperProps={{
                            appendTo: () => document.body,
                            
                            
                          }}
                        >
                          <DropdownList>
                              <DropdownItem onClick={() => { setClusterFilterType('Name'); setIsClusterFilterOpen(false); }}>
                                Name
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
                      <ToolbarItem align={{ default: 'alignEnd' }}>
                        <Pagination
                            itemCount={filteredClusters.length}
                            perPage={clustersPerPage}
                            page={clustersPage}
                            onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                          onPerPageSelect={(_event, perPage) => {
                              setClustersPerPage(perPage);
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
                        <Th width={10}></Th>
                          <Th>Cluster name</Th>
                          <Th>Cluster set</Th>
                          <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                        {filteredClusters
                          .slice((clustersPage - 1) * clustersPerPage, clustersPage * clustersPerPage)
                          .map((cluster) => (
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
                            <Td dataLabel="Cluster name">
                              <div style={{ fontWeight: selectedClusters.includes(cluster.id) ? '600' : 'normal' }}>
                                {cluster.name}
                            </div>
                          </Td>
                            <Td dataLabel="Cluster set">{cluster.clusterSet}</Td>
                            <Td dataLabel="Status">
                              <Label color={cluster.status === 'Ready' ? 'green' : 'red'}>
                                {cluster.status}
                              </Label>
                            </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Pagination
                      itemCount={filteredClusters.length}
                      perPage={clustersPerPage}
                      page={clustersPage}
                      onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                    onPerPageSelect={(_event, perPage) => {
                        setClustersPerPage(perPage);
                        setClustersPage(1);
                    }}
                      variant="bottom"
                  />
                </div>
                )}

                {/* Everything scope - no selection needed */}
                {resourceScope === 'everything' && (
                  <>
                    <Content component="p" style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px', marginBottom: '16px' }}>
                      This role assignment will apply to all resources registered in Advanced Cluster Management.
            </Content>

                    {/* Tree view example for "Everything" */}
                  </>
                )}
              </>
            )}

            {/* SUB-STEP 2: Choose Access Level - separate substep after selecting cluster sets */}
            {resourceScope === 'cluster-sets' && showScopeSelection && !showProjectSelection && (() => {
              return (
              <div key="cluster-sets-scope-selection">
                <Title headingLevel="h2" size="xl" style={{ marginBottom: '12px' }}>
                  Choose access level
            </Title>
                <Content component="p" style={{ marginBottom: '24px', color: '#6a6e73', fontSize: '14px' }}>
                  Define the level of access for the {selectedClusterSets.length} selected cluster set{selectedClusterSets.length > 1 ? 's' : ''}.
            </Content>

                <FormGroup label="Access level" style={{ marginBottom: '16px' }}>
              <Dropdown
                    isOpen={isClusterSetScopeOpen}
                    onSelect={() => setIsClusterSetScopeOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsClusterSetScopeOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle 
                    ref={toggleRef} 
                        onClick={() => setIsClusterSetScopeOpen(!isClusterSetScopeOpen)} 
                        isExpanded={isClusterSetScopeOpen}
                    variant="default"
                    style={{ width: '100%' }}
                  >
                        {clusterSetScope === 'everything'
                          ? 'Full access to selected cluster sets'
                          : 'Partial access - Specify clusters'}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
                popperProps={{
                  appendTo: () => document.body,
                      
                      
                }}
              >
                <DropdownList>
                  <DropdownItem
                        key="everything"
                    onClick={() => {
                          setClusterSetScope('everything');
                      setSelectedClusters([]);
                          setIsClusterSetScopeOpen(false);
                        }}
                        description="✓ Full access: All current and future clusters and their resources in the selected cluster sets"
                      >
                        Full access to selected cluster sets
                  </DropdownItem>
                  <DropdownItem
                        key="partial"
                    onClick={() => {
                          setClusterSetScope('partial');
                          setIsClusterSetScopeOpen(false);
                        }}
                        description="→ Limited access: Choose specific clusters from the selected cluster sets"
                      >
                        Partial access - Specify clusters
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
                </FormGroup>

                {/* Show clusters table BELOW the dropdown if partial access is selected */}
                {clusterSetScope === 'partial' && (
              <div style={{ marginTop: '24px' }}>
                    <Content component="p" style={{ marginBottom: '16px', fontSize: '14px', color: '#6a6e73' }}>
                      Select one or more clusters from the selected cluster sets.
                    </Content>
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
                            variant="default"
                          >
                            {clusterFilterType}
                          </MenuToggle>
                        )}
                        popperProps={{
                          appendTo: () => document.body,
                          
                          
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setClusterFilterType('Name'); setIsClusterFilterOpen(false); }}>
                            Name
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
                    <ToolbarItem align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={filteredClustersForClusterSets.length}
                        perPage={clustersPerPage}
                        page={clustersPage}
                        onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                        onPerPageSelect={(_event, perPage) => {
                          setClustersPerPage(perPage);
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
                      <Th width={10}></Th>
                      <Th>Name</Th>
                      <Th>Status</Th>
                      <Th>Infrastructure</Th>
                          <Th>Kubernetes version</Th>
                      <Th>Nodes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                        {filteredClustersForClusterSets
                          .slice((clustersPage - 1) * clustersPerPage, clustersPage * clustersPerPage)
                          .map((cluster) => (
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
                            <Td dataLabel="Name">
                              <div style={{ fontWeight: selectedClusters.includes(cluster.id) ? '600' : 'normal' }}>
                                {cluster.name}
                              </div>
                            </Td>
                            <Td dataLabel="Status">
                          <Label color={cluster.status === 'Ready' ? 'green' : 'red'}>
                            {cluster.status}
                          </Label>
                        </Td>
                            <Td dataLabel="Infrastructure">{cluster.infrastructure}</Td>
                            <Td dataLabel="Kubernetes version">{cluster.kubernetesVersion}</Td>
                            <Td dataLabel="Nodes">{cluster.nodes}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Pagination
                  itemCount={filteredClustersForClusterSets.length}
                  perPage={clustersPerPage}
                  page={clustersPage}
                  onSetPage={(_event, pageNumber) => setClustersPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => {
                    setClustersPerPage(perPage);
                    setClustersPage(1);
                  }}
                  variant="bottom"
                />
                  </div>
                )}
              </div>
              );
            })()}

            {/* SUB-STEP 3: Choose Cluster-Level Access - separate substep after selecting clusters */}
            {resourceScope === 'cluster-sets' && showProjectSelection && selectedClusters.length > 0 && (() => {
              return (
              <div key="cluster-level-access-selection">
                <Title headingLevel="h2" size="xl" style={{ marginBottom: '12px' }}>
                  Choose cluster-level access
                </Title>
                <Content component="p" style={{ marginBottom: '24px', color: '#6a6e73', fontSize: '14px' }}>
                  Define the level of access for the {selectedClusters.length} selected cluster{selectedClusters.length > 1 ? 's' : ''}.
                    </Content>
                
                <FormGroup label="Access level for selected clusters" style={{ marginBottom: '16px' }}>
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
                          ? (selectedClusters.length === 1 ? 'Full cluster access' : 'Full access to all selected clusters')
                          : (selectedClusters.length === 1 ? 'Partial access - Specify projects' : 'Partial access - Common projects')}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                    popperProps={{
                      appendTo: () => document.body,
                      
                      
                    }}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="everything"
                        onClick={() => {
                          setClusterScope('everything');
                          setSelectedProjects([]);
                          setIsClusterScopeOpen(false);
                        }}
                        description={selectedClusters.length === 1
                          ? '✓ Full access: All current and future projects/namespaces on this cluster'
                          : `✓ Full access: All current and future projects/namespaces across all ${selectedClusters.length} clusters`}
                      >
                        {selectedClusters.length === 1 ? 'Full cluster access' : 'Full access to all selected clusters'}
                      </DropdownItem>
                      <DropdownItem
                        key="projects"
                        onClick={() => {
                          setClusterScope('projects');
                          setSelectedProjects([]);
                          setIsClusterScopeOpen(false);
                        }}
                        description={selectedClusters.length === 1
                          ? '→ Limited access: Choose specific projects/namespaces from this cluster'
                          : `→ Limited access: Choose projects/namespaces that exist across all ${selectedClusters.length} clusters`}
                      >
                        {selectedClusters.length === 1 ? 'Partial access - Specify projects' : 'Partial access - Common projects'}
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FormGroup>

                {/* Show projects table below if partial access is selected */}
                {clusterScope === 'projects' && (
              <div style={{ marginTop: '24px' }}>
                    {/* Warning if no common projects found for multiple clusters */}
                    {selectedClusters.length > 1 && filteredProjectsForClusters.length === 0 && (
                      <Alert
                        variant="warning"
                        isInline
                        title="No common projects found"
                        style={{ marginBottom: '16px' }}
                      >
                        <p>
                          The {selectedClusters.length} selected clusters do not have any projects in common. 
                          Please go back and either:
                        </p>
                        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                          <li>Select "Full access to all selected clusters" to grant access to all projects on those clusters</li>
                          <li>Select only one cluster to choose specific projects from it</li>
                          <li>Select different clusters that have common projects</li>
                        </ul>
                      </Alert>
                    )}
                    
                    <Content component="p" style={{ marginBottom: '16px', fontSize: '14px', color: '#6a6e73' }}>
                      {selectedClusters.length === 1
                        ? 'Select one or more projects from the selected cluster.'
                        : `Select common projects that exist across all ${selectedClusters.length} selected clusters.`}
                    </Content>
                    <Toolbar>
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
                          
                          
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setProjectFilterType('Name'); setIsProjectFilterOpen(false); }}>
                            Name
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
                  </ToolbarContent>
                </Toolbar>
                <Table aria-label="Projects table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                          <Th>Name</Th>
                          <Th>Type</Th>
                        <Th>Clusters</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                        {filteredProjectsForClusters.length === 0 ? (
                          <Tr>
                            <Td colSpan={4}>
                              <EmptyState>
                                <EmptyStateBody>
                                  {selectedClusters.length > 1 
                                    ? 'No common projects found across the selected clusters.'
                                    : 'No projects found in the selected cluster.'}
                                </EmptyStateBody>
                              </EmptyState>
                          </Td>
                        </Tr>
                        ) : selectedClusters.length === 1 ? (
                          // Single cluster: Show ALL projects, allow multiple selection
                          filteredProjectsForClusters.map((project) => (
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
                              <Td dataLabel="Name">
                                <div style={{ fontWeight: selectedProjects.includes(project.id) ? '600' : 'normal' }}>
                                  {project.displayName}
                                </div>
                              </Td>
                              <Td dataLabel="Type">
                            <Label color="blue">{project.type}</Label>
                          </Td>
                              <Td dataLabel="Clusters">
                                <Label color="grey">{project.clusterName}</Label>
                          </Td>
                        </Tr>
                        ))
                    ) : (
                          // Multiple clusters: Show COMMON projects grouped by name, allow only ONE selection
                      (() => {
                            // Group projects by name to show as common
                            const commonProjects = new Map<string, typeof filteredProjectsForClusters>();
                            filteredProjectsForClusters.forEach(project => {
                              if (!commonProjects.has(project.name)) {
                                commonProjects.set(project.name, []);
                              }
                              commonProjects.get(project.name)?.push(project);
                            });
                            
                            return Array.from(commonProjects.entries()).map(([name, projects]) => {
                              const isSelected = projects.every(p => selectedProjects.includes(p.id));
                          
                              return (
                                <Tr
                                  key={name}
                                  isSelectable
                                  isClickable
                                  isRowSelected={isSelected}
                                  onRowClick={() => {
                                    if (isSelected) {
                                      setSelectedProjects([]);
                                    } else {
                                      setSelectedProjects(projects.map(p => p.id));
                                    }
                                  }}
                                >
                                  <Td>
                                    <Radio
                                      id={`project-${name}`}
                                      name="common-project-selection-substep"
                                      isChecked={isSelected}
                                      onChange={() => {
                                        if (isSelected) {
                                          setSelectedProjects([]);
                                        } else {
                                          setSelectedProjects(projects.map(p => p.id));
                                        }
                                      }}
                                    />
                                  </Td>
                                  <Td dataLabel="Name">
                                    <div style={{ fontWeight: isSelected ? '600' : 'normal' }}>
                                      {name}
                                    </div>
                                  </Td>
                                  <Td dataLabel="Type">
                                    <Label color="blue">{projects[0].type}</Label>
                                  </Td>
                                  <Td dataLabel="Clusters">
                                    {projects.map((p, idx) => (
                                      <Label key={idx} color="grey" style={{ marginRight: '4px' }}>
                                        {p.clusterName}
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
              </div>
              );
            })()}


            {/* SUB-STEP: Choose Access Level after selecting clusters (for 'clusters' path only) */}
            {resourceScope === 'clusters' && showScopeSelection && !showProjectSelection && (() => {
                          return (
              <div key="clusters-access-level-selection">
                <Title headingLevel="h2" size="xl" style={{ marginBottom: '12px' }}>
                  Choose access level
                </Title>
                <Content component="p" style={{ marginBottom: '16px', fontSize: '14px', color: '#6a6e73' }}>
                  Define the level of access for the {selectedClusters.length} selected cluster{selectedClusters.length > 1 ? 's' : ''}.
                                </Content>
                
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
                          ? (selectedClusters.length === 1 ? 'Full access to selected cluster' : 'Full access to selected clusters')
                          : (selectedClusters.length === 1 ? 'Partial access - Specify projects' : 'Partial access - Specify common projects')}
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                    popperProps={{
                      appendTo: () => document.body,
                      
                      
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
                      {selectedClusters.length === 1 ? 'Full access to selected cluster' : 'Full access to selected clusters'}
                      </DropdownItem>
                      <DropdownItem
                        key="projects"
                        onClick={() => {
                          setClusterScope('projects');
                          setSelectedProjects([]);
                          setIsClusterScopeOpen(false);
                        }}
                        description={selectedClusters.length === 1
                          ? '→ Limited access: Choose specific projects/namespaces from this cluster'
                        : '→ Limited access: Choose projects/namespaces that exist across all selected clusters'}
                      >
                      {selectedClusters.length === 1 ? 'Partial access - Specify projects' : 'Partial access - Specify common projects'}
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FormGroup>

              {/* Projects table shown inline if partial access is selected */}
              {clusterScope === 'projects' && (
              <div style={{ marginTop: '24px' }}>
                    {selectedClusters.length > 1 && filteredProjectsForClusters.length === 0 && (
                  <Content component="p" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', fontSize: '13px' }}>
                        <strong>Note:</strong> No common projects found across all {selectedClusters.length} selected clusters.
                  </Content>
                )}
                    {selectedClusters.length > 1 && filteredProjectsForClusters.length > 0 && (
                      <Content component="p" style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', fontSize: '13px' }}>
                        <strong>Note:</strong> Only projects that exist in <strong>all {selectedClusters.length} clusters</strong> are shown below. You can select <strong>only one common project</strong>.
                      </Content>
                    )}
                    <Toolbar>
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
                          
                          
                        }}
                      >
                        <DropdownList>
                          <DropdownItem onClick={() => { setProjectFilterType('Name'); setIsProjectFilterOpen(false); }}>
                            Name
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
                  </ToolbarContent>
                </Toolbar>
                <Table aria-label="Projects table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th width={10}></Th>
                      <Th>Name</Th>
                          <Th>Type</Th>
                        <Th>Clusters</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                        {filteredProjectsForClusters.length === 0 ? (
                          <Tr>
                            <Td colSpan={4}>
                              <EmptyState>
                                <EmptyStateBody>
                                  {selectedClusters.length > 1 
                                    ? 'No common projects found across the selected clusters.'
                                    : 'No projects found in the selected cluster.'}
                                </EmptyStateBody>
                              </EmptyState>
                              </Td>
                            </Tr>
                        ) : selectedClusters.length === 1 ? (
                          // Single cluster: Show ALL projects, allow multiple selection
                          filteredProjectsForClusters.map((project) => (
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
                              <Td dataLabel="Name">
                                <div style={{ fontWeight: selectedProjects.includes(project.id) ? '600' : 'normal' }}>
                                  {project.name}
                                </div>
                              </Td>
                              <Td dataLabel="Type">
                            <Label color="blue">{project.type}</Label>
                          </Td>
                              <Td dataLabel="Clusters">
                                <Label color="grey">{project.clusterName}</Label>
                          </Td>
                        </Tr>
                        ))
                    ) : (
                          // Multiple clusters: Show COMMON projects, allow only ONE selection
                      (() => {
                            // Group projects by name to show as common
                            const commonProjects = new Map<string, typeof filteredProjectsForClusters>();
                            filteredProjectsForClusters.forEach(project => {
                              if (!commonProjects.has(project.name)) {
                                commonProjects.set(project.name, []);
                              }
                              commonProjects.get(project.name)?.push(project);
                            });
                            
                            return Array.from(commonProjects.entries()).map(([name, projects]) => {
                              const isSelected = projects.every(p => selectedProjects.includes(p.id));
                          
                          return (
                            <Tr
                                  key={name}
                              isSelectable
                              isClickable
                              isRowSelected={isSelected}
                              onRowClick={() => {
                                if (isSelected) {
                                      setSelectedProjects([]);
                                } else {
                                      setSelectedProjects(projects.map(p => p.id));
                                }
                              }}
                            >
                              <Td>
                                    <Radio
                                      id={`project-${name}`}
                                      name="common-project-selection"
                                  isChecked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                          setSelectedProjects([]);
                                    } else {
                                          setSelectedProjects(projects.map(p => p.id));
                                    }
                                  }}
                                />
                              </Td>
                                  <Td dataLabel="Name">
                                    <div style={{ fontWeight: isSelected ? '600' : 'normal' }}>
                                      {name}
                                    </div>
                                  </Td>
                                  <Td dataLabel="Type">
                                    <Label color="blue">{projects[0].type}</Label>
                                  </Td>
                                  <Td dataLabel="Clusters">
                                    {projects.map((p, idx) => (
                                      <Label key={idx} color="grey" style={{ marginRight: '4px' }}>
                                        {p.clusterName}
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
              </div>
              );
            })()}
          </>
        )}

        {/* Step 2: Select Role */}
        {currentStep === 2 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
              Select role
            </Title>
            <Content component="p" style={{ marginBottom: '24px', color: '#6a6e73', fontSize: '14px' }}>
              Select the role to assign to {groupName}.
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
                      <DropdownItem onClick={() => { setRoleFilterType('Type'); setIsRoleFilterOpen(false); }}>
                        Type
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
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={mockRoles.filter(role => role.name.toLowerCase().includes(roleSearch.toLowerCase())).length}
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
            
            <Table aria-label="Roles table" variant="compact">
              <Thead>
                <Tr>
                  <Th width={10}></Th>
                  <Th>Role</Th>
                  <Th>Type</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockRoles
                  .filter(role => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
                  .slice((rolesPage - 1) * rolesPerPage, rolesPage * rolesPerPage)
                  .map((role) => (
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
                    <Td dataLabel="Type">{role.type}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            <Pagination
              itemCount={mockRoles.filter(role => role.name.toLowerCase().includes(roleSearch.toLowerCase())).length}
              perPage={rolesPerPage}
              page={rolesPage}
              onSetPage={(_event, pageNumber) => setRolesPage(pageNumber)}
              onPerPageSelect={(_event, perPage) => {
                setRolesPerPage(perPage);
                setRolesPage(1);
              }}
              variant={PaginationVariant.bottom}
              style={{ marginTop: '16px' }}
            />
          </>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '24px' }}>
              Review
            </Title>
            
            {/* Group section */}
            <div style={{ 
              marginBottom: '32px',
              paddingBottom: '24px',
              borderBottom: '1px solid #d2d2d2'
            }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>
                Group
                </Title>
              <div style={{ marginLeft: '16px' }}>
                <Content component="p" style={{ 
                  marginBottom: '4px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#151515'
                }}>
                  {groupName}
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
                  Resources
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
                {resourceScope === 'everything' && (
                  <>
                <Content component="p" style={{ 
                      marginBottom: '4px', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  color: '#151515'
                }}>
                      Scope
                </Content>
                <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                      Global / Applies to all resources registered in ACM
                </Content>
                  </>
                )}
                
                {resourceScope === 'cluster-sets' && (
                  <>
                    {selectedClusterSets.length > 0 && (
                  <>
                    <Content component="p" style={{ 
                      marginBottom: '4px', 
                      fontSize: '14px', 
                      fontWeight: 600,
                          color: '#151515'
                    }}>
                          Cluster sets
                    </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '12px' }}>
                          {selectedClusterSets.map(id => mockClusterSets.find(cs => cs.id === id)?.name).filter(Boolean).join(', ')}
                    </Content>
                      </>
                    )}

                    {selectedClusters.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515'
                        }}>
                          Clusters
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '12px' }}>
                          {selectedClusters.map(id => mockClusters.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                        </Content>
                      </>
                    )}
                    
                    {selectedClusters.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515'
                        }}>
                          Projects
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                          {clusterScope === 'everything' ? 'Full access' : 
                            selectedProjects.length > 0 
                              ? selectedProjects.map(id => {
                            const project = mockProjects.find(p => p.id === id);
                            return project?.name;
                                }).filter(Boolean).join(', ')
                              : 'None selected'
                          }
                        </Content>
                      </>
                    )}
                    
                    {selectedClusters.length === 0 && selectedClusterSets.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515'
                        }}>
                          Access level
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                          Full access to all clusters in selected cluster sets
                        </Content>
                      </>
                    )}
                  </>
                )}
                
                {resourceScope === 'clusters' && (
                  <>
                    {selectedClusters.length > 0 && (
                      <>
                        <Content component="p" style={{ 
                          marginBottom: '4px', 
                          fontSize: '14px', 
                          fontWeight: 600,
                          color: '#151515'
                        }}>
                          Clusters
                        </Content>
                        <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '12px' }}>
                          {selectedClusters.map(id => mockClusters.find(c => c.id === id)?.name).filter(Boolean).join(', ')}
                        </Content>
                      </>
                    )}
                    
                    <Content component="p" style={{ 
                      marginBottom: '4px', 
                      fontSize: '14px', 
                      fontWeight: 600,
                      color: '#151515'
                    }}>
                      Projects
                    </Content>
                    <Content component="p" style={{ fontSize: '14px', color: '#6a6e73', marginBottom: '8px' }}>
                      {clusterScope === 'everything' ? 'Full access' : 
                        selectedProjects.length > 0 
                          ? selectedProjects.map(id => {
                              const project = mockProjects.find(p => p.id === id);
                              return project?.name;
                            }).filter(Boolean).join(', ')
                          : 'None selected'
                      }
                    </Content>
                  </>
                )}
              </div>
            </div>

            {/* Select role section */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title headingLevel="h3" size="md" style={{ margin: 0 }}>
                  Role
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
                <Content component="p" style={{ fontSize: '14px', color: '#151515', fontWeight: 600 }}>
                  {mockRoles.find(r => r.id === selectedRole)?.name || 'No role selected'}
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
              {(currentStep > 1 || showScopeSelection || showProjectSelection) && (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              )}{' '}
              {currentStep < 3 ? (
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
      </div>
    </Modal>
  );
};
