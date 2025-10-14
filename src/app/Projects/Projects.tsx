import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ThProps,
} from '@patternfly/react-table';
import {
  FilterIcon,
  StarIcon,
  EllipsisVIcon,
  ClockIcon,
} from '@patternfly/react-icons';

interface Project {
  id: string;
  name: string;
  displayName: string;
  status: string;
  requester: string;
  memory: string;
  cpu: string;
  created: string;
}

const mockProjects: Project[] = [
  { id: '1', name: 'aap', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '6,519.1 MiB', cpu: '0.101 cores', created: '4 Feb 2025, 14:12' },
  { id: '2', name: 'aks-central', displayName: 'No display name', status: 'Active', requester: 'berenss', memory: '-', cpu: '-', created: '29 Jan 2025, 19:39' },
  { id: '3', name: 'appanynamespace', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '2 Jun 2025, 11:44' },
  { id: '4', name: 'appcluster1', displayName: 'No display name', status: 'Active', requester: 'ch-stark', memory: '-', cpu: '-', created: '9 Oct 2025, 21:55' },
  { id: '5', name: 'apptest2', displayName: 'No display name', status: 'Active', requester: 'ch-stark', memory: '-', cpu: '-', created: '9 Oct 2025, 21:59' },
  { id: '6', name: 'aro-central', displayName: 'No display name', status: 'Active', requester: 'berenss', memory: '-', cpu: '-', created: '21 Jul 2025, 19:02' },
  { id: '7', name: 'august-aws-credentials', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '11 Mar 2025, 01:50' },
  { id: '8', name: 'august-ocp-clusters-broker', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '11 Mar 2025, 01:47' },
  { id: '9', name: 'august-policies', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '11 Mar 2025, 04:42' },
  { id: '10', name: 'boston', displayName: 'No display name', status: 'Active', requester: 'berenss', memory: '-', cpu: '-', created: '5 Jun 2025, 21:41' },
  { id: '11', name: 'capa-system', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '1 Aug 2025, 21:31' },
  { id: '12', name: 'capi-system', displayName: 'No display name', status: 'Active', requester: 'No requester', memory: '-', cpu: '-', created: '1 Aug 2025, 21:31' },
];

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNameSortOpen, setIsNameSortOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<{ index: number; direction: 'asc' | 'desc' }>({ index: 0, direction: 'asc' });

  const filteredProjects = useMemo(() => {
    let filtered = [...mockProjects];
    
    if (searchValue) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Sort by column
    if (sortBy.index === 0) {
      filtered.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortBy.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [searchValue, sortBy]);

  const handleSort = (_event: any, index: number, direction: 'asc' | 'desc') => {
    setSortBy({ index, direction });
  };

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: sortBy.index,
      direction: sortBy.direction,
    },
    onSort: handleSort,
    columnIndex,
  });

  const toggleActionMenu = (projectId: string) => {
    setOpenActionMenuId(openActionMenuId === projectId ? null : projectId);
  };

  const handleProjectClick = (projectName: string) => {
    navigate(`/core/home/projects/${projectName}`);
  };

  return (
    <div style={{ padding: '48px' }}>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '32px' }}>
        <FlexItem>
          <Title headingLevel="h1" size="2xl">Projects</Title>
        </FlexItem>
        <FlexItem>
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <Button variant="plain" icon={<StarIcon />} />
            </FlexItem>
            <FlexItem>
              <Button variant="primary">Create Project</Button>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>

      <div className="table-content-card">
        <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Dropdown
                  isOpen={isFilterOpen}
                  onSelect={() => setIsFilterOpen(false)}
                  onOpenChange={(isOpen) => setIsFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      isExpanded={isFilterOpen}
                      icon={<FilterIcon />}
                    >
                      Filter
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem value="all">All projects</DropdownItem>
                    <DropdownItem value="active">Active</DropdownItem>
                    <DropdownItem value="inactive">Inactive</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  isOpen={isNameSortOpen}
                  onSelect={() => setIsNameSortOpen(false)}
                  onOpenChange={(isOpen) => setIsNameSortOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsNameSortOpen(!isNameSortOpen)}
                      isExpanded={isNameSortOpen}
                    >
                      Name
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem value="name-asc">Name (A-Z)</DropdownItem>
                    <DropdownItem value="name-desc">Name (Z-A)</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem style={{ flexGrow: 1 }}>
                <SearchInput
                  placeholder="Search by name..."
                  value={searchValue}
                  onChange={(_event, value) => setSearchValue(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>

          <Table variant="compact">
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>Name</Th>
                <Th>Display name</Th>
                <Th>Status</Th>
                <Th>Requester</Th>
                <Th>Memory</Th>
                <Th>CPU</Th>
                <Th>Created</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredProjects.map((project) => (
                <Tr key={project.id}>
                  <Td>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--pf-t--global--color--nonstatus--green--default)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--pf-t--global--color--nonstatus--white--default)',
                            fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                            fontSize: '12px',
                          }}
                        >
                          PR
                        </div>
                      </FlexItem>
                      <FlexItem>
                        <Button variant="link" isInline onClick={() => handleProjectClick(project.name)} style={{ paddingLeft: 0 }}>
                          {project.name}
                        </Button>
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td>{project.displayName}</Td>
                  <Td>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <span style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }}>✓</span>
                      </FlexItem>
                      <FlexItem>{project.status}</FlexItem>
                    </Flex>
                  </Td>
                  <Td>{project.requester}</Td>
                  <Td>{project.memory}</Td>
                  <Td>{project.cpu}</Td>
                  <Td>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <ClockIcon style={{ fontSize: '14px' }} />
                      </FlexItem>
                      <FlexItem>{project.created}</FlexItem>
                    </Flex>
                  </Td>
                  <Td>
                    <Dropdown
                      isOpen={openActionMenuId === project.id}
                      onSelect={() => setOpenActionMenuId(null)}
                      onOpenChange={(isOpen) => !isOpen && setOpenActionMenuId(null)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => toggleActionMenu(project.id)}
                          isExpanded={openActionMenuId === project.id}
                          variant="plain"
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                      shouldFocusToggleOnSelect
                    >
                      <DropdownList>
                        <DropdownItem value="edit">Edit Project</DropdownItem>
                        <DropdownItem value="delete">Delete Project</DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
      </div>
    </div>
  );
};

