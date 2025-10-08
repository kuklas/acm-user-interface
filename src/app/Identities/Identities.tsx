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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

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
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Service account');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

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
                  <MenuToggle ref={toggleRef} onClick={() => setIsFilterOpen(!isFilterOpen)} isExpanded={isFilterOpen}>
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
              <Th>Name</Th>
              <Th>Identity provider</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockUsers.map((user) => (
              <Tr key={user.id}>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => console.log(`Navigate to user: ${user.username}`)}
                  >
                    {user.name}
                  </Button>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>{user.username}</div>
                </Td>
                <Td dataLabel="Identity provider">{user.identityProvider}</Td>
                <Td dataLabel="Created">{user.created}</Td>
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
            </Tr>
          </Thead>
          <Tbody>
            {mockGroups.map((group) => (
              <Tr key={group.id}>
                <Td dataLabel="Group Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => console.log(`Navigate to group: ${group.name}`)}
                  >
                    {group.name}
                  </Button>
                </Td>
                <Td dataLabel="Members">{group.members}</Td>
                <Td dataLabel="Created">{group.created}</Td>
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

