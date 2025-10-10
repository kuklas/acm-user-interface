import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Content,
  Card,
  CardBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Pagination,
  PaginationVariant,
  Flex,
  FlexItem,
  Icon,
  Tooltip,
  Label,
} from '@patternfly/react-core';
import { CubesIcon, FilterIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const GroupDetail: React.FunctionComponent = () => {
  const { groupName } = useParams<{ groupName: string }>();
  const navigate = useNavigate();
  
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  
  useDocumentTitle(`ACM | ${groupName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
  };

  const DetailsTab = () => (
    <Card>
      <CardBody>
        <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
          General information
        </Title>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>Group name</DescriptionListTerm>
            <DescriptionListDescription>{groupName}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardBody>
    </Card>
  );

  const YAMLTab = () => (
    <Card>
      <CardBody>
        <div style={{ 
          backgroundColor: '#f8f8f8', 
          border: '1px solid #d2d2d2', 
          borderRadius: '4px',
          padding: '1rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          overflow: 'auto',
          maxHeight: '400px'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
{`kind: Group
apiVersion: user.openshift.io/v1
metadata:
  name: ${groupName?.toLowerCase().replace(/\s+/g, '-')}
  uid: 78d9f67c-e1da-431c-947a-b053adb39001
  resourceVersion: '9570553'
  creationTimestamp: '2025-07-24T02:08:30Z'
  labels:
    app: frontend
managedFields:
  - manager: htpasswd
    operation: Update
    apiVersion: user.openshift.io/v1
    time: '2025-07-24T02:08:30Z'
    fieldsType: FieldsV1
    fieldsV1:
      f:users: {}
users:
  - user1
  - user2`}
          </pre>
        </div>
      </CardBody>
    </Card>
  );

  const RoleAssignmentsTab = () => (
    <Card>
      <CardBody>
        <EmptyState>
          <CubesIcon />
          <Title headingLevel="h2" size="lg">
            No role assignment created yet
          </Title>
          <EmptyStateBody>
            Description text that allows users to easily understand what this is for and how does it help them achieve their needs.
          </EmptyStateBody>
          <EmptyStateActions>
            <Button variant="primary" onClick={handleCreateRoleAssignment}>
              Create role assignment
            </Button>
          </EmptyStateActions>
          <EmptyStateBody>
            <Button component="a" href="#" variant="link">
              Link to documentation
            </Button>
          </EmptyStateBody>
        </EmptyState>
      </CardBody>
    </Card>
  );

  const UsersTab = () => {
    const mockUsers = [
      { id: 1, name: 'Joydeep Banerjee', username: 'jbanerje', identityProvider: 'LDAP', created: '5 minutes ago' },
      { id: 2, name: 'Anna Walker', username: 'awalker', identityProvider: 'LDAP', created: '1 month ago' },
      { id: 3, name: 'Joshua Packer', username: 'jpacker', identityProvider: 'LDAP', created: '1 month ago' },
    ];

    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
      (page - 1) * perPage,
      page * perPage
    );

    return (
      <Card>
        <CardBody>
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
                      variant="plain"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      isExpanded={isFilterOpen}
                    >
                      <FilterIcon /> User
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all">All users</DropdownItem>
                    <DropdownItem key="ldap">LDAP</DropdownItem>
                    <DropdownItem key="local">Local</DropdownItem>
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
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <span>1-3 of 3</span>
              </ToolbarItem>
              <ToolbarItem>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.top}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          
          <Table aria-label="Users table" variant="compact">
            <Thead>
              <Tr>
                <Th sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about user names">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th sort={{ columnIndex: 1, sortBy: { index: 1, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Identity provider</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about identity providers">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th sort={{ columnIndex: 2, sortBy: { index: 2, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Created</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about creation date">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedUsers.map((user) => (
                <Tr key={user.id}>
                  <Td dataLabel="Name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: '#f0ab00', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <Button variant="link" isInline>
                          {user.name}
                        </Button>
                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {user.username}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td dataLabel="Identity provider">
                    <Label color="blue">{user.identityProvider}</Label>
                  </Td>
                  <Td dataLabel="Created">{user.created}</Td>
                  <Td dataLabel="Actions">
                    <Button variant="plain" aria-label="Actions">
                      <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredUsers.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.bottom}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <div className="identities-page-container">
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              User management
            </BreadcrumbItem>
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              Identities
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{groupName}</BreadcrumbItem>
          </Breadcrumb>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div>
              <Title headingLevel="h1" size="lg">
                {groupName}
              </Title>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </div>
          </div>

          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Group detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab" />
            <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab" />
            <Tab eventKey={2} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
            <Tab eventKey={3} title={<TabTitleText>Users</TabTitleText>} aria-label="Users tab" />
          </Tabs>
        </div>

        <div className="page-content-section">
          {activeTabKey === 0 && <DetailsTab />}
          {activeTabKey === 1 && <YAMLTab />}
          {activeTabKey === 2 && <RoleAssignmentsTab />}
          {activeTabKey === 3 && <UsersTab />}
        </div>
      </div>

      <RoleAssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)}
        context="identities"
        preselectedIdentity={{
          type: 'group',
          id: 1,
          name: groupName || 'Unknown'
        }}
      />
    </>
  );
};

export { GroupDetail };
