import * as React from 'react';
import {
  Title,
  SearchInput,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Card,
  CardBody,
  CardTitle,
  CardHeader,
  Alert,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { 
  ExternalLinkAltIcon, 
  InfoCircleIcon, 
  ShareAltIcon,
  EllipsisVIcon,
  FileIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const searchTemplates = [
  {
    id: 1,
    title: 'Workloads',
    description: 'Show workloads running on your fleet',
    results: '1.7k',
    icon: <FileIcon />,
  },
  {
    id: 2,
    title: 'Unhealthy pods',
    description: 'Show pods with unhealthy status',
    results: '24',
    icon: <FileIcon />,
  },
  {
    id: 3,
    title: 'Created last hour',
    description: 'Show resources created within the last hour',
    results: '41',
    icon: <FileIcon />,
  },
  {
    id: 4,
    title: 'Virtual Machines',
    description: 'Show virtual machine resources',
    results: '11',
    icon: <FileIcon />,
  },
];

export const Search: React.FunctionComponent = () => {
  useDocumentTitle('ACM | Search');
  const [searchValue, setSearchValue] = React.useState('');
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = React.useState(false);
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  return (
    <div className="search-page-container">
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '24px' }}>
        <FlexItem>
          <Title headingLevel="h1" size="2xl">Search</Title>
        </FlexItem>
        <FlexItem>
          <Alert
            variant="warning"
            isInline
            isPlain
            title="Search is disabled on some clusters"
            style={{ padding: '8px 16px' }}
          />
        </FlexItem>
      </Flex>

      <Toolbar style={{ padding: 0, marginBottom: '24px' }}>
        <ToolbarContent style={{ padding: 0 }}>
          <ToolbarItem>
            <Dropdown
              isOpen={isSavedSearchesOpen}
              onSelect={() => setIsSavedSearchesOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsSavedSearchesOpen(isOpen)}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle 
                  ref={toggleRef} 
                  onClick={() => setIsSavedSearchesOpen(!isSavedSearchesOpen)}
                  isExpanded={isSavedSearchesOpen}
                >
                  Saved searches
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="saved1">My saved search 1</DropdownItem>
                <DropdownItem key="saved2">My saved search 2</DropdownItem>
              </DropdownList>
            </Dropdown>
          </ToolbarItem>
          <ToolbarItem align={{ default: 'alignEnd' }}>
            <Button variant="link" icon={<ExternalLinkAltIcon />} iconPosition="end">
              Open new search tab
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <div>
        <div style={{ position: 'relative', marginBottom: '48px' }}>
          <SearchInput
            placeholder='Search by keywords or filters, for example "label:environment=production my-cluster"'
            value={searchValue}
            onChange={(_event, value) => setSearchValue(value)}
            onClear={() => setSearchValue('')}
            style={{ width: '100%' }}
          />
          <div style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center',
          }}>
            <Button variant="plain" aria-label="Info">
              <InfoCircleIcon />
            </Button>
            <Button variant="plain" aria-label="Share">
              <ShareAltIcon />
            </Button>
          </div>
        </div>

        <Title headingLevel="h2" size="lg" style={{ marginBottom: '24px' }}>
          Suggested search templates
        </Title>

        <Grid hasGutter span={3}>
          {searchTemplates.map((template) => (
            <GridItem key={template.id}>
              <Card isFullHeight style={{ backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
                <CardHeader
                  actions={{
                    actions: (
                      <Dropdown
                        isOpen={openMenuId === template.id}
                        onSelect={() => setOpenMenuId(null)}
                        onOpenChange={(isOpen: boolean) => {
                          if (!isOpen) setOpenMenuId(null);
                        }}
                        popperProps={{ position: 'right' }}
                        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
                            isExpanded={openMenuId === template.id}
                          >
                            <EllipsisVIcon />
                          </MenuToggle>
                        )}
                      >
                        <DropdownList>
                          <DropdownItem key="view">View</DropdownItem>
                          <DropdownItem key="edit">Edit</DropdownItem>
                          <DropdownItem key="delete">Delete</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    ),
                    hasNoOffset: false,
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--pf-t--global--color--brand--default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginBottom: '12px',
                  }}>
                    {template.icon}
                  </div>
                </CardHeader>
                <CardTitle>
                  <Title headingLevel="h3" size="md">
                    {template.title}
                  </Title>
                </CardTitle>
                <CardBody>
                  <div style={{ marginBottom: '48px', color: 'var(--pf-t--global--text--color--regular)' }}>
                    {template.description}
                  </div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 300,
                    color: 'var(--pf-t--global--color--brand--default)',
                  }}>
                    {template.results}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: 'var(--pf-t--global--text--color--regular)',
                  }}>
                    Results
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </div>
    </div>
  );
};

