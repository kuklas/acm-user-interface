import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Content,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownList,
  DropdownItem,
  Checkbox,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Mock data for service accounts matching the screenshot
const mockServiceAccounts = [
  { id: 1, name: 'dev-team-alpha', users: 5, created: '5 minutes ago' },
  { id: 2, name: 'dev-team-vm-editors', users: 1, created: '5 minutes ago' },
  { id: 3, name: 'dev-team-vm-admins', users: 13, created: '5 minutes ago' },
  { id: 4, name: 'dev-team-vm-viewers', users: 13, created: '5 minutes ago' },
  { id: 5, name: 'prod-cluster-admins', users: 13, created: '5 minutes ago' },
];

// Mock data for users matching the OpenShift screenshot
const mockUsers = [
  { id: 1, name: 'Joydeep Banerjee', username: 'jbanerje', identityProvider: 'LDAP', created: '5 minutes ago' },
  { id: 2, name: 'awaltez', username: 'awaltez', identityProvider: 'LDAP', created: '1 month ago' },
  { id: 3, name: 'Joshua Packer', username: 'jpacker', identityProvider: 'LDAP', created: '1 month ago' },
];

// Mock data for groups
const mockGroups = [
  { id: 1, name: 'cluster-admins', members: 5, created: '2024-01-15' },
  { id: 2, name: 'developers', members: 12, created: '2024-01-10' },
  { id: 3, name: 'operators', members: 8, created: '2024-02-01' },
  { id: 4, name: 'viewers', members: 20, created: '2024-01-20' },
];

const Identities: React.FunctionComponent = () => {
  useDocumentTitle('ACM | Identities');
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('User');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<number[]>([]);
  const [openUserActionMenuId, setOpenUserActionMenuId] = React.useState<number | null>(null);
  const [openGroupActionMenuId, setOpenGroupActionMenuId] = React.useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = React.useState<number[]>([]);
  const [selectedServiceAccounts, setSelectedServiceAccounts] = React.useState<number[]>([]);

  const handleUserSelect = (userId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAllUsers = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(mockUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUserActionMenu = (userId: number) => {
    console.log('toggleUserActionMenu called for userId:', userId, 'current openUserActionMenuId:', openUserActionMenuId);
    setOpenUserActionMenuId(openUserActionMenuId === userId ? null : userId);
  };

  const toggleGroupActionMenu = (groupId: number) => {
    setOpenGroupActionMenuId(openGroupActionMenuId === groupId ? null : groupId);
  };

  const handleImpersonateUser = (userName: string) => {
    console.log('Impersonate user:', userName);
    setOpenUserActionMenuId(null);
  };

  const handleImpersonateGroup = (groupName: string) => {
    console.log('Impersonate group:', groupName);
    setOpenGroupActionMenuId(null);
  };

  const handleGroupSelect = (groupId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedGroups([...selectedGroups, groupId]);
    } else {
      setSelectedGroups(selectedGroups.filter(id => id !== groupId));
    }
  };

  const handleSelectAllGroups = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedGroups(mockGroups.map(group => group.id));
    } else {
      setSelectedGroups([]);
    }
  };

  const handleServiceAccountSelect = (saId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedServiceAccounts([...selectedServiceAccounts, saId]);
    } else {
      setSelectedServiceAccounts(selectedServiceAccounts.filter(id => id !== saId));
    }
  };

  const handleSelectAllServiceAccounts = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedServiceAccounts(mockServiceAccounts.map(sa => sa.id));
    } else {
      setSelectedServiceAccounts([]);
    }
  };

  const UsersTable = () => (
    <>
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
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
                    {filterType}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="User" onClick={() => setFilterType('User')}>
                    User
                  </DropdownItem>
                  <DropdownItem value="Service account" onClick={() => setFilterType('Service account')}>
                    Service account
                  </DropdownItem>
                  <DropdownItem value="Group" onClick={() => setFilterType('Group')}>
                    Group
                  </DropdownItem>
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
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Users table" variant="compact">
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  id="select-all-users"
                  isChecked={selectedUsers.length === mockUsers.length && mockUsers.length > 0}
                  onChange={(event, checked) => handleSelectAllUsers(checked)}
                  aria-label="Select all users"
                  style={{ transform: 'scale(0.7)', border: '2px solid red' }}
                />
              </Th>
              <Th>Name</Th>
              <Th>Identity provider</Th>
              <Th>Created</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockUsers.map((user) => (
              <Tr key={user.id}>
                <Td>
                  <Checkbox
                    id={`select-user-${user.id}`}
                    isChecked={selectedUsers.includes(user.id)}
                    onChange={(event, checked) => handleUserSelect(user.id, checked)}
                    aria-label={`Select ${user.name}`}
                    style={{ transform: 'scale(0.7)', border: '2px solid red' }}
                  />
                </Td>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigate(`/user-management/identities/${user.name}`)}
                  >
                    {user.name}
                  </Button>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>{user.username}</div>
                </Td>
                <Td dataLabel="Identity provider">{user.identityProvider}</Td>
                <Td dataLabel="Created">{user.created}</Td>
                <Td dataLabel="Actions" style={{ textAlign: 'right' }}>
                  <Dropdown
                    isOpen={openUserActionMenuId === user.id}
                    onSelect={() => setOpenUserActionMenuId(null)}
                    onOpenChange={(isOpen: boolean) => !isOpen && setOpenUserActionMenuId(null)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="Actions menu"
                        variant="plain"
                        onClick={() => {
                          console.log('MenuToggle clicked for user:', user.name);
                          toggleUserActionMenu(user.id);
                        }}
                        isExpanded={openUserActionMenuId === user.id}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      <DropdownItem
                        key="impersonate"
                        onClick={() => handleImpersonateUser(user.name)}
                      >
                        Impersonate
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );

  const GroupsTable = () => (
    <>
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search groups"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Groups table" variant="compact">
          <Thead>
            <Tr>
              <Th>Group Name</Th>
              <Th>Members</Th>
              <Th>Created</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockGroups.map((group) => (
              <Tr key={group.id}>
                <Td dataLabel="Group Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigate(`/user-management/groups/${group.name}`)}
                  >
                    {group.name}
                  </Button>
                </Td>
                <Td dataLabel="Members">{group.members}</Td>
                <Td dataLabel="Created">{group.created}</Td>
                <Td dataLabel="Actions" style={{ textAlign: 'right' }}>
                  <Dropdown
                    isOpen={openGroupActionMenuId === group.id}
                    onSelect={() => setOpenGroupActionMenuId(null)}
                    onOpenChange={(isOpen: boolean) => {
                      if (!isOpen) {
                        setOpenGroupActionMenuId(null);
                      }
                    }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="Actions menu"
                        variant="plain"
                        onClick={() => toggleGroupActionMenu(group.id)}
                        isExpanded={openGroupActionMenuId === group.id}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      <DropdownItem
                        key="impersonate"
                        onClick={() => handleImpersonateGroup(group.name)}
                      >
                        Impersonate
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );

  const ServiceAccountsTable = () => (
    <>
      <Content component="p" className="pf-v6-u-mb-md">
        Manage all types of identities, including people, groups, and service accounts. Assign permissions to individuals or groups, where users automatically inherit their group's access.
      </Content>
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <Dropdown
                isOpen={isFilterOpen}
                onSelect={() => setIsFilterOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsFilterOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle ref={toggleRef} onClick={() => setIsFilterOpen(!isFilterOpen)} isExpanded={isFilterOpen}>
                    Service account
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="User" onClick={() => setFilterType('User')}>
                    User
                  </DropdownItem>
                  <DropdownItem value="Service account" onClick={() => setFilterType('Service account')}>
                    Service account
                  </DropdownItem>
                  <DropdownItem value="Group" onClick={() => setFilterType('Group')}>
                    Group
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search for a service account"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Service accounts table" variant="compact">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Users</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockServiceAccounts.map((sa) => (
              <Tr key={sa.id}>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => console.log(`Navigate to service account: ${sa.name}`)}
                  >
                    {sa.name}
                  </Button>
                </Td>
                <Td dataLabel="Users">{sa.users}</Td>
                <Td dataLabel="Created">{sa.created}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </>
  );

  return <UsersTable />;
};

export { Identities };

