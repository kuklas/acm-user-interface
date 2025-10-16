import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Label,
  Split,
  SplitItem,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Checkbox,
  ToggleGroup,
  ToggleGroupItem,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';
import { getAllRoles } from '@app/data';

// Get roles from centralized database
const dbRoles = getAllRoles();

// Transform roles from database to component format
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

const Roles: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Roles');
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [typeFilter, setTypeFilter] = React.useState<'All' | 'Default' | 'Custom'>('All');
  const [sortBy, setSortBy] = React.useState<{
    index: number;
    direction: 'asc' | 'desc';
  }>({ index: 0, direction: 'asc' });
  const [selectedRoles, setSelectedRoles] = React.useState<Set<number>>(new Set());
  const [openActionMenuId, setOpenActionMenuId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const availablePermissions = ['create', 'delete', 'get', 'list', 'patch', 'update', 'watch'];

  const handleCreateRole = () => {
    navigate('/user-management/roles/create');
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setNewRoleName('');
    setSelectedPermissions([]);
  };

  const handleSaveRole = () => {
    // In a real application, this would make an API call
    console.log('Creating role:', { name: newRoleName, permissions: selectedPermissions });
    handleModalClose();
  };

  const handlePermissionChange = (checked: boolean, permission: string) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
    }
  };

  const handleSort = (_event: React.MouseEvent, columnIndex: number, direction: 'asc' | 'desc') => {
    setSortBy({ index: columnIndex, direction });
  };

  const sortedRoles = React.useMemo(() => {
    // Filter by type first
    const filtered = typeFilter === 'All' 
      ? mockRoles 
      : mockRoles.filter(role => role.type === typeFilter);
    
    // Then sort
    const sorted = [...filtered];
    if (sortBy.index === 0) {
      sorted.sort((a, b) => {
        const comparison = a.displayName.localeCompare(b.displayName);
        return sortBy.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  }, [sortBy, typeFilter]);

  const paginatedRoles = sortedRoles.slice((page - 1) * perPage, page * perPage);

  const isAllSelected = paginatedRoles.length > 0 && paginatedRoles.every(role => selectedRoles.has(role.id));
  const isPartiallySelected = selectedRoles.size > 0 && !isAllSelected;

  const handleSelectAll = (isSelecting: boolean) => {
    const newSelected = new Set(selectedRoles);
    if (isSelecting) {
      paginatedRoles.forEach(role => newSelected.add(role.id));
    } else {
      paginatedRoles.forEach(role => newSelected.delete(role.id));
    }
    setSelectedRoles(newSelected);
  };

  const handleSelectRole = (roleId: number, isSelecting: boolean) => {
    const newSelected = new Set(selectedRoles);
    if (isSelecting) {
      newSelected.add(roleId);
    } else {
      newSelected.delete(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const handleDeleteRoles = () => {
    console.log('Delete roles:', Array.from(selectedRoles));
    // Implement delete logic here
    setSelectedRoles(new Set());
  };

  const handleDuplicateRole = (roleId: number, roleName: string) => {
    console.log('Duplicate role:', roleId, roleName);
    // In a real application, this would duplicate the role
    setOpenActionMenuId(null);
  };

  const handleDeleteRole = (roleId: number, roleName: string) => {
    console.log('Delete role:', roleId, roleName);
    // In a real application, this would delete the role
    setOpenActionMenuId(null);
  };

  const toggleActionMenu = (roleId: number) => {
    setOpenActionMenuId(openActionMenuId === roleId ? null : roleId);
  };

  return (
    <>
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search roles"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup aria-label="Role type filter">
                <ToggleGroupItem
                  text="All"
                  buttonId="all-toggle"
                  isSelected={typeFilter === 'All'}
                  onChange={() => setTypeFilter('All')}
                />
                <ToggleGroupItem
                  text="Default"
                  buttonId="default-toggle"
                  isSelected={typeFilter === 'Default'}
                  onChange={() => setTypeFilter('Default')}
                />
                <ToggleGroupItem
                  text="Custom"
                  buttonId="custom-toggle"
                  isSelected={typeFilter === 'Custom'}
                  onChange={() => setTypeFilter('Custom')}
                />
              </ToggleGroup>
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary" onClick={handleCreateRole}>
                Create Custom Role
              </Button>
            </ToolbarItem>
            <ToolbarItem>
              <Button 
                variant="secondary" 
                onClick={handleDeleteRoles}
                isDisabled={selectedRoles.size === 0}
              >
                Delete role
              </Button>
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={sortedRoles.length}
                perPage={perPage}
                page={page}
                onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                onPerPageSelect={(_event, newPerPage) => {
                  setPerPage(newPerPage);
                  setPage(1);
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
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: isAllSelected,
                }}
              />
              <Th 
                width={30}
                sort={{ 
                  sortBy, 
                  onSort: handleSort, 
                  columnIndex: 0 
                }}
              >
                Role
              </Th>
              <Th width={15}>Type</Th>
              <Th width={25}>Resources</Th>
              <Th width={20}>Permissions</Th>
              <Th width={10}></Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedRoles.map((role) => (
              <Tr key={role.id}>
                <Td
                  select={{
                    rowIndex: role.id,
                    onSelect: (_event, isSelecting) => handleSelectRole(role.id, isSelecting),
                    isSelected: selectedRoles.has(role.id),
                  }}
                />
                <Td dataLabel="Role" width={30} style={{ textAlign: 'left' }}>
                  <div>
                    <Button 
                      variant="link" 
                      isInline 
                      onClick={() => navigate(`/user-management/roles/${role.name}`)} 
                      style={{ paddingLeft: 0, display: 'block' }}
                    >
                      {role.displayName}
                    </Button>
                    <div style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                      {role.name}
                    </div>
                  </div>
                </Td>
                <Td dataLabel="Type" width={15}>
                  <Label color={role.type === 'Default' ? 'blue' : 'green'}>{role.type}</Label>
                </Td>
                <Td dataLabel="Resources" width={25}>{role.resources.join(', ')}</Td>
                <Td dataLabel="Permissions" width={20}>
                  <Split hasGutter>
                    {role.permissions.slice(0, 3).map((perm) => (
                      <SplitItem key={perm}>
                        <Label isCompact>{perm}</Label>
                      </SplitItem>
                    ))}
                    {role.permissions.length > 3 && (
                      <SplitItem>
                        <Label isCompact>+{role.permissions.length - 3} more</Label>
                      </SplitItem>
                    )}
                  </Split>
                </Td>
                <Td dataLabel="Actions" width={10} style={{ textAlign: 'right' }}>
                  <Dropdown
                    isOpen={openActionMenuId === role.id}
                    onSelect={() => setOpenActionMenuId(null)}
                    onOpenChange={(isOpen: boolean) => !isOpen && setOpenActionMenuId(null)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="Actions menu"
                        variant="plain"
                        onClick={() => toggleActionMenu(role.id)}
                        isExpanded={openActionMenuId === role.id}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      <DropdownItem
                        key="duplicate"
                        onClick={() => handleDuplicateRole(role.id, role.name)}
                      >
                        Duplicate role
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onClick={() => handleDeleteRole(role.id, role.name)}
                      >
                        Delete role
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div style={{ padding: '16px' }}>
          <Pagination
            itemCount={sortedRoles.length}
            perPage={perPage}
            page={page}
            onSetPage={(_event, pageNumber) => setPage(pageNumber)}
            onPerPageSelect={(_event, newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
            variant={PaginationVariant.bottom}
          />
        </div>
      </div>

      <Modal
        variant={ModalVariant.medium}
        title="Create Custom Role"
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
      >
        <Form>
          <FormGroup label="Role Name" isRequired fieldId="role-name">
            <TextInput
              isRequired
              type="text"
              id="role-name"
              name="role-name"
              value={newRoleName}
              onChange={(_event, value) => setNewRoleName(value)}
            />
          </FormGroup>
          <FormGroup label="Permissions" isRequired fieldId="permissions">
            {availablePermissions.map((permission) => (
              <Checkbox
                key={permission}
                label={permission}
                id={`permission-${permission}`}
                isChecked={selectedPermissions.includes(permission)}
                onChange={(_event, checked) => handlePermissionChange(checked, permission)}
              />
            ))}
          </FormGroup>
        </Form>
        <div className="pf-v6-u-mt-md">
          <Button variant="primary" onClick={handleSaveRole}>
            Create
          </Button>{' '}
          <Button variant="link" onClick={handleModalClose}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export { Roles };

