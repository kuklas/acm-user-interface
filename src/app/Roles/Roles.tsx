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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

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
  const [searchValue, setSearchValue] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<{
    id: number;
    name: string;
    type: string;
  } | null>(null);

  const availablePermissions = ['create', 'delete', 'get', 'list', 'patch', 'update', 'watch'];

  const handleCreateRole = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateRoleAssignment = (role: { id: number; name: string; type: string }) => {
    setSelectedRole(role);
    setIsWizardOpen(true);
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
              <Button variant="primary" icon={<PlusCircleIcon />} onClick={handleCreateRole}>
                Create Custom Role
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Roles table" variant="compact">
          <Thead>
            <Tr>
              <Th>Role Name</Th>
              <Th>Type</Th>
              <Th>Resources</Th>
              <Th>Permissions</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockRoles.map((role) => (
              <Tr key={role.id}>
                <Td dataLabel="Role Name">{role.name}</Td>
                <Td dataLabel="Type">
                  <Label color={role.type === 'Default' ? 'blue' : 'green'}>{role.type}</Label>
                </Td>
                <Td dataLabel="Resources">{role.resources.join(', ')}</Td>
                <Td dataLabel="Permissions">
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
                <Td dataLabel="Actions">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => handleCreateRoleAssignment({ id: role.id, name: role.name, type: role.type })}
                  >
                    Create role assignment
                  </Button>
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

      <RoleAssignmentWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedRole(null);
        }}
        context="roles"
        preselectedRole={selectedRole || undefined}
      />
    </>
  );
};

export { Roles };

