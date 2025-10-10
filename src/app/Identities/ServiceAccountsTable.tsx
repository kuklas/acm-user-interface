import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  MenuToggle,
  MenuToggleElement,
  Dropdown,
  DropdownList,
  DropdownItem,
  Checkbox,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';

// Mock data for service accounts matching the screenshot
const mockServiceAccounts = [
  { id: 1, name: 'dev-team-alpha', users: 5, created: '5 minutes ago' },
  { id: 2, name: 'dev-team-vm-editors', users: 1, created: '5 minutes ago' },
  { id: 3, name: 'dev-team-vm-admins', users: 13, created: '5 minutes ago' },
  { id: 4, name: 'dev-team-vm-viewers', users: 13, created: '5 minutes ago' },
  { id: 5, name: 'prod-cluster-admins', users: 13, created: '5 minutes ago' },
];

export const ServiceAccountsTable: React.FunctionComponent = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Service account');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedServiceAccounts, setSelectedServiceAccounts] = React.useState<number[]>([]);

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

  return (
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
                <DropdownItem value="Service account" onClick={() => setFilterType('Service account')}>
                  Service account
                </DropdownItem>
                <DropdownItem value="User" onClick={() => setFilterType('User')}>
                  User
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
          <ToolbarItem>
            <Button variant="primary">Create service account</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Service accounts table" variant="compact">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                isChecked={selectedServiceAccounts.length === mockServiceAccounts.length && mockServiceAccounts.length > 0}
                onChange={(checked) => handleSelectAllServiceAccounts(checked)}
                aria-label="Select all service accounts"
                style={{ transform: 'scale(0.7)' }}
              />
            </Th>
            <Th>Name</Th>
            <Th>Users</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockServiceAccounts.map((sa) => (
            <Tr key={sa.id}>
              <Td>
                <Checkbox
                  isChecked={selectedServiceAccounts.includes(sa.id)}
                  onChange={(checked) => handleServiceAccountSelect(sa.id, checked)}
                  aria-label={`Select ${sa.name}`}
                  style={{ transform: 'scale(0.7)' }}
                />
              </Td>
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
  );
};
