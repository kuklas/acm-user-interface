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
  Label,
  Tooltip,
  Icon,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { SyncAltIcon, CogIcon, EllipsisVIcon, TrashIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

// Mock data for groups
const mockGroups = [
  { id: 1, name: 'cluster-admins', members: 5, created: '2024-01-15', syncSource: 'Local', lastSynced: null },
  { id: 2, name: 'developers', members: 12, created: '2024-01-10', syncSource: 'Corporate LDAP', lastSynced: '2 hours ago' },
  { id: 3, name: 'operators', members: 8, created: '2024-02-01', syncSource: 'Corporate LDAP', lastSynced: '2 hours ago' },
  { id: 4, name: 'viewers', members: 20, created: '2024-01-20', syncSource: 'Local', lastSynced: null },
  { id: 5, name: 'engineering-team', members: 45, created: '2024-01-05', syncSource: 'GitHub OAuth', lastSynced: '5 minutes ago' },
  { id: 6, name: 'qa-team', members: 15, created: '2024-01-08', syncSource: 'GitHub OAuth', lastSynced: '5 minutes ago' },
];

export const GroupsTable: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Group');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState<number[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [openRowMenuId, setOpenRowMenuId] = React.useState<number | null>(null);

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

  const handleSyncGroups = () => {
    console.log('Syncing groups from external identity providers...');
    setIsSyncing(true);
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      console.log('Groups synced successfully');
    }, 2000);
  };

  const handleConfigureSync = () => {
    console.log('Opening group sync configuration...');
    // Navigate to sync configuration page or open modal
  };

  const handleDeleteGroup = (groupId: number, groupName: string) => {
    console.log('Delete group:', groupId, groupName);
    // In a real application, this would delete the group
    setOpenRowMenuId(null);
  };

  const toggleRowMenu = (groupId: number) => {
    setOpenRowMenuId(openRowMenuId === groupId ? null : groupId);
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
          <ToolbarItem>
            <Dropdown
              isOpen={isActionsOpen}
              onSelect={() => setIsActionsOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle 
                  ref={toggleRef} 
                  onClick={() => setIsActionsOpen(!isActionsOpen)} 
                  isExpanded={isActionsOpen}
                  variant="plain"
                >
                  Actions
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem 
                  key="sync-groups"
                  icon={<SyncAltIcon />}
                  onClick={handleSyncGroups}
                  isDisabled={isSyncing}
                  description="Sync groups from connected identity providers"
                >
                  {isSyncing ? 'Syncing...' : 'Sync groups'}
                </DropdownItem>
                <DropdownItem 
                  key="configure-sync"
                  icon={<CogIcon />}
                  onClick={handleConfigureSync}
                  description="Configure group sync from identity providers"
                >
                  Configure sync
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Groups table" variant="compact">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                id="select-all-groups"
                isChecked={selectedGroups.length === mockGroups.length && mockGroups.length > 0}
                onChange={(event, checked) => handleSelectAllGroups(checked)}
                aria-label="Select all groups"
                style={{ transform: 'scale(0.7)' }}
              />
            </Th>
            <Th width={20}>Group Name</Th>
            <Th width={12}>Members</Th>
            <Th width={18}>Sync Source</Th>
            <Th width={18}>Last Synced</Th>
            <Th width={18}>Created</Th>
            <Th width={10}></Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockGroups.map((group) => (
            <Tr key={group.id}>
              <Td>
                <Checkbox
                  id={`select-group-${group.id}`}
                  isChecked={selectedGroups.includes(group.id)}
                  onChange={(event, checked) => handleGroupSelect(group.id, checked)}
                  aria-label={`Select ${group.name}`}
                  style={{ transform: 'scale(0.7)' }}
                />
              </Td>
              <Td dataLabel="Group Name" width={20}>
                <Button
                  variant="link"
                  isInline
                  onClick={() => navigate(`/user-management/groups/${group.name}`)}
                >
                  {group.name}
                </Button>
              </Td>
              <Td dataLabel="Members" width={12}>{group.members}</Td>
              <Td dataLabel="Sync Source" width={18}>
                {group.syncSource === 'Local' ? (
                  <Label color="grey">{group.syncSource}</Label>
                ) : (
                  <Label color="blue" icon={<SyncAltIcon />}>{group.syncSource}</Label>
                )}
              </Td>
              <Td dataLabel="Last Synced" width={18}>
                {group.lastSynced ? (
                  <span>{group.lastSynced}</span>
                ) : (
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                )}
              </Td>
              <Td dataLabel="Created" width={18}>{group.created}</Td>
              <Td dataLabel="Actions" width={10} style={{ textAlign: 'right' }}>
                <Dropdown
                  isOpen={openRowMenuId === group.id}
                  onSelect={() => setOpenRowMenuId(null)}
                  onOpenChange={(isOpen: boolean) => !isOpen && setOpenRowMenuId(null)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      aria-label="Actions menu"
                      variant="plain"
                      onClick={() => toggleRowMenu(group.id)}
                      isExpanded={openRowMenuId === group.id}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                >
                  <DropdownList>
                    <DropdownItem
                      key="delete"
                      icon={<TrashIcon />}
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      isDisabled={group.syncSource !== 'Local'}
                      description={group.syncSource !== 'Local' ? 'Synced groups cannot be deleted locally' : undefined}
                    >
                      Delete group
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};
