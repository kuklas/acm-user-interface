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
  Flex,
  FlexItem,
  Icon,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  ToolbarGroup,
  Divider,
  ButtonVariant,
} from '@patternfly/react-core';
import { CubesIcon, FilterIcon } from '@patternfly/react-icons';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const IdentityDetail: React.FunctionComponent = () => {
  const { identityName } = useParams<{ identityName: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  
  useDocumentTitle(`ACM | ${identityName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
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
    // Mock data showing groups that this user belongs to
    const mockGroups = [
      { id: 1, name: 'Security team', members: 12, created: '2024-01-15' },
      { id: 2, name: 'Engineering', members: 45, created: '2024-02-10' },
      { id: 3, name: 'DevOps', members: 8, created: '2024-03-01' },
    ];

    const [selectedGroups, setSelectedGroups] = React.useState<Set<number>>(new Set());
    const [isBulkActionOpen, setIsBulkActionOpen] = React.useState(false);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);

    const filteredGroups = mockGroups.filter(group =>
      group.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const isAllSelected = selectedGroups.size === filteredGroups.length && filteredGroups.length > 0;
    const isPartiallySelected = selectedGroups.size > 0 && selectedGroups.size < filteredGroups.length;

    const handleSelectAll = (isSelecting: boolean) => {
      if (isSelecting) {
        setSelectedGroups(new Set(filteredGroups.map(group => group.id)));
      } else {
        setSelectedGroups(new Set());
      }
    };

    const handleSelectGroup = (groupId: number, isSelecting: boolean) => {
      const newSelected = new Set(selectedGroups);
      if (isSelecting) {
        newSelected.add(groupId);
      } else {
        newSelected.delete(groupId);
      }
      setSelectedGroups(newSelected);
    };

    const handleBulkAction = (action: string) => {
      console.log(`Bulk action: ${action} for groups:`, Array.from(selectedGroups));
      setIsBulkActionOpen(false);
      // Here you would implement the actual bulk action logic
    };

    const handleRemoveFromGroup = () => {
      console.log('Remove user from selected groups');
      // Implement remove logic
    };

    const handleAddToGroup = () => {
      console.log('Add user to a new group');
      // Implement add logic
    };

    return (
      <Card>
        <CardBody>
          <Toolbar>
            <ToolbarContent>
              {selectedGroups.size > 0 && (
                <>
                  <ToolbarGroup>
                    <ToolbarItem>
                      <Content component="p" className="pf-v6-u-font-weight-bold">
                        {selectedGroups.size} selected
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
                            Remove from groups
                          </DropdownItem>
                          <DropdownItem key="add" onClick={() => handleBulkAction('add')}>
                            Add to another group
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
                      <FilterIcon /> Group
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="all">All groups</DropdownItem>
                    <DropdownItem key="system">System groups</DropdownItem>
                    <DropdownItem key="custom">Custom groups</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <SearchInput
                  placeholder="Search groups"
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.primary} onClick={handleRemoveFromGroup}>
                  Remove from group
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <Button variant={ButtonVariant.secondary} onClick={handleAddToGroup}>
                  Add to group
                </Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          
          <Table aria-label="Groups table" variant="compact">
            <Thead>
              <Tr>
                <Th
                  select={{
                    onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                    isSelected: isAllSelected,
                    isPartiallySelected: isPartiallySelected,
                  }}
                />
                <Th width={50}>Group Name</Th>
                <Th width={25}>Members</Th>
                <Th width={25}>Created</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredGroups.map((group) => (
                <Tr key={group.id}>
                  <Td
                    select={{
                      rowIndex: group.id,
                      onSelect: (_event, isSelecting) => handleSelectGroup(group.id, isSelecting),
                      isSelected: selectedGroups.has(group.id),
                    }}
                  />
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
                </Tr>
              ))}
            </Tbody>
          </Table>
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

          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexEnd' }} className="pf-v6-u-mb-md">
            <FlexItem>
              <Title headingLevel="h1" size="lg">
                {identityName}
              </Title>
              <Content component="p" className="pf-v6-u-font-size-sm pf-v6-u-color-200">
                {identityName?.toLowerCase().replace(/\s+/g, '')}
              </Content>
            </FlexItem>
            <FlexItem>
              <Button variant="plain" isInline>
                Actions <Icon><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></Icon>
              </Button>
            </FlexItem>
          </Flex>

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

