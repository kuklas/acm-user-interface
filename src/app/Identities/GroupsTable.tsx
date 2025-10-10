import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Checkbox,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useNavigate } from 'react-router-dom';

// Mock data for groups
const mockGroups = [
  { id: 1, name: 'cluster-admins', members: 5, created: '2024-01-15' },
  { id: 2, name: 'developers', members: 12, created: '2024-01-10' },
  { id: 3, name: 'operators', members: 8, created: '2024-02-01' },
  { id: 4, name: 'viewers', members: 20, created: '2024-01-20' },
];

export const GroupsTable: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Group');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState<number[]>([]);

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
                <DropdownItem value="Group" onClick={() => setFilterType('Group')}>
                  Group
                </DropdownItem>
                <DropdownItem value="User" onClick={() => setFilterType('User')}>
                  User
                </DropdownItem>
                <DropdownItem value="Service account" onClick={() => setFilterType('Service account')}>
                  Service account
                </DropdownItem>
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
            <Button variant="primary">Create group</Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Groups table" variant="compact">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                isChecked={selectedGroups.length === mockGroups.length && mockGroups.length > 0}
                onChange={(checked) => handleSelectAllGroups(checked)}
                aria-label="Select all groups"
                style={{ transform: 'scale(0.7)' }}
              />
            </Th>
            <Th>Group Name</Th>
            <Th>Members</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockGroups.map((group) => (
            <Tr key={group.id}>
              <Td>
                <Checkbox
                  isChecked={selectedGroups.includes(group.id)}
                  onChange={(checked) => handleGroupSelect(group.id, checked)}
                  aria-label={`Select ${group.name}`}
                  style={{ transform: 'scale(0.7)' }}
                />
              </Td>
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
    </div>
  );
};
