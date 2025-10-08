import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Content,
  Breadcrumb,
  BreadcrumbItem,
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
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Service account');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const UsersTable = () => (
    <>
      <Content component="p" className="pf-v6-u-mb-md">
        Manage all identities including users, groups, and service accounts in one place. Assign access individually or by group, where users automatically inherit their group's permissions.
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
                    onClick={() => navigate(`/user-management/identities/${user.username}`)}
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
                    onClick={() => navigate(`/user-management/identities/${group.name}`)}
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
                    onClick={() => navigate(`/user-management/identities/${sa.name}`)}
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

  return (
    <PageSection>
      <div className="page-header-section">
        <Breadcrumb className="pf-v6-u-mb-md">
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/user-management'); }}>
            User management
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Identities</BreadcrumbItem>
        </Breadcrumb>

        <Title headingLevel="h1" size="lg">
          Identities
        </Title>
        
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Identity tabs">
          <Tab eventKey={0} title={<TabTitleText>Users</TabTitleText>} aria-label="Users tab">
            <div className="page-content-section">
              <UsersTable />
            </div>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Groups</TabTitleText>} aria-label="Groups tab">
            <div className="page-content-section">
              <GroupsTable />
            </div>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Service Accounts</TabTitleText>} aria-label="Service accounts tab">
            <div className="page-content-section">
              <ServiceAccountsTable />
            </div>
          </Tab>
        </Tabs>
      </div>
    </PageSection>
  );
};

export { Identities };

