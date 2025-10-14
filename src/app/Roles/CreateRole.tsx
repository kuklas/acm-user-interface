import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Checkbox,
  Breadcrumb,
  BreadcrumbItem,
  Title,
  Grid,
  GridItem,
  Card,
  CardBody,
  CodeBlock,
  CodeBlockCode,
  Split,
  SplitItem,
  Content,
  Drawer,
  DrawerPanelContent,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
  Label,
  Divider,
  Modal,
  ModalVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ExpandableSection,
  Radio,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { PlusCircleIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

interface PermissionRule {
  id: number;
  apiGroups: string;
  resources: string;
  verbs: string[];
}

const CreateRole: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Create Custom Role');
  const navigate = useNavigate();
  
  const [roleName, setRoleName] = React.useState('my-custom-role');
  const [description, setDescription] = React.useState('');
  const [permissionRules, setPermissionRules] = React.useState<PermissionRule[]>([
    { id: 1, apiGroups: '', resources: '', verbs: ['get'] },
  ]);
  const [isEditingYAML, setIsEditingYAML] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [drawerType, setDrawerType] = React.useState<'apiGroups' | 'resources'>('resources');
  const [activeRuleId, setActiveRuleId] = React.useState<number | null>(null);
  const [catalogSearch, setCatalogSearch] = React.useState('');
  const [catalogFilter, setCatalogFilter] = React.useState<'All' | 'Core' | 'KubeVirt' | 'Networking' | 'Storage'>('All');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [templateSearch, setTemplateSearch] = React.useState('');
  
  // Navigation access control - perspectives and their pages
  interface PerspectiveAccess {
    mode: 'bundle' | 'specific';
    pages: Record<string, boolean>;
  }

  const [navigationAccess, setNavigationAccess] = React.useState<Record<string, PerspectiveAccess>>({
    'Fleet Management': {
      mode: 'bundle',
      pages: {
        'Overview': true,
        'Clusters': true,
        'Automation': true,
        'Host inventory': true,
        'Identities': true,
        'Identity providers': true,
        'Roles': true,
      }
    },
    'Fleet Virtualization': {
      mode: 'bundle',
      pages: {
        'Overview': true,
        'Catalog': true,
        'Virtual machines': true,
        'Virtual machine templates': true,
        'Disks': true,
        'Network interfaces': true,
        'Snapshots': true,
        'Migrations': true,
        'Events': true,
      }
    },
    'Core Platforms': {
      mode: 'bundle',
      pages: {
        'Overview': true,
        'Projects': true,
        'Workloads': true,
        'Networking': true,
        'Storage': true,
        'Builds': true,
        'Pipelines': true,
        'Identities': true,
        'Identity providers': true,
        'Roles': true,
      }
    },
  });

  const allVerbs = [
    { name: 'get', label: 'get - Read individual resources' },
    { name: 'list', label: 'list - List multiple resources' },
    { name: 'watch', label: 'watch - Watch for resource changes' },
    { name: 'create', label: 'create - Create new resources' },
    { name: 'update', label: 'update - Update existing resources' },
    { name: 'patch', label: 'patch - Partially update resources' },
    { name: 'delete', label: 'delete - Delete individual resources' },
    { name: 'deletecollection', label: 'deletecollection - Delete multiple resources at once' },
    { name: 'bind', label: 'bind - Bind roles to users or groups (RBAC)' },
    { name: 'escalate', label: 'escalate - Grant permissions above current role (RBAC)' },
    { name: 'impersonate', label: 'impersonate - Impersonate another user or service account' },
    { name: 'use', label: 'use - Use named resources (e.g., SecurityContextConstraints in OpenShift)' },
    { name: 'approve', label: 'approve - Approve certificate signing requests (CSR)' },
    { name: '*', label: '* - All operations (use with caution)' },
  ];

  const roleTemplates = [
    {
      name: 'Virtual Machine Operator',
      category: 'Virtual Machine Management',
      description: 'Manage virtual machines including create, delete, start, stop operations',
    },
    {
      name: 'Virtual Machine Viewer',
      category: 'Virtual Machine Management',
      description: 'Read-only access to virtual machines and related resources',
    },
    {
      name: 'Storage Administrator',
      category: 'Storage Management',
      description: 'Manage storage resources for virtualization workloads',
    },
    {
      name: 'Network Administrator',
      category: 'Network Management',
      description: 'Configure networking for virtual machines',
    },
    {
      name: 'Namespace Admin',
      category: 'Administration',
      description: 'Full control within a single namespace for day-to-day administration',
    },
    {
      name: 'Application Developer',
      category: 'Workloads',
      description: 'Create and manage workloads in a namespace without elevated cluster permissions',
    },
    {
      name: 'Namespace Viewer',
      category: 'Observability',
      description: 'Read-only access to common resources within a namespace',
    },
    {
      name: 'Security Auditor',
      category: 'Security',
      description: 'Audit-focused read-only role across RBAC and workloads',
    },
  ];

  const catalogApiGroups = [
    { name: '', description: 'Core Kubernetes APIs (pods, services, etc.)', category: 'Core' },
    { name: 'apps', description: 'Deployments, StatefulSets, DaemonSets', category: 'Core' },
    { name: 'batch', description: 'Jobs and CronJobs', category: 'Core' },
    { name: 'kubevirt.io', description: 'KubeVirt virtualization APIs', category: 'KubeVirt' },
    { name: 'cdi.kubevirt.io', description: 'Containerized Data Importer', category: 'KubeVirt' },
    { name: 'instancetype.kubevirt.io', description: 'VM instance types', category: 'KubeVirt' },
    { name: 'networking.k8s.io', description: 'Network policies and ingress', category: 'Networking' },
    { name: 'k8s.cni.cncf.io', description: 'Network attachment definitions', category: 'Networking' },
    { name: 'storage.k8s.io', description: 'Storage classes and volume attachments', category: 'Storage' },
    { name: 'snapshot.storage.k8s.io', description: 'Volume snapshots', category: 'Storage' },
    { name: 'rbac.authorization.k8s.io', description: 'Roles and role bindings', category: 'Core' },
  ];

  const catalogResources = [
    { name: 'pods', description: 'Basic compute units', category: 'Core' },
    { name: 'services', description: 'Network services', category: 'Core' },
    { name: 'persistentvolumeclaims', description: 'Storage claims', category: 'Storage' },
    { name: 'secrets', description: 'Sensitive data', category: 'Core' },
    { name: 'configmaps', description: 'Configuration data', category: 'Core' },
    { name: 'virtualmachines', description: 'Virtual machine definitions', category: 'KubeVirt' },
    { name: 'virtualmachineinstances', description: 'Running VM instances', category: 'KubeVirt' },
    { name: 'virtualmachineinstancepresets', description: 'VM template presets', category: 'KubeVirt' },
    { name: 'datavolumes', description: 'Data volume imports', category: 'KubeVirt' },
    { name: 'datasources', description: 'Data sources for VMs', category: 'KubeVirt' },
    { name: 'network-attachment-definitions', description: 'Network attachment definitions', category: 'Networking' },
  ];

  const filteredTemplates = roleTemplates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const filteredCatalogApiGroups = catalogApiGroups.filter(apiGroup => {
    const matchesSearch = apiGroup.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                         apiGroup.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesFilter = catalogFilter === 'All' || apiGroup.category === catalogFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCatalogResources = catalogResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                         resource.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesFilter = catalogFilter === 'All' || resource.category === catalogFilter;
    return matchesSearch && matchesFilter;
  });

  const groupedApiGroups = filteredCatalogApiGroups.reduce((acc, apiGroup) => {
    if (!acc[apiGroup.category]) {
      acc[apiGroup.category] = [];
    }
    acc[apiGroup.category].push(apiGroup);
    return acc;
  }, {} as Record<string, typeof catalogApiGroups>);

  const groupedResources = filteredCatalogResources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, typeof catalogResources>);

  const handleAddRule = () => {
    const newRule: PermissionRule = {
      id: Date.now(),
      apiGroups: '',
      resources: '',
      verbs: [],
    };
    setPermissionRules([...permissionRules, newRule]);
  };

  const handleRemoveRule = (ruleId: number) => {
    setPermissionRules(permissionRules.filter(rule => rule.id !== ruleId));
  };

  const handleRuleChange = (ruleId: number, field: keyof PermissionRule, value: any) => {
    setPermissionRules(permissionRules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const handleVerbToggle = (ruleId: number, verb: string, isChecked: boolean) => {
    setPermissionRules(permissionRules.map(rule => {
      if (rule.id === ruleId) {
        const newVerbs = isChecked
          ? [...rule.verbs, verb]
          : rule.verbs.filter(v => v !== verb);
        return { ...rule, verbs: newVerbs };
      }
      return rule;
    }));
  };

  const generateYAML = () => {
    const rules = permissionRules.map(rule => ({
      apiGroups: rule.apiGroups ? rule.apiGroups.split(',').map(g => g.trim()) : ['*'],
      resources: rule.resources ? rule.resources.split(',').map(r => r.trim()) : ['*'],
      verbs: rule.verbs.length > 0 ? rule.verbs : ['get'],
    }));

    const navigationAccessAnnotations = Object.entries(navigationAccess)
      .flatMap(([perspective, access]) => {
        const perspectiveKey = perspective.toLowerCase().replace(/\s+/g, '-');
        if (access.mode === 'bundle') {
          return [`    acm.io/nav-${perspectiveKey}: "bundle"`];
        } else {
          const enabledPages = Object.entries(access.pages)
            .filter(([_, enabled]) => enabled)
            .map(([page, _]) => page);
          return [`    acm.io/nav-${perspectiveKey}: "${enabledPages.join(',')}"`];
        }
      })
      .join('\n');

    return `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${roleName || 'unnamed-role'}${description ? `
  annotations:
    description: "${description}"
${navigationAccessAnnotations}` : `
  annotations:
${navigationAccessAnnotations}`}
rules:
${rules.map(rule => `- apiGroups:
${rule.apiGroups.map(g => `  - "${g}"`).join('\n')}
  resources:
${rule.resources.map(r => `  - "${r}"`).join('\n')}
  verbs:
${rule.verbs.map(v => `  - "${v}"`).join('\n')}`).join('\n')}`;
  };

  const handleCreateRole = () => {
    console.log('Creating role:', {
      name: roleName,
      description,
      rules: permissionRules,
      navigationAccess,
    });
    navigate('/user-management/roles');
  };

  const handleCancel = () => {
    navigate('/user-management/roles');
  };

  const handleOpenDrawer = (ruleId: number, type: 'apiGroups' | 'resources') => {
    // If opening a different drawer type, reset search
    if (isDrawerOpen && drawerType !== type) {
      setCatalogSearch('');
      setCatalogFilter('All');
    }
    setActiveRuleId(ruleId);
    setDrawerType(type);
    setIsDrawerOpen(true);
  };

  const handleAddApiGroupFromCatalog = (apiGroupName: string) => {
    if (activeRuleId !== null) {
      setPermissionRules(permissionRules.map(rule => {
        if (rule.id === activeRuleId) {
          const currentApiGroups = rule.apiGroups ? rule.apiGroups.split(',').map(g => g.trim()).filter(g => g) : [];
          if (!currentApiGroups.includes(apiGroupName)) {
            return { ...rule, apiGroups: [...currentApiGroups, apiGroupName].join(', ') };
          }
        }
        return rule;
      }));
    }
  };

  const handleAddResourceFromCatalog = (resourceName: string) => {
    if (activeRuleId !== null) {
      setPermissionRules(permissionRules.map(rule => {
        if (rule.id === activeRuleId) {
          const currentResources = rule.resources ? rule.resources.split(',').map(r => r.trim()).filter(r => r) : [];
          if (!currentResources.includes(resourceName)) {
            return { ...rule, resources: [...currentResources, resourceName].join(', ') };
          }
        }
        return rule;
      }));
    }
  };

  const handleUseTemplate = (templateName: string) => {
    console.log('Using template:', templateName);
    // Here you would load the template configuration
    setIsTemplateModalOpen(false);
  };

  const drawerPanelContent = (
    <DrawerPanelContent style={{ minWidth: '500px' }}>
      <DrawerHead>
        <Title headingLevel="h2" size="xl">
          {drawerType === 'apiGroups' ? 'Browse API Groups' : 'Browse Resources'}
        </Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsDrawerOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <div style={{ padding: 'var(--pf-t--global--spacer--md)' }}>
        <SearchInput
          placeholder={drawerType === 'apiGroups' ? 'Search API groups...' : 'Search resources...'}
          value={catalogSearch}
          onChange={(_event, value) => setCatalogSearch(value)}
          onClear={() => setCatalogSearch('')}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        />
        
        <Content component="p" className="pf-v6-u-font-size-sm pf-v6-u-color-200" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Filter by category
        </Content>
        
        <ToggleGroup aria-label="Resource category filter" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          <ToggleGroupItem
            text="All"
            buttonId="filter-all"
            isSelected={catalogFilter === 'All'}
            onChange={() => setCatalogFilter('All')}
          />
          <ToggleGroupItem
            text="Core"
            buttonId="filter-core"
            isSelected={catalogFilter === 'Core'}
            onChange={() => setCatalogFilter('Core')}
          />
          <ToggleGroupItem
            text="KubeVirt"
            buttonId="filter-kubevirt"
            isSelected={catalogFilter === 'KubeVirt'}
            onChange={() => setCatalogFilter('KubeVirt')}
          />
          <ToggleGroupItem
            text="Networking"
            buttonId="filter-networking"
            isSelected={catalogFilter === 'Networking'}
            onChange={() => setCatalogFilter('Networking')}
          />
          <ToggleGroupItem
            text="Storage"
            buttonId="filter-storage"
            isSelected={catalogFilter === 'Storage'}
            onChange={() => setCatalogFilter('Storage')}
          />
        </ToggleGroup>

        {drawerType === 'apiGroups' ? (
          Object.entries(groupedApiGroups).map(([category, apiGroups]) => (
            <div key={category} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                {category}
              </Title>
              {apiGroups.map((apiGroup) => (
                <div 
                  key={apiGroup.name || 'core'} 
                  style={{ 
                    marginBottom: 'var(--pf-t--global--spacer--md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}>
                      {apiGroup.name || '""'} <span style={{ fontWeight: 'normal', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>(empty string)</span>
                    </div>
                    <Content component="small" className="pf-v6-u-color-200">
                      {apiGroup.description}
                    </Content>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleAddApiGroupFromCatalog(apiGroup.name)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ))
        ) : (
          Object.entries(groupedResources).map(([category, resources]) => (
            <div key={category} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
              <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                {category}
              </Title>
              {resources.map((resource) => (
                <div 
                  key={resource.name} 
                  style={{ 
                    marginBottom: 'var(--pf-t--global--spacer--md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}>
                      {resource.name}
                    </div>
                    <Content component="small" className="pf-v6-u-color-200">
                      {resource.description}
                    </Content>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleAddResourceFromCatalog(resource.name)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </DrawerPanelContent>
  );

  return (
    <>
      <Modal
        variant={ModalVariant.large}
        title=""
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      >
        <Toolbar style={{ padding: 'var(--pf-t--global--spacer--md)' }}>
          <ToolbarContent>
            <ToolbarItem style={{ width: '100%' }}>
              <SearchInput
                placeholder="Search by name, description, or category"
                value={templateSearch}
                onChange={(_event, value) => setTemplateSearch(value)}
                onClear={() => setTemplateSearch('')}
                style={{ width: '100%' }}
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Role templates table" variant="compact">
          <Thead>
            <Tr>
              <Th width={25}>Name</Th>
              <Th width={20}>Category</Th>
              <Th width={40}>Description</Th>
              <Th width={15}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTemplates.map((template) => (
              <Tr key={template.name}>
                <Td dataLabel="Name" width={25} style={{ textAlign: 'left' }}>{template.name}</Td>
                <Td dataLabel="Category" width={20} style={{ textAlign: 'left' }}>
                  <Label color="grey">{template.category}</Label>
                </Td>
                <Td dataLabel="Description" width={40} style={{ textAlign: 'left' }}>{template.description}</Td>
                <Td dataLabel="Actions" width={15} style={{ textAlign: 'left' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUseTemplate(template.name)}
                  >
                    Use template
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Modal>

      <Drawer isExpanded={isDrawerOpen} onExpand={() => setIsDrawerOpen(true)}>
        <DrawerContent panelContent={drawerPanelContent}>
          <DrawerContentBody>
            <div style={{ padding: '24px' }}>
              <Breadcrumb style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/user-management/roles'); }}>
                  Roles
                </BreadcrumbItem>
                <BreadcrumbItem isActive>Create custom role</BreadcrumbItem>
              </Breadcrumb>

              <Title headingLevel="h1" size="2xl" style={{ marginBottom: '16px' }}>
                Create New Role
              </Title>

      <Grid hasGutter span={6}>
        <GridItem span={6}>
          <Card>
            <CardBody>
              <Split hasGutter>
                <SplitItem isFilled>
                  <Title headingLevel="h2" size="lg">Role Configuration</Title>
                </SplitItem>
                <SplitItem>
                  <Button variant="link" isInline onClick={() => setIsTemplateModalOpen(true)}>
                    See all templates
                  </Button>
                </SplitItem>
                <SplitItem>
                  <Button variant="plain">Clear All</Button>
                </SplitItem>
              </Split>

              <Form style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                <FormGroup label="Role Name" isRequired fieldId="role-name">
                  <TextInput
                    isRequired
                    type="text"
                    id="role-name"
                    name="role-name"
                    value={roleName}
                    onChange={(_event, value) => setRoleName(value)}
                  />
                  <Content component="small" className="pf-v6-u-color-200">
                    Use lowercase letters, numbers, and hyphens only
                  </Content>
                </FormGroup>

                <FormGroup label="Labels" fieldId="labels">
                  <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm">
                    Add key/value labels to organize and find this role (for example by organization or team).
                  </Content>
                  <Button variant="link" isInline icon={<PlusCircleIcon />} style={{ paddingLeft: 0 }}>
                    Add label
                  </Button>
                </FormGroup>

                <FormGroup label="Description" fieldId="description">
                  <TextArea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(_event, value) => setDescription(value)}
                    placeholder="Explain what this role is for and who should use it"
                    rows={4}
                  />
                </FormGroup>

                <Divider style={{ margin: 'var(--pf-t--global--spacer--lg) 0' }} />

                <FormGroup label="Navigation Access" fieldId="navigation-access">
                  <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                    Control which perspectives and pages are visible to users with this role. You can grant access to entire perspectives or select specific pages within each perspective.
                  </Content>
                  
                  {Object.entries(navigationAccess).map(([perspective, access]) => (
                    <ExpandableSection
                      key={perspective}
                      toggleText={perspective}
                      style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                    >
                      <div style={{ paddingLeft: 'var(--pf-t--global--spacer--md)', paddingTop: 'var(--pf-t--global--spacer--sm)' }}>
                        <Radio
                          id={`${perspective}-bundle`}
                          name={`${perspective}-mode`}
                          label="Grant access to entire perspective (bundle)"
                          description="Users will have access to all pages within this perspective"
                          isChecked={access.mode === 'bundle'}
                          onChange={() => {
                            setNavigationAccess({
                              ...navigationAccess,
                              [perspective]: { ...access, mode: 'bundle' }
                            });
                          }}
                          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
                        />
                        
                        <Radio
                          id={`${perspective}-specific`}
                          name={`${perspective}-mode`}
                          label="Select specific pages"
                          description="Choose which individual pages users can access"
                          isChecked={access.mode === 'specific'}
                          onChange={() => {
                            setNavigationAccess({
                              ...navigationAccess,
                              [perspective]: { ...access, mode: 'specific' }
                            });
                          }}
                          style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}
                        />
                        
                        {access.mode === 'specific' && (
                          <div style={{ 
                            paddingLeft: 'var(--pf-t--global--spacer--xl)', 
                            marginTop: 'var(--pf-t--global--spacer--md)',
                            borderLeft: '2px solid var(--pf-t--global--border--color--default)',
                            paddingTop: 'var(--pf-t--global--spacer--sm)',
                            paddingBottom: 'var(--pf-t--global--spacer--sm)',
                          }}>
                            <Content component="p" className="pf-v6-u-font-size-sm pf-v6-u-font-weight-bold" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                              Select pages:
                            </Content>
                            <Grid hasGutter span={6}>
                              {Object.keys(access.pages).map(page => (
                                <GridItem span={6} key={page}>
                                  <Checkbox
                                    id={`${perspective}-${page}`}
                                    label={page}
                                    isChecked={access.pages[page]}
                                    onChange={(_event, checked) => {
                                      setNavigationAccess({
                                        ...navigationAccess,
                                        [perspective]: {
                                          ...access,
                                          pages: {
                                            ...access.pages,
                                            [page]: checked
                                          }
                                        }
                                      });
                                    }}
                                  />
                                </GridItem>
                              ))}
                            </Grid>
                          </div>
                        )}
                      </div>
                    </ExpandableSection>
                  ))}
                </FormGroup>

                <Divider style={{ margin: 'var(--pf-t--global--spacer--lg) 0' }} />

                <Split hasGutter style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                  <SplitItem isFilled>
                    <Title headingLevel="h3" size="md">Permission Rules</Title>
                  </SplitItem>
                  <SplitItem>
                    <Button variant="link" isInline icon={<PlusCircleIcon />} onClick={handleAddRule}>
                      Add Rule
                    </Button>
                  </SplitItem>
                </Split>

                {permissionRules.map((rule, index) => (
                  <Card key={rule.id} style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                    <CardBody>
                      <Split hasGutter>
                        <SplitItem isFilled>
                          <Title headingLevel="h4" size="md">Rule {index + 1}</Title>
                        </SplitItem>
                        {permissionRules.length > 1 && (
                          <SplitItem>
                            <Button 
                              variant="plain" 
                              icon={<MinusCircleIcon />} 
                              onClick={() => handleRemoveRule(rule.id)}
                              aria-label="Remove rule"
                            />
                          </SplitItem>
                        )}
                      </Split>

                      <FormGroup 
                        label="API Groups" 
                        fieldId={`api-groups-${rule.id}`}
                        style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                      >
                        <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm">
                          Enter one or more API groups for this rule. Separate multiple values with commas.
                        </Content>
                        <TextInput
                          type="text"
                          id={`api-groups-${rule.id}`}
                          value={rule.apiGroups}
                          onChange={(_event, value) => handleRuleChange(rule.id, 'apiGroups', value)}
                          placeholder="Enter API groups"
                        />
                        <Button 
                          variant="link" 
                          isInline 
                          style={{ paddingLeft: 0, marginTop: 'var(--pf-t--global--spacer--sm)' }}
                          onClick={() => handleOpenDrawer(rule.id, 'apiGroups')}
                        >
                          Browse API catalog
                        </Button>
                      </FormGroup>

                      <FormGroup label="Resources" fieldId={`resources-${rule.id}`}>
                        <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm">
                          Enter one or more resource types for the selected API groups. Separate multiple values with commas.
                        </Content>
                        <TextInput
                          type="text"
                          id={`resources-${rule.id}`}
                          value={rule.resources}
                          onChange={(_event, value) => handleRuleChange(rule.id, 'resources', value)}
                          placeholder="Enter resources"
                        />
                        <Button 
                          variant="link" 
                          isInline 
                          style={{ paddingLeft: 0, marginTop: 'var(--pf-t--global--spacer--sm)' }}
                          onClick={() => handleOpenDrawer(rule.id, 'resources')}
                        >
                          Browse resources catalog
                        </Button>
                      </FormGroup>

                      <FormGroup label="Verbs (Permissions)" fieldId={`verbs-${rule.id}`}>
                        <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm">
                          Select the actions this rule allows on the chosen resources.
                        </Content>
                        <Grid hasGutter span={6} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                          {allVerbs.map(verb => (
                            <GridItem span={6} key={verb.name}>
                              <Checkbox
                                id={`verb-${rule.id}-${verb.name}`}
                                label={verb.label}
                                isChecked={rule.verbs.includes(verb.name)}
                                onChange={(_event, checked) => handleVerbToggle(rule.id, verb.name, checked)}
                              />
                            </GridItem>
                          ))}
                        </Grid>
                      </FormGroup>
                    </CardBody>
                  </Card>
                ))}
              </Form>
            </CardBody>
          </Card>

          <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
            <Button variant="primary" onClick={handleCreateRole}>
              Create Role
            </Button>{' '}
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </GridItem>

        <GridItem span={6}>
          <Card isFullHeight>
            <CardBody>
              <Split hasGutter>
                <SplitItem isFilled>
                  <Title headingLevel="h2" size="lg">Live YAML</Title>
                </SplitItem>
                <SplitItem>
                  <Button 
                    variant="link" 
                    isInline 
                    onClick={() => setIsEditingYAML(!isEditingYAML)}
                  >
                    {isEditingYAML ? 'Disable editing' : 'Enable editing'}
                  </Button>
                </SplitItem>
                <SplitItem>
                  <Button variant="plain">Copy YAML</Button>
                </SplitItem>
              </Split>
              <Content component="p" className="pf-v6-u-color-200 pf-v6-u-font-size-sm" style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                Auto-generated from the form. Enable editing to make manual adjustments.
              </Content>
              <CodeBlock style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                <CodeBlockCode>
                  {generateYAML()}
                </CodeBlockCode>
              </CodeBlock>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export { CreateRole };

