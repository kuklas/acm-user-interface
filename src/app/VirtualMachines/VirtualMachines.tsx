import * as React from 'react';
import {
  Page,
  PageSection,
  Title,
  Card,
  CardBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
  Label,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Pagination,
  PaginationVariant,
  Switch,
  Content,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  TreeView,
  TreeViewDataItem,
  Divider,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Breadcrumb,
  BreadcrumbItem,
  ExpandableSection,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td, ActionsColumn, IAction } from '@patternfly/react-table';
import { FilterIcon, EllipsisVIcon, CogIcon, AngleLeftIcon, AngleRightIcon, SyncAltIcon, RedoIcon, CheckIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import './VirtualMachines.css';

// Mock VM search suggestions
const vmSearchSuggestions = [
  'vm-centos-stream8-fuchsia-tarsier-90',
  'vm-centos-stream8-violet-sawfish-64',
  'vm-diplomatic-alpaca',
  'vm-fedora-brown-salmon-50',
  'vm-rhel-8-apricot-cheetah-33',
];

// Mock VM data
const mockVMs = [
  { id: 1, name: 'vm-1', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 2, name: 'vm-2', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 3, name: 'vm-3', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 4, name: 'vm-4', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 5, name: 'vm-5', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 6, name: 'vm-6', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 7, name: 'vm-7', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 8, name: 'vm-8', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 9, name: 'vm-9', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
  { id: 10, name: 'vm-10', status: 'Running', cpu: '0.25 vCPU / 2 (12%)', memory: '1.2 GiB / 4 GiB (30%)', disk: '8 GiB / 40 GiB (20%)', ip: '10.0.12.34', labels: ['app:web', 'env:test'], moreLabels: 3 },
];

const VirtualMachines: React.FunctionComponent = () => {
  useDocumentTitle('Virtual machines');
  
  const [searchValue, setSearchValue] = React.useState('');
  const [sidebarSearch, setSidebarSearch] = React.useState('');
  const [showOnlyWithVMs, setShowOnlyWithVMs] = React.useState(false);
  const [selectedVMs, setSelectedVMs] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(280);
  const [isResizing, setIsResizing] = React.useState(false);
  const searchInputRef = React.useRef<HTMLDivElement>(null);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  
  // Dropdown states
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isMenuToggleOpen, setIsMenuToggleOpen] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isRefreshDropdownOpen, setIsRefreshDropdownOpen] = React.useState(false);
  
  // Refresh state
  const [refreshMode, setRefreshMode] = React.useState<'auto' | 'manual'>('auto');
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  
  const [selectedCluster, setSelectedCluster] = React.useState('test');
  
  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing-sidebar');
    };

    if (isResizing) {
      document.body.classList.add('resizing-sidebar');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.body.classList.remove('resizing-sidebar');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Close search menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchMenuOpen && searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        const dropdown = document.querySelector('.search-dropdown-menu');
        if (dropdown && !dropdown.contains(e.target as Node)) {
          setIsSearchMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchMenuOpen]);
  
  const handleSelectAllVMs = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedVMs(mockVMs.map(vm => vm.id));
    } else {
      setSelectedVMs([]);
    }
  };
  
  const handleSelectVM = (vmId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedVMs([...selectedVMs, vmId]);
    } else {
      setSelectedVMs(selectedVMs.filter(id => id !== vmId));
    }
  };
  
  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };
  
  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };
  
  const vmActions = (vm: any): IAction[] => [
    {
      title: 'Start',
      onClick: () => console.log('Start', vm.name),
    },
    {
      title: 'Stop',
      onClick: () => console.log('Stop', vm.name),
    },
    {
      title: 'Restart',
      onClick: () => console.log('Restart', vm.name),
    },
    { isSeparator: true },
    {
      title: 'Delete',
      onClick: () => console.log('Delete', vm.name),
    },
  ];
  
  // Tree view data for sidebar
  const treeData: TreeViewDataItem[] = [
    {
      name: 'Clusters',
      id: 'clusters',
      children: [
        {
          name: 'local-cluster',
          id: 'local-cluster',
          children: [
            {
              name: 'test',
              id: 'test',
              icon: <Checkbox id="checkbox-test" isChecked={selectedCluster === 'test'} />,
              children: [
                { name: 'vm-1', id: 'vm-1' },
                { name: 'vm-2', id: 'vm-2' },
                { name: 'vm-3', id: 'vm-3' },
                { name: 'vm-4', id: 'vm-4' },
                { name: 'vm-5', id: 'vm-5' },
              ],
            },
            {
              name: 'prod',
              id: 'prod',
            },
            {
              name: 'dev',
              id: 'dev',
            },
          ],
        },
        {
          name: 'Ronens Cluster',
          id: 'ronens-cluster',
        },
        {
          name: 'Christians Cluster',
          id: 'christians-cluster',
        },
        {
          name: 'Fabians Cluster',
          id: 'fabians-cluster',
        },
      ],
    },
  ];
  
  const sidebar = (
    <div 
      ref={sidebarRef}
      className="vm-sidebar" 
      style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '600px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Switch
          id="show-vms-only"
          label="Only show objects with virtual machines"
          isChecked={showOnlyWithVMs}
          onChange={(_event, checked) => setShowOnlyWithVMs(checked)}
        />
      </div>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <TreeView
        data={treeData}
        defaultAllExpanded
        hasGuides
      />
      
      <div 
        className="sidebar-resize-handle"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'col-resize',
          backgroundColor: isResizing ? 'var(--pf-t--global--color--brand--default)' : 'transparent',
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
            border: '1px solid var(--pf-t--global--border--color--default)',
            borderRadius: '0 4px 4px 0',
            cursor: 'col-resize',
          }}
        >
          <AngleLeftIcon style={{ fontSize: '12px' }} />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="vm-page">
      <div className="vm-header">
        <div style={{ padding: '24px' }}>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsLg' }} flexWrap={{ default: 'nowrap' }}>
            <FlexItem>
              <Title headingLevel="h1" size="2xl">Virtual machines</Title>
            </FlexItem>
            <FlexItem flex={{ default: 'flex_1' }}>
              <div style={{ position: 'relative' }}>
                <div ref={searchInputRef}>
                  <SearchInput
                    placeholder="Search VirtualMachines"
                    value={sidebarSearch}
                    onChange={(_event, value) => {
                      setSidebarSearch(value);
                      setIsSearchMenuOpen(value.length > 0);
                    }}
                    onClear={() => {
                      setSidebarSearch('');
                      setIsSearchMenuOpen(false);
                    }}
                    onFocus={() => sidebarSearch.length > 0 && setIsSearchMenuOpen(true)}
                  />
                </div>
                {isSearchMenuOpen && (
                  <div
                    className="search-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      zIndex: 1000,
                    }}
                  >
                    <Menu>
                      <MenuContent>
                        <MenuList>
                          {vmSearchSuggestions
                            .filter(vm => vm.toLowerCase().includes(sidebarSearch.toLowerCase()))
                            .map((vm, index) => (
                              <MenuItem 
                                key={index}
                                onClick={() => {
                                  setSidebarSearch(vm);
                                  setIsSearchMenuOpen(false);
                                }}
                              >
                                <span>
                                  <span style={{ color: 'var(--pf-t--global--color--brand--default)', fontWeight: 600 }}>
                                    {vm.substring(0, sidebarSearch.length)}
                                  </span>
                                  {vm.substring(sidebarSearch.length)}
                                </span>
                              </MenuItem>
                            ))}
                          <Divider />
                          <MenuItem isDisabled>
                            <strong>Related suggestions</strong>
                          </MenuItem>
                          <MenuItem onClick={() => setIsSearchMenuOpen(false)}>
                            Label <Label color="blue" isCompact>(3)</Label>
                          </MenuItem>
                          <MenuItem onClick={() => setIsSearchMenuOpen(false)}>
                            IP <Label color="blue" isCompact>(2)</Label>
                          </MenuItem>
                          <Divider />
                          <MenuItem>
                            <Flex spaceItems={{ default: 'spaceItemsMd' }} style={{ width: '100%', padding: '8px 0' }}>
                              <FlexItem>
                                <Button variant="primary" size="sm" onClick={() => setIsSearchMenuOpen(false)}>Search</Button>
                              </FlexItem>
                              <FlexItem>
                                <Button variant="secondary" size="sm" onClick={() => setIsSearchMenuOpen(false)}>
                                  <svg fill="currentColor" height="1em" width="1em" viewBox="0 0 512 512" style={{ marginRight: '8px' }}>
                                    <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"/>
                                  </svg>
                                  Advanced search
                                </Button>
                              </FlexItem>
                            </Flex>
                          </MenuItem>
                        </MenuList>
                      </MenuContent>
                    </Menu>
                  </div>
                )}
              </div>
            </FlexItem>
            <FlexItem>
              <Button 
                variant="control" 
                aria-label="Filter"
                style={{
                  border: '0.5px solid var(--pf-t--global--border--color--default)',
                  padding: '0.5rem',
                  minWidth: '36px',
                  height: '36px'
                }}
              >
                <svg fill="currentColor" height="1em" width="1em" viewBox="0 0 512 512">
                  <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"/>
                </svg>
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant="secondary" isDisabled>Save search</Button>
            </FlexItem>
            <FlexItem>
              <Dropdown
                isOpen={isActionsOpen}
                onSelect={() => setIsActionsOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle 
                    ref={toggleRef} 
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    isExpanded={isActionsOpen}
                    variant="secondary"
                  >
                    Saved searches
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="search1">Search 1</DropdownItem>
                  <DropdownItem key="search2">Search 2</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
            <FlexItem>
              <Divider orientation={{ default: 'vertical' }} />
            </FlexItem>
            <FlexItem>
              <Dropdown
                isOpen={isCreateOpen}
                onSelect={() => setIsCreateOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsCreateOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle 
                    ref={toggleRef} 
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    isExpanded={isCreateOpen}
                    variant="primary"
                  >
                    Create
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="from-template">From template</DropdownItem>
                  <DropdownItem key="from-yaml">From YAML</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </div>
      </div>
      
      <div className={`vm-content-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!isSidebarCollapsed && sidebar}
        
        <Button
          variant="plain"
          className="sidebar-toggle"
          style={{ left: isSidebarCollapsed ? '0' : `${sidebarWidth}px` }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <AngleRightIcon /> : <AngleLeftIcon />}
        </Button>
        
        <div className="vm-main-content">
          <Breadcrumb style={{ marginBottom: '16px' }}>
            <BreadcrumbItem to="#">All clusters</BreadcrumbItem>
            <BreadcrumbItem to="#">Cluster: hub</BreadcrumbItem>
            <BreadcrumbItem to="#" isActive>Project: default</BreadcrumbItem>
          </Breadcrumb>

          <Card style={{ marginBottom: '16px' }}>
            <CardBody>
              <ExpandableSection toggleText="Summary" isExpanded={true}>
                <Flex style={{ marginTop: '16px' }}>
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Flex direction={{ default: 'column' }}>
                      <FlexItem>
                        <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>Virtual Machines (2)</Title>
                      </FlexItem>
                      <FlexItem>
                        <Flex spaceItems={{ default: 'spaceItemsXl' }}>
                          <FlexItem>
                            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)', fontSize: '20px' }}>⚠</FlexItem>
                              <FlexItem style={{ fontSize: '24px', fontWeight: 'bold' }}>0</FlexItem>
                              <FlexItem style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--regular)' }}>Error</FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem style={{ color: 'var(--pf-t--global--icon--color--status--success--default)', fontSize: '20px' }}>⚙</FlexItem>
                              <FlexItem style={{ fontSize: '24px', fontWeight: 'bold' }}>0</FlexItem>
                              <FlexItem style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--regular)' }}>Running</FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem style={{ fontSize: '20px' }}>ⓘ</FlexItem>
                              <FlexItem style={{ fontSize: '24px', fontWeight: 'bold' }}>2</FlexItem>
                              <FlexItem style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--regular)' }}>Stopped</FlexItem>
                            </Flex>
                          </FlexItem>
                          <FlexItem>
                            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                              <FlexItem style={{ fontSize: '20px' }}>◎</FlexItem>
                              <FlexItem style={{ fontSize: '24px', fontWeight: 'bold' }}>0</FlexItem>
                              <FlexItem style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--regular)' }}>Other</FlexItem>
                            </Flex>
                          </FlexItem>
                        </Flex>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  
                  <Divider orientation={{ default: 'vertical' }} style={{ margin: '0 24px' }} />
                  
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <Flex direction={{ default: 'column' }}>
                      <FlexItem>
                        <Title headingLevel="h3" size="md" style={{ marginBottom: '16px' }}>Usage</Title>
                      </FlexItem>
                      <FlexItem>
                        <Grid>
                          <GridItem span={4}>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>CPU</FlexItem>
                              <FlexItem style={{ fontSize: '16px' }}>-</FlexItem>
                              <FlexItem style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '4px' }}>Requested of -</FlexItem>
                            </Flex>
                          </GridItem>
                          <GridItem span={4}>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Memory</FlexItem>
                              <FlexItem style={{ fontSize: '16px' }}>0 B</FlexItem>
                              <FlexItem style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '4px' }}>Used of 0 B</FlexItem>
                            </Flex>
                          </GridItem>
                          <GridItem span={4}>
                            <Flex direction={{ default: 'column' }}>
                              <FlexItem style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Storage</FlexItem>
                              <FlexItem style={{ fontSize: '16px' }}>0 B</FlexItem>
                              <FlexItem style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '4px' }}>Used of 0 B</FlexItem>
                            </Flex>
                          </GridItem>
                        </Grid>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </ExpandableSection>
            </CardBody>
          </Card>
          
          <div className="table-content-card">
            <Toolbar>
              <ToolbarContent style={{ gap: '8px' }}>
                <ToolbarItem>
                  <Checkbox
                    id="select-all-vms"
                    aria-label="Select all VMs"
                    isChecked={selectedVMs.length === mockVMs.length}
                    onChange={(_event, checked) => handleSelectAllVMs(checked)}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isFilterOpen}
                    onSelect={() => setIsFilterOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        isExpanded={isFilterOpen}
                        variant="default"
                      >
                        <FilterIcon style={{ marginRight: '8px' }} />
                        Filter
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="status">Status</DropdownItem>
                      <DropdownItem key="labels">Labels</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <Dropdown
                    isOpen={isMenuToggleOpen}
                    onSelect={() => setIsMenuToggleOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsMenuToggleOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsMenuToggleOpen(!isMenuToggleOpen)}
                        isExpanded={isMenuToggleOpen}
                        variant="default"
                      >
                        Menu toggle
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="option1">Option 1</DropdownItem>
                      <DropdownItem key="option2">Option 2</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search by name"
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                  />
                </ToolbarItem>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Dropdown
                    isOpen={isActionsOpen}
                    onSelect={() => setIsActionsOpen(false)}
                    onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsActionsOpen(!isActionsOpen)}
                        isExpanded={isActionsOpen}
                        variant="plain"
                      >
                        Actions
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="start">Start</DropdownItem>
                      <DropdownItem key="stop">Stop</DropdownItem>
                      <DropdownItem key="delete">Delete</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </ToolbarItem>
                <ToolbarItem>
                  <Pagination
                    itemCount={mockVMs.length}
                    perPage={perPage}
                    page={page}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    variant={PaginationVariant.top}
                    isCompact
                  />
                </ToolbarItem>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ whiteSpace: 'nowrap', color: 'var(--pf-t--global--text--color--regular)' }}>
                      Last updated: {refreshMode === 'auto' ? 'Live' : '13 minutes ago'}
                    </span>
                    <Dropdown
                      isOpen={isRefreshDropdownOpen}
                      onSelect={() => setIsRefreshDropdownOpen(false)}
                      onOpenChange={(isOpen: boolean) => setIsRefreshDropdownOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsRefreshDropdownOpen(!isRefreshDropdownOpen)}
                          isExpanded={isRefreshDropdownOpen}
                          variant="default"
                          aria-label="Refresh settings"
                          icon={refreshMode === 'auto' ? <SyncAltIcon /> : <RedoIcon />}
                        >
                        </MenuToggle>
                      )}
                      popperProps={{ position: 'right' }}
                    >
                      <DropdownList>
                        <DropdownItem
                          key="manual"
                          onClick={() => setRefreshMode('manual')}
                          description="New data only adds when you click to refresh the page."
                        >
                          <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem>
                              <RedoIcon />
                            </FlexItem>
                            <FlexItem>Manual refresh</FlexItem>
                          </Flex>
                        </DropdownItem>
                        <DropdownItem
                          key="auto"
                          onClick={() => setRefreshMode('auto')}
                          description="Keeps your data updated automatically. This setting changes to manual refresh after 10 minutes of inactivity."
                        >
                          <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                            <FlexItem>
                              <SyncAltIcon />
                            </FlexItem>
                            <FlexItem>Auto refresh</FlexItem>
                            {refreshMode === 'auto' && (
                              <FlexItem>
                                <CheckIcon color="var(--pf-t--global--color--brand--default)" />
                              </FlexItem>
                            )}
                          </Flex>
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </div>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            
            <Table aria-label="Virtual machines table" variant="compact">
              <Thead>
                <Tr>
                  <Th></Th>
                  <Th>Name</Th>
                  <Th>Status</Th>
                  <Th>CPU usage</Th>
                  <Th>Memory usage</Th>
                  <Th>Disk usage</Th>
                  <Th>IP address</Th>
                  <Th>Labels</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockVMs.slice((page - 1) * perPage, page * perPage).map((vm) => (
                  <Tr key={vm.id}>
                    <Td>
                      <Checkbox
                        id={`select-vm-${vm.id}`}
                        aria-label={`Select ${vm.name}`}
                        isChecked={selectedVMs.includes(vm.id)}
                        onChange={(_event, checked) => handleSelectVM(vm.id, checked)}
                      />
                    </Td>
                    <Td dataLabel="Name">{vm.name}</Td>
                    <Td dataLabel="Status">
                      <Label color="green">{vm.status}</Label>
                    </Td>
                    <Td dataLabel="CPU usage">{vm.cpu}</Td>
                    <Td dataLabel="Memory usage">{vm.memory}</Td>
                    <Td dataLabel="Disk usage">{vm.disk}</Td>
                    <Td dataLabel="IP address">{vm.ip}</Td>
                    <Td dataLabel="Labels">
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        {vm.labels.slice(0, 2).map((label, idx) => (
                          <FlexItem key={idx}>
                            <Label>{label}</Label>
                          </FlexItem>
                        ))}
                        {vm.moreLabels > 0 && (
                          <FlexItem>
                            <Label>{vm.moreLabels} more</Label>
                          </FlexItem>
                        )}
                      </Flex>
                    </Td>
                    <Td isActionCell>
                      <ActionsColumn items={vmActions(vm)} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={500}
                    perPage={perPage}
                    page={page}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                    variant={PaginationVariant.bottom}
                    perPageOptions={[
                      { title: '10', value: 10 },
                      { title: '20', value: 20 },
                      { title: '50', value: 50 },
                    ]}
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </div>
        </div>
      </div>
    </div>
  );
};

export { VirtualMachines };

