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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { PlusCircleIcon, FilterIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useNavigate } from 'react-router-dom';

// Mock data for Identity Providers
const mockIdentityProviders = [
  { id: 1, name: 'GitHub OAuth', type: 'OAuth', status: 'Active', users: 45 },
  { id: 2, name: 'Corporate LDAP', type: 'LDAP', status: 'Active', users: 120 },
  { id: 3, name: 'Google Workspace', type: 'OAuth', status: 'Active', users: 89 },
  { id: 4, name: 'Azure AD', type: 'OIDC', status: 'Inactive', users: 0 },
];

const IdentityProvider: React.FunctionComponent = () => {
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

  const providerTypes = ['OAuth', 'OIDC', 'LDAP', 'SAML'];

  const handleCreateProvider = () => {
    setIsCreateModalOpen(true);
  };

  const handleSelectProviderType = (providerType: string) => {
    console.log('Selected provider type:', providerType);
    setIsAddProviderOpen(false);
    
    // Navigate to the appropriate configuration page based on provider type
    if (providerType === 'LDAP') {
      navigate('/user-management/identity-providers/add/ldap');
    } else {
      // For other provider types, show modal (temporary)
      setIsCreateModalOpen(true);
    }
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

  const isAllSelected = selectedProviders.size === mockIdentityProviders.length && mockIdentityProviders.length > 0;
  const isPartiallySelected = selectedProviders.size > 0 && selectedProviders.size < mockIdentityProviders.length;

  const handleSelectAll = (isSelecting: boolean) => {
    if (isSelecting) {
      setSelectedProviders(new Set(mockIdentityProviders.map(provider => provider.id)));
    } else {
      setSelectedProviders(new Set());
    }
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
                    variant="plain"
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
                  <DropdownItem key="header" isDisabled>
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
              <Th width={35}>Name</Th>
              <Th width={20}>Type</Th>
              <Th width={20}>Status</Th>
              <Th width={25}>Connected Users</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mockIdentityProviders.map((provider) => (
              <Tr key={provider.id}>
                <Td
                  select={{
                    rowIndex: provider.id,
                    onSelect: (_event, isSelecting) => handleSelectProvider(provider.id, isSelecting),
                    isSelected: selectedProviders.has(provider.id),
                  }}
                />
                <Td dataLabel="Name" width={35} style={{ textAlign: 'left' }}>
                  <Button
                    variant="link"
                    isInline
                    onClick={() => navigate(`/user-management/identity-providers/${provider.name}`)}
                    style={{ paddingLeft: 0 }}
                  >
                    {provider.name}
                  </Button>
                </Td>
                <Td dataLabel="Type" width={20}>
                  <Label color="blue">{provider.type}</Label>
                </Td>
                <Td dataLabel="Status" width={20}>
                  <Label color={provider.status === 'Active' ? 'green' : 'grey'}>{provider.status}</Label>
                </Td>
                <Td dataLabel="Connected Users" width={25}>{provider.users}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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

