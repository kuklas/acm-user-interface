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
  Pagination,
  PaginationVariant,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Title,
  Alert,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { SyncAltIcon, CogIcon, EllipsisVIcon, TrashIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { getAllGroups } from '@app/data';
import { useImpersonation } from '@app/contexts/ImpersonationContext';

// Get groups from centralized database
const dbGroups = getAllGroups();

// Transform groups from database to component format
const mockGroups = dbGroups.map((group, index) => ({
  id: index + 1,
  name: group.name,
  members: group.userIds.length,
  created: '2024-01-15', // Could be added to schema later
  syncSource: group.type === 'team' || group.type === 'project' ? 'Local' : 'Corporate LDAP',
  lastSynced: group.type === 'regional' ? '2 hours ago' : null,
}));

export const GroupsTable: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { startImpersonation } = useImpersonation();
  const [searchValue, setSearchValue] = React.useState('');
  const [filterType, setFilterType] = React.useState('Group');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState<number[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [openRowMenuId, setOpenRowMenuId] = React.useState<number | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = React.useState(false);
  const [impersonateGroupName, setImpersonateGroupName] = React.useState('');

  const paginatedGroups = mockGroups.slice((page - 1) * perPage, page * perPage);

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

  const handleImpersonateGroup = (groupName: string) => {
    setImpersonateGroupName(groupName);
    setIsImpersonateModalOpen(true);
    setOpenRowMenuId(null);
  };

  const handleImpersonateConfirm = () => {
    // Close modal immediately and start impersonation with a placeholder user and the group
    setIsImpersonateModalOpen(false);
    // Use the first user from the group as placeholder (in a real app, you'd select a specific user)
    startImpersonation('group-member', [impersonateGroupName]);
    // Clear the form state
    setImpersonateGroupName('');
  };

  const handleImpersonateCancel = () => {
    setIsImpersonateModalOpen(false);
    setImpersonateGroupName('');
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
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Pagination
              itemCount={mockGroups.length}
              perPage={perPage}
              page={page}
              onSetPage={(_event, pageNumber) => setPage(pageNumber)}
              onPerPageSelect={(_event, newPerPage) => {
                setPerPage(newPerPage);
                setPage(1);
              }}
              variant={PaginationVariant.top}
              isCompact
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table aria-label="Groups table" variant="compact">
        <Thead>
          <Tr>
            <Th>
              <Checkbox
                id="select-all-groups"
                isChecked={paginatedGroups.length > 0 && paginatedGroups.every(group => selectedGroups.includes(group.id))}
                onChange={(event, checked) => {
                  if (checked) {
                    setSelectedGroups(Array.from(new Set([...selectedGroups, ...paginatedGroups.map(g => g.id)])));
                  } else {
                    const pageGroupIds = paginatedGroups.map(g => g.id);
                    setSelectedGroups(selectedGroups.filter(id => !pageGroupIds.includes(id)));
                  }
                }}
                aria-label="Select all groups on page"
                style={{ transform: 'scale(0.7)' }}
              />
            </Th>
            <Th width={20}>Group</Th>
            <Th width={15}>Members</Th>
            <Th width={20}>Sync Source</Th>
            <Th width={20}>Last Synced</Th>
            <Th width={15}>Created</Th>
            <Th width={10}></Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedGroups.map((group) => (
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
              <Td dataLabel="Group" width={20}>
                <Button
                  variant="link"
                  isInline
                  onClick={() => navigate(`/user-management/groups/${group.name}`)}
                >
                  {group.name}
                </Button>
              </Td>
              <Td dataLabel="Members" width={15}>{group.members}</Td>
              <Td dataLabel="Sync Source" width={20}>
                {group.syncSource === 'Local' ? (
                  <Label color="grey">{group.syncSource}</Label>
                ) : (
                  <Label color="blue" icon={<SyncAltIcon />}>{group.syncSource}</Label>
                )}
              </Td>
              <Td dataLabel="Last Synced" width={20}>
                {group.lastSynced ? (
                  <span>{group.lastSynced}</span>
                ) : (
                  <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
                )}
              </Td>
              <Td dataLabel="Created" width={15}>{group.created}</Td>
              <Td dataLabel="Actions" width={10} style={{ textAlign: 'right' }}>
                <Dropdown
                  isOpen={openRowMenuId === group.id}
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
                      key="impersonate"
                      onClick={() => handleImpersonateGroup(group.name)}
                    >
                      Impersonate
                    </DropdownItem>
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
      <div style={{ padding: '16px' }}>
        <Pagination
          itemCount={mockGroups.length}
          perPage={perPage}
          page={page}
          onSetPage={(_event, pageNumber) => setPage(pageNumber)}
          onPerPageSelect={(_event, newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          variant={PaginationVariant.bottom}
        />
      </div>

      <Modal
        variant={ModalVariant.small}
        isOpen={isImpersonateModalOpen}
        onClose={handleImpersonateCancel}
        aria-labelledby="impersonate-group-modal-title"
        aria-describedby="impersonate-group-modal-description"
      >
        <ModalHeader>
          <Title headingLevel="h1" size="2xl" id="impersonate-group-modal-title">
            Impersonate group
          </Title>
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          <Alert 
            variant="warning" 
            isInline 
            title="You are about to impersonate a group"
            style={{ marginBottom: '16px' }}
          >
            This will allow you to see the system from the perspective of users in this group.
          </Alert>

          <div style={{ marginBottom: '16px' }}>
            <strong>Group:</strong> {impersonateGroupName}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleImpersonateConfirm}>
            Impersonate
          </Button>
          <Button variant="link" onClick={handleImpersonateCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
