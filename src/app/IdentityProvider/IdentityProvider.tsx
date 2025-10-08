import * as React from 'react';
import {
  PageSection,
  Title,
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
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

// Mock data for Identity Providers
const mockIdentityProviders = [
  { id: 1, name: 'GitHub OAuth', type: 'OAuth', status: 'Active', users: 45 },
  { id: 2, name: 'Corporate LDAP', type: 'LDAP', status: 'Active', users: 120 },
  { id: 3, name: 'Google Workspace', type: 'OAuth', status: 'Active', users: 89 },
  { id: 4, name: 'Azure AD', type: 'OIDC', status: 'Inactive', users: 0 },
];

const IdentityProvider: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Identity Provider');
  const [searchValue, setSearchValue] = React.useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newProviderName, setNewProviderName] = React.useState('');
  const [newProviderType, setNewProviderType] = React.useState('OAuth');
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');

  const providerTypes = ['OAuth', 'OIDC', 'LDAP', 'SAML'];

  const handleCreateProvider = () => {
    setIsCreateModalOpen(true);
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

  return (
    <>
      <PageSection>
        <div className="page-header-section">
          <Title headingLevel="h1" size="lg">
            Identity Providers
          </Title>
        </div>
        <div className="page-content-section">
          <div className="table-content-card">
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    placeholder="Search identity providers"
                    value={searchValue}
                    onChange={(_event, value) => setSearchValue(value)}
                    onClear={() => setSearchValue('')}
                  />
                </ToolbarItem>
                <ToolbarItem>
                  <Button variant="primary" icon={<PlusCircleIcon />} onClick={handleCreateProvider}>
                    Add Identity Provider
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="Identity providers table" variant="compact">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Connected Users</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mockIdentityProviders.map((provider) => (
                      <Tr key={provider.id}>
                        <Td dataLabel="Name">{provider.name}</Td>
                        <Td dataLabel="Type">
                          <Label color="blue">{provider.type}</Label>
                        </Td>
                        <Td dataLabel="Status">
                          <Label color={provider.status === 'Active' ? 'green' : 'grey'}>{provider.status}</Label>
                        </Td>
                        <Td dataLabel="Connected Users">{provider.users}</Td>
                      </Tr>
                  ))}
                </Tbody>
              </Table>
          </div>
        </div>
      </PageSection>

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

