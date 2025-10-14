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
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getAllGroups, getAllServiceAccounts } from '@app/data';

// Get data from centralized database
const dbUsers = getAllUsers();
const dbGroups = getAllGroups();
const dbServiceAccounts = getAllServiceAccounts();

// Transform users from database to component format
const mockUsers = dbUsers.map((user, index) => ({
  id: index + 1,
  name: `${user.firstName} ${user.lastName}`,
  username: user.username,
  identityProvider: 'LDAP',
  created: new Date(user.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}));

// Transform groups from database to component format
const mockGroups = dbGroups.map((group, index) => ({
  id: index + 1,
  name: group.name,
  members: group.userIds.length,
  created: '2024-01-15', // Could be added to schema later
}));

// Transform service accounts from database to component format
const mockServiceAccounts = dbServiceAccounts.map((sa, index) => ({
  id: index + 1,
  name: sa.name,
  users: 0, // Service accounts don't have users
  created: new Date(sa.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}));

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
  const [usersPage, setUsersPage] = React.useState(1);
  const [usersPerPage, setUsersPerPage] = React.useState(10);
  const [groupsPage, setGroupsPage] = React.useState(1);
  const [groupsPerPage, setGroupsPerPage] = React.useState(10);

  React.useEffect(() => {
    console.log('[Identities] openUserActionMenuId state changed to:', openUserActionMenuId);
  }, [openUserActionMenuId]);

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

  const toggleUserActionMenu = React.useCallback((userId: number) => {
    console.log('[Identities] Toggling user action menu for userId:', userId);
    setOpenUserActionMenuId(prev => {
      const newValue = prev === userId ? null : userId;
      console.log('[Identities] openUserActionMenuId changed from', prev, 'to', newValue);
      return newValue;
    });
  }, []);

  const toggleGroupActionMenu = React.useCallback((groupId: number) => {
    setOpenGroupActionMenuId(prev => prev === groupId ? null : groupId);
  }, []);

  const handleImpersonateUser = React.useCallback((userName: string) => {
    console.log('Impersonate user:', userName);
    setOpenUserActionMenuId(null);
  }, []);

  const handleImpersonateGroup = React.useCallback((groupName: string) => {
    console.log('Impersonate group:', groupName);
    setOpenGroupActionMenuId(null);
  }, []);

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

  const UsersTable = () => {
    const paginatedUsers = mockUsers.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);
    
    return (
    <>
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search users"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={mockUsers.length}
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
              <Th>Name</Th>
              <Th>Identity provider</Th>
              <Th>Created</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedUsers.map((user) => (
              <Tr key={user.id}>
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
                    onOpenChange={(isOpen: boolean) => {
                      if (!isOpen) {
                        setOpenUserActionMenuId(null);
                      }
                    }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="Actions menu"
                        variant="plain"
                        onClick={() => toggleUserActionMenu(user.id)}
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
        <div style={{ padding: '16px' }}>
          <Pagination
            itemCount={mockUsers.length}
            perPage={usersPerPage}
            page={usersPage}
            onSetPage={(_event, pageNumber) => setUsersPage(pageNumber)}
            onPerPageSelect={(_event, perPage) => {
              setUsersPerPage(perPage);
              setUsersPage(1);
            }}
            variant={PaginationVariant.bottom}
          />
        </div>
      </div>
    </>
    );
  };

  const GroupsTable = () => {
    const paginatedGroups = mockGroups.slice((groupsPage - 1) * groupsPerPage, groupsPage * groupsPerPage);
    
    return (
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
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={mockGroups.length}
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
              <Th>Group Name</Th>
              <Th>Members</Th>
              <Th>Created</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedGroups.map((group) => (
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
        <div style={{ padding: '16px' }}>
          <Pagination
            itemCount={mockGroups.length}
            perPage={groupsPerPage}
            page={groupsPage}
            onSetPage={(_event, pageNumber) => setGroupsPage(pageNumber)}
            onPerPageSelect={(_event, perPage) => {
              setGroupsPerPage(perPage);
              setGroupsPage(1);
            }}
            variant={PaginationVariant.bottom}
          />
        </div>
      </div>
    </>
    );
  };

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

