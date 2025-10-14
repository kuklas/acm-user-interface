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
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '@app/data';

// Get users from centralized database
const dbUsers = getAllUsers();

// Transform users from database to component format
const mockUsers = dbUsers.map((user, index) => ({
  id: index + 1,
  name: `${user.firstName} ${user.lastName}`,
  username: user.username,
  identityProvider: 'LDAP',
  created: new Date(user.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
}));

export const UsersTable: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('User');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [openRowMenuId, setOpenRowMenuId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const paginatedUsers = mockUsers.slice((page - 1) * perPage, page * perPage);

  const toggleRowMenu = (userId: number) => {
    setOpenRowMenuId(openRowMenuId === userId ? null : userId);
  };

  const handleImpersonateUser = (userName: string) => {
    console.log('Impersonate user:', userName);
    setOpenRowMenuId(null);
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
                <DropdownItem value="User" onClick={() => setFilterType('User')}>
                  User
                </DropdownItem>
                <DropdownItem value="Group" onClick={() => setFilterType('Group')}>
                  Group
                </DropdownItem>
                <DropdownItem value="Service account" onClick={() => setFilterType('Service account')}>
                  Service account
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
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
              perPage={perPage}
              page={page}
              onSetPage={(_event, pageNumber) => setPage(pageNumber)}
              onPerPageSelect={(_event, perPage) => {
                setPerPage(perPage);
                setPage(1);
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
            <Th>User</Th>
            <Th>Identity provider</Th>
            <Th>Created</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedUsers.map((user) => (
            <Tr key={user.id}>
              <Td dataLabel="User">
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
                  isOpen={openRowMenuId === user.id}
                  onSelect={() => setOpenRowMenuId(null)}
                  onOpenChange={(isOpen: boolean) => {
                    if (!isOpen) {
                      setOpenRowMenuId(null);
                    }
                  }}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      aria-label="Actions menu"
                      variant="plain"
                      onClick={() => toggleRowMenu(user.id)}
                      isExpanded={openRowMenuId === user.id}
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
          perPage={perPage}
          page={page}
          onSetPage={(_event, pageNumber) => setPage(pageNumber)}
          onPerPageSelect={(_event, perPage) => {
            setPerPage(perPage);
            setPage(1);
          }}
          variant={PaginationVariant.bottom}
        />
      </div>
    </div>
  );
};

