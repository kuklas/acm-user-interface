import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';

// Mock data for groups
const mockGroups = [
  { id: 1, name: 'cluster-admins', members: 5, created: '2024-01-15' },
  { id: 2, name: 'developers', members: 12, created: '2024-01-10' },
  { id: 3, name: 'operators', members: 8, created: '2024-02-01' },
  { id: 4, name: 'viewers', members: 20, created: '2024-01-20' },
];

export const GroupsTable: React.FunctionComponent = () => {
  const [searchValue, setSearchValue] = React.useState('');

  return (
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
          <ToolbarItem>
            <Button variant="primary">Create group</Button>
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
  );
};
