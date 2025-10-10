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
} from '@patternfly/react-core';
import { CubesIcon, FilterIcon, InfoCircleIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const IdentityDetail: React.FunctionComponent = () => {
  const { identityName } = useParams<{ identityName: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  
  useDocumentTitle(`ACM | ${identityName}`);

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
            <DescriptionListTerm>Full name</DescriptionListTerm>
            <DescriptionListDescription>{identityName}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Username</DescriptionListTerm>
            <DescriptionListDescription>{identityName?.toLowerCase().replace(/\s+/g, '')}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Identity provider</DescriptionListTerm>
            <DescriptionListDescription>LDAP</DescriptionListDescription>
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
{`kind: User
apiVersion: user.openshift.io/v1
metadata:
  name: ${identityName?.toLowerCase().replace(/\s+/g, '')}
  uid: b502a610-33cf-4f31-b404-e0b4fe7c29a5
  resourceVersion: '8608445'
  creationTimestamp: '2025-07-23T06:12:36Z'
managedFields:
  - manager: htpasswd
    operation: Update
    apiVersion: user.openshift.io/v1
    time: '2025-07-23T06:12:36Z'
    fieldsType: FieldsV1
    fieldsV1:
      f:identities: {}
identities:
  - 'htpasswd:${identityName?.toLowerCase().replace(/\s+/g, '')}'
groups: null`}
          </pre>
        </div>
      </CardBody>
    </Card>
  );

  const RoleAssignmentsTab = () => (
    <div className="table-content-card">
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
    </div>
  );

  const GroupsTab = () => {
    const mockGroups = [
      { id: 1, name: 'Security team', created: '1/9/2025, 3:15:28 PM' },
    ];

    const filteredGroups = mockGroups.filter(group =>
      group.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const paginatedGroups = filteredGroups.slice(
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
                      <FilterIcon /> Filter
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all">All groups</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder="Search for role assignment"
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
              <ToolbarItem>
                <Button variant="plain" aria-label="Actions">
                  Actions
                </Button>
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <span>1-1 of 1</span>
              </ToolbarItem>
              <ToolbarItem>
                <Pagination
                  itemCount={filteredGroups.length}
                  page={page}
                  perPage={perPage}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant={PaginationVariant.top}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          
          <Table aria-label="Groups table" variant="compact">
            <Thead>
              <Tr>
                <Th sort={{ columnIndex: 0, sortBy: { index: 0, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Name</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about group names">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
                <Th sort={{ columnIndex: 1, sortBy: { index: 1, direction: 'asc' } }}>
                  <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>Created</FlexItem>
                    <FlexItem>
                      <Tooltip content="Information about creation date">
                        <InfoCircleIcon />
                      </Tooltip>
                    </FlexItem>
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedGroups.map((group) => (
                <Tr key={group.id}>
                  <Td dataLabel="Name">
                    <Button variant="link" isInline>
                      {group.name}
                    </Button>
                  </Td>
                  <Td dataLabel="Created">{group.created}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem align={{ default: 'alignEnd' }}>
                <Pagination
                  itemCount={filteredGroups.length}
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

  const UsersTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <Content component="p">
            Users for {identityName}
          </Content>
        </CardBody>
      </Card>
    </div>
  );

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
              Users, Groups and Service accounts
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{identityName}</BreadcrumbItem>
          </Breadcrumb>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div>
              <Title headingLevel="h1" size="lg">
                {identityName}
              </Title>
              <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                {identityName?.toLowerCase().replace(/\s+/g, '')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </div>
          </div>

          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Identity detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab" />
            <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab" />
            <Tab eventKey={2} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab" />
            <Tab eventKey={3} title={<TabTitleText>Groups</TabTitleText>} aria-label="Groups tab" />
          </Tabs>
        </div>

        <div className="page-content-section">
          {activeTabKey === 0 && <DetailsTab />}
          {activeTabKey === 1 && <YAMLTab />}
          {activeTabKey === 2 && <RoleAssignmentsTab />}
          {activeTabKey === 3 && <GroupsTab />}
        </div>
      </div>

      <RoleAssignmentWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)}
        context="identities"
        preselectedIdentity={{
          type: 'user',
          id: 1,
          name: identityName || 'Unknown'
        }}
      />
    </>
  );
};

export { IdentityDetail };

