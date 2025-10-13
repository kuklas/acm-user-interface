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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Mock data for Roles
const mockRoles = [
  {
    id: 1,
    name: 'kubevirt.io:admin',
    type: 'Default',
    resources: ['VirtualMachines', 'VirtualMachineInstances'],
    permissions: ['create', 'delete', 'get', 'list', 'patch', 'update'],
  },
  {
    id: 2,
    name: 'kubevirt.io:edit',
    type: 'Default',
    resources: ['VirtualMachines'],
    permissions: ['get', 'list', 'patch', 'update'],
  },
  {
    id: 3,
    name: 'kubevirt.io:view',
    type: 'Default',
    resources: ['VirtualMachines', 'VirtualMachineInstances'],
    permissions: ['get', 'list'],
  },
  {
    id: 4,
    name: 'custom-vm-operator',
    type: 'Custom',
    resources: ['VirtualMachines'],
    permissions: ['get', 'list', 'update'],
  },
];

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
        const comparison = a.name.localeCompare(b.name);
        return sortBy.direction === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  }, [sortBy, typeFilter]);

  const isAllSelected = selectedRoles.size === sortedRoles.length && sortedRoles.length > 0;
  const isPartiallySelected = selectedRoles.size > 0 && selectedRoles.size < sortedRoles.length;

  const handleSelectAll = (isSelecting: boolean) => {
    if (isSelecting) {
      setSelectedRoles(new Set(sortedRoles.map(role => role.id)));
    } else {
      setSelectedRoles(new Set());
    }
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
                Role Name
              </Th>
              <Th width={15}>Type</Th>
              <Th width={30}>Resources</Th>
              <Th width={25}>Permissions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedRoles.map((role) => (
              <Tr key={role.id}>
                <Td
                  select={{
                    rowIndex: role.id,
                    onSelect: (_event, isSelecting) => handleSelectRole(role.id, isSelecting),
                    isSelected: selectedRoles.has(role.id),
                  }}
                />
                <Td dataLabel="Role Name" width={30} style={{ textAlign: 'left' }}>
                  <Button 
                    variant="link" 
                    isInline 
                    onClick={() => navigate(`/user-management/roles/${role.name}`)} 
                    style={{ paddingLeft: 0 }}
                  >
                    {role.name}
                  </Button>
                </Td>
                <Td dataLabel="Type" width={15}>
                  <Label color={role.type === 'Default' ? 'blue' : 'green'}>{role.type}</Label>
                </Td>
                <Td dataLabel="Resources" width={30}>{role.resources.join(', ')}</Td>
                <Td dataLabel="Permissions" width={25}>
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
              </Tr>
            ))}
          </Tbody>
        </Table>
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

