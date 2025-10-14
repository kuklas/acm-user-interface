import * as React from 'react';
import {
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  SearchInput,
  Label,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Split,
  SplitItem,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { PlusCircleIcon, FilterIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';
import { getAllIdentityProviders, getUsersByIdentityProvider, getClustersByIdentityProvider } from '@app/data';

// Get identity providers from centralized database
const dbIdentityProviders = getAllIdentityProviders();

// Transform identity providers from database to component format
const mockIdentityProviders = dbIdentityProviders.map((idp, index) => {
  const connectedUsers = getUsersByIdentityProvider(idp.id);
  const connectedClusters = getClustersByIdentityProvider(idp.id);
  
  return {
    id: index + 1,
    name: idp.name,
    type: idp.type,
    status: idp.status,
    description: idp.description,
    users: connectedUsers.length, // Actual count of users from database
    clusters: connectedClusters.map(c => c.name), // Cluster names from database
  };
});

interface IdentityProviderProps {
  showClustersColumn?: boolean;
}

const IdentityProvider: React.FunctionComponent<IdentityProviderProps> = ({ showClustersColumn = true }) => {
  useDocumentTitle('ACM RBAC | Identity Provider');
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newProviderName, setNewProviderName] = React.useState('');
  const [newProviderType, setNewProviderType] = React.useState('OAuth');
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [selectedProviders, setSelectedProviders] = React.useState<Set<number>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);

  const paginatedProviders = mockIdentityProviders.slice((page - 1) * perPage, page * perPage);

  const providerTypes = ['OAuth', 'OIDC', 'LDAP', 'SAML'];

  const handleCreateProvider = () => {
    setIsCreateModalOpen(true);
  };

  const handleSelectProviderType = (providerType: string) => {
    setIsAddProviderOpen(false);
    
    // Only LDAP is implemented - navigate to the configuration page
    if (providerType === 'LDAP') {
      navigate('/user-management/identity-providers/add/ldap');
    }
    // Other provider types do nothing (not yet implemented)
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setNewProviderName('');
    setNewProviderType('OAuth');
    setClientId('');
    setClientSecret('');
  };

  const handleSaveProvider = () => {
    // In a real application, this would make an API call
    console.log('Creating identity provider:', {
      name: newProviderName,
      type: newProviderType,
      clientId,
      clientSecret,
    });
    handleModalClose();
  };

  const isAllSelected = paginatedProviders.length > 0 && paginatedProviders.every(provider => selectedProviders.has(provider.id));
  const isPartiallySelected = selectedProviders.size > 0 && !isAllSelected;

  const handleSelectAll = (isSelecting: boolean) => {
    const newSelected = new Set(selectedProviders);
    if (isSelecting) {
      paginatedProviders.forEach(provider => newSelected.add(provider.id));
    } else {
      paginatedProviders.forEach(provider => newSelected.delete(provider.id));
    }
    setSelectedProviders(newSelected);
  };

  const handleSelectProvider = (providerId: number, isSelecting: boolean) => {
    const newSelected = new Set(selectedProviders);
    if (isSelecting) {
      newSelected.add(providerId);
    } else {
      newSelected.delete(providerId);
    }
    setSelectedProviders(newSelected);
  };

  return (
    <>
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
                    variant="default"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    isExpanded={isFilterOpen}
                  >
                    <FilterIcon /> Identity provider
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="all">All providers</DropdownItem>
                  <DropdownItem key="oauth">OAuth</DropdownItem>
                  <DropdownItem key="oidc">OIDC</DropdownItem>
                  <DropdownItem key="ldap">LDAP</DropdownItem>
                  <DropdownItem key="saml">SAML</DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem>
              <SearchInput
                placeholder="Search identity providers"
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Dropdown
                isOpen={isAddProviderOpen}
                onSelect={() => setIsAddProviderOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsAddProviderOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsAddProviderOpen(!isAddProviderOpen)}
                    isExpanded={isAddProviderOpen}
                    variant="primary"
                  >
                    Add Identity provider
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="basic-auth" onClick={() => handleSelectProviderType('Basic Authentication')}>
                    Basic Authentication
                  </DropdownItem>
                  <DropdownItem key="github" onClick={() => handleSelectProviderType('GitHub')}>
                    GitHub
                  </DropdownItem>
                  <DropdownItem key="gitlab" onClick={() => handleSelectProviderType('GitLab')}>
                    GitLab
                  </DropdownItem>
                  <DropdownItem key="google" onClick={() => handleSelectProviderType('Google')}>
                    Google
                  </DropdownItem>
                  <DropdownItem key="htpasswd" onClick={() => handleSelectProviderType('HTPasswd')}>
                    HTPasswd
                  </DropdownItem>
                  <DropdownItem key="keystone" onClick={() => handleSelectProviderType('Keystone')}>
                    Keystone
                  </DropdownItem>
                  <DropdownItem key="ldap" onClick={() => handleSelectProviderType('LDAP')}>
                    LDAP
                  </DropdownItem>
                  <DropdownItem key="openid" onClick={() => handleSelectProviderType('OpenID Connect')}>
                    OpenID Connect
                  </DropdownItem>
                  <DropdownItem key="request-header" onClick={() => handleSelectProviderType('Request Header')}>
                    Request Header
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={mockIdentityProviders.length}
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
        <Table aria-label="Identity providers table" variant="compact">
          <Thead>
            <Tr>
              <Th
                select={{
                  onSelect: (_event, isSelecting) => handleSelectAll(isSelecting),
                  isSelected: isAllSelected,
                }}
              />
              <Th width={showClustersColumn ? 25 : 30}>Identity provider</Th>
              <Th width={showClustersColumn ? 15 : 20}>Type</Th>
              <Th width={showClustersColumn ? 15 : 20}>Status</Th>
              <Th width={showClustersColumn ? 15 : 30}>Connected Users</Th>
              {showClustersColumn && <Th width={30}>Clusters</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {paginatedProviders.map((provider) => (
              <Tr key={provider.id}>
                <Td
                  select={{
                    rowIndex: provider.id,
                    onSelect: (_event, isSelecting) => handleSelectProvider(provider.id, isSelecting),
                    isSelected: selectedProviders.has(provider.id),
                  }}
                />
                <Td dataLabel="Identity provider" width={showClustersColumn ? 25 : 30} style={{ textAlign: 'left' }}>
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigate(`/user-management/identity-providers/${provider.name}`)}
                    style={{ paddingLeft: 0 }}
                  >
                    {provider.name}
                  </Button>
                </Td>
                <Td dataLabel="Type" width={showClustersColumn ? 15 : 20}>
                  <Label color="blue">{provider.type}</Label>
                </Td>
                <Td dataLabel="Status" width={showClustersColumn ? 15 : 20}>
                  <Label color={provider.status === 'Active' ? 'green' : 'grey'}>{provider.status}</Label>
                </Td>
                <Td dataLabel="Connected Users" width={showClustersColumn ? 15 : 30}>{provider.users}</Td>
                {showClustersColumn && (
                  <Td dataLabel="Clusters" width={30}>
                    {provider.clusters.length > 0 ? (
                      <Split hasGutter>
                        {provider.clusters.slice(0, 2).map((cluster, index) => (
                          <SplitItem key={index}>
                            <Label isCompact color="blue">{cluster}</Label>
                          </SplitItem>
                        ))}
                        {provider.clusters.length > 2 && (
                          <SplitItem>
                            <Label isCompact>+{provider.clusters.length - 2} more</Label>
                          </SplitItem>
                        )}
                      </Split>
                    ) : (
                      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No clusters</span>
                    )}
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
        <div style={{ padding: '16px' }}>
          <Pagination
            itemCount={mockIdentityProviders.length}
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
      </div>

      <Modal
        variant={ModalVariant.medium}
        title="Add Identity Provider"
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
      >
        <Form>
          <FormGroup label="Provider Name" isRequired fieldId="provider-name">
            <TextInput
              isRequired
              type="text"
              id="provider-name"
              name="provider-name"
              value={newProviderName}
              onChange={(_event, value) => setNewProviderName(value)}
            />
          </FormGroup>
          <FormGroup label="Provider Type" isRequired fieldId="provider-type">
            <FormSelect
              value={newProviderType}
              onChange={(_event, value) => setNewProviderType(value)}
              id="provider-type"
              name="provider-type"
            >
              {providerTypes.map((type, index) => (
                <FormSelectOption key={index} value={type} label={type} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="Client ID" isRequired fieldId="client-id">
            <TextInput
              isRequired
              type="text"
              id="client-id"
              name="client-id"
              value={clientId}
              onChange={(_event, value) => setClientId(value)}
            />
          </FormGroup>
          <FormGroup label="Client Secret" isRequired fieldId="client-secret">
            <TextInput
              isRequired
              type="password"
              id="client-secret"
              name="client-secret"
              value={clientSecret}
              onChange={(_event, value) => setClientSecret(value)}
            />
          </FormGroup>
        </Form>
        <div className="pf-v6-u-mt-md">
          <Button variant="primary" onClick={handleSaveProvider}>
            Add Provider
          </Button>{' '}
          <Button variant="link" onClick={handleModalClose}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export { IdentityProvider };

