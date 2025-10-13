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
  ToolbarGroup,
  Divider,
  ButtonVariant,
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
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: 'var(--pf-t--global--border--radius--medium)',
          padding: 'var(--pf-t--global--spacer--md)',
          fontFamily: 'var(--pf-t--global--font--family--mono)',
          fontSize: 'var(--pf-t--global--font--size--body--sm)',
          lineHeight: 'var(--pf-t--global--font--line-height--body)',
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

  const RoleAssignmentsTab = () => {
    // Mock role assignments data - only for dev-team-alpha
    const mockRoleAssignments = groupName === 'dev-team-alpha' ? [
      { id: 1, role: 'kubevirt.io:edit', scope: 'Cluster', resource: 'local-cluster', created: '2024-01-15' },
      { id: 2, role: 'storage-admin', scope: 'Namespace', resource: 'dev-storage', created: '2024-01-18' },
      { id: 3, role: 'network-operator', scope: 'Namespace', resource: 'dev-network', created: '2024-01-20' },
    ] : [];

    if (mockRoleAssignments.length === 0) {
      return (
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
    }

    return (
      <div className="table-content-card">
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                placeholder="Search role assignments"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button variant="primary" onClick={handleCreateRoleAssignment}>
                Create role assignment
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Role assignments table" variant="compact">
          <Thead>
            <Tr>
              <Th width={30}>Role</Th>
              <Th width={20}>Scope</Th>
              <Th width={30}>Resource</Th>
              <Th width={20}>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockRoleAssignments.map((assignment) => (
              <Tr key={assignment.id}>
                <Td dataLabel="Role" width={30}>
                  <Label color="blue">{assignment.role}</Label>
                </Td>
                <Td dataLabel="Scope" width={20}>{assignment.scope}</Td>
                <Td dataLabel="Resource" width={30}>{assignment.resource}</Td>
                <Td dataLabel="Created" width={20}>{assignment.created}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    );
  };

  const UsersTab = () => {
    const mockUsers = [
      { id: 1, name: 'Joydeep Banerjee', username: 'jbanerje', identityProvider: 'LDAP', created: '5 minutes ago' },
      { id: 2, name: 'Anna Walker', username: 'awalker', identityProvider: 'LDAP', created: '1 month ago' },
      { id: 3, name: 'Joshua Packer', username: 'jpacker', identityProvider: 'LDAP', created: '1 month ago' },
      { id: 4, name: 'Sarah Mitchell', username: 'smitchel', identityProvider: 'LDAP', created: '2 weeks ago' },
      { id: 5, name: 'Michael Chen', username: 'mchen', identityProvider: 'LDAP', created: '3 weeks ago' },
    ];

    const [selectedUsers, setSelectedUsers] = React.useState<Set<number>>(new Set());
    const [isBulkActionOpen, setIsBulkActionOpen] = React.useState(false);

    const filteredUsers = mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.username.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedUsers = filteredUsers.slice(
      (page - 1) * perPage,
      page * perPage
    );

    const isAllSelected = selectedUsers.size === filteredUsers.length && filteredUsers.length > 0;
    const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
      } else {
        setSelectedUsers(new Set());
      }
    };

    const handleSelectUser = (userId: number, isSelecting: boolean) => {
      const newSelected = new Set(selectedUsers);
      if (isSelecting) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      setSelectedUsers(newSelected);
    };

    const handleBulkAction = (action: string) => {
      console.log(`Bulk action: ${action} for users:`, Array.from(selectedUsers));
      setIsBulkActionOpen(false);
      // Here you would implement the actual bulk action logic
    };

    const handleAddUser = () => {
      console.log('Add user to group');
      // Implement add user logic
    };

    const handleRemoveUser = () => {
      console.log('Remove selected users from group');
      // Implement remove user logic
    };

    return (
      <Card>
        <CardBody>
          <Toolbar>
            <ToolbarContent>
              {selectedUsers.size > 0 && (
                <>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Content component="p" className="pf-v6-u-font-weight-bold">
                        {selectedUsers.size} selected
                      </Content>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Dropdown
                        isOpen={isBulkActionOpen}
                        onSelect={() => setIsBulkActionOpen(false)}
                        onOpenChange={(isOpen: boolean) => setIsBulkActionOpen(isOpen)}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsBulkActionOpen(!isBulkActionOpen)}
                            isExpanded={isBulkActionOpen}
                            variant="primary"
                          >
                            Actions
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="remove" onClick={() => handleBulkAction('remove')}>
                            Remove from group
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                  </ToolbarGroup>
                  <ToolbarItem>
                    <Divider orientation={{ default: 'vertical' }} />
                  </ToolbarItem>
                </>
              )}
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
              <ToolbarItem>
                <Button variant={ButtonVariant.primary} onClick={handleAddUser}>
                  Add user
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.secondary} onClick={handleRemoveUser}>
                  Remove user
                </Button>
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }}>
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
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: isAllSelected,
                }}
              />
                <Th width={40} sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about user names">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 1, sortBy: { index: 1, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Identity provider</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about identity providers">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={20} sort={{ columnIndex: 2, sortBy: { index: 2, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Created</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about creation date">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th width={10}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedUsers.map((user) => (
                <Tr key={user.id}>
                  <Td
                    select={{
                      rowIndex: user.id,
                      onSelect: (_event, isSelecting) => handleSelectUser(user.id, isSelecting),
                      isSelected: selectedUsers.has(user.id),
                    }}
                  />
                  <Td dataLabel="Name">
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: 'var(--pf-t--global--color--brand--default)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--pf-t--global--color--nonstatus--white--default)',
                          fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                          fontSize: 'var(--pf-t--global--font--size--body--default)'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <div>
                          <Button variant="link" isInline className="pf-v6-u-p-0">
                            {user.name}
                          </Button>
                          <div className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                            {user.username}
                          </div>
                        </div>
                      </FlexItem>
                    </Flex>
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

          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexEnd' }} className="pf-v6-u-mb-md">
            <FlexItem>
              <Title headingLevel="h1" size="lg">
                {groupName}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </FlexItem>
          </Flex>

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
