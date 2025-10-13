import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Label,
  CodeBlock,
  CodeBlockCode,
  Split,
  SplitItem,
  Content,
} from '@patternfly/react-core';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

const RoleDetail: React.FunctionComponent = () => {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();
  useDocumentTitle(`ACM RBAC | ${roleName}`);

  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  // Mock data for the role
  const roleData = {
    name: roleName || 'pod-reader',
    category: 'General',
    origin: 'User created',
    created: '2024-01-15T10:30:00Z',
    description: 'Read-only access to pods in default namespace',
    annotations: {
      description: 'Read-only access to pods in default namespace',
    },
    yaml: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: ${roleName || 'pod-reader'}
  namespace: default
  annotations:
    description: "Read-only access to pods in default namespace"
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]`,
    rules: [
      {
        apiGroups: ['""'],
        resources: ['pods'],
        verbs: ['get', 'list', 'watch'],
      },
    ],
  };

  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  const handleBack = () => {
    navigate('/user-management/roles');
  };

  const handleEditRole = () => {
    console.log('Edit role:', roleName);
    // Navigate to edit page or open edit modal
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="detail-page-header">
        <Breadcrumb className="pf-v6-u-mb-md">
          <BreadcrumbItem to="#" onClick={(e) => { e.preventDefault(); navigate('/user-management/roles'); }}>
            Roles
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{roleData.name}</BreadcrumbItem>
        </Breadcrumb>

        <Split hasGutter className="pf-v6-u-mb-md">
          <SplitItem isFilled>
            <Title headingLevel="h1" size="2xl">
              {roleData.name}
            </Title>
          </SplitItem>
          <SplitItem>
            <Button variant="primary" onClick={handleEditRole}>
              Edit Role
            </Button>
          </SplitItem>
          <SplitItem>
            <Button variant="link" onClick={handleBack}>
              Back
            </Button>
          </SplitItem>
        </Split>

        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label="Role details tabs"
        >
        <Tab eventKey={0} title={<TabTitleText>General</TabTitleText>} aria-label="General"></Tab>
        <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML"></Tab>
        <Tab eventKey={2} title={<TabTitleText>Permissions</TabTitleText>} aria-label="Permissions"></Tab>
        <Tab eventKey={3} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments"></Tab>
      </Tabs>
      </div>

      <div className="detail-page-content">
        {activeTabKey === 0 && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Information
              </Title>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>Category</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label color="grey">{roleData.category}</Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Origin</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.origin}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Created</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.created}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>{roleData.description}</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Annotations</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Content component="p">
                      <strong>description:</strong> {roleData.annotations.description}
                    </Content>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </CardBody>
          </Card>
        )}

        {activeTabKey === 1 && (
          <Card>
            <CardBody>
              <CodeBlock>
                <CodeBlockCode>
                  {roleData.yaml}
                </CodeBlockCode>
              </CodeBlock>
            </CardBody>
          </Card>
        )}

        {activeTabKey === 2 && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Permission Rules
              </Title>
              {roleData.rules.map((rule, index) => (
                <div key={index} style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
                  <Title headingLevel="h3" size="md" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                    Rule {index + 1}
                  </Title>
                  <DescriptionList isHorizontal>
                    <DescriptionListGroup>
                      <DescriptionListTerm>API Groups</DescriptionListTerm>
                      <DescriptionListDescription>
                        {rule.apiGroups.join(', ')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Resources</DescriptionListTerm>
                      <DescriptionListDescription>
                        {rule.resources.join(', ')}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Verbs</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Split hasGutter>
                          {rule.verbs.map((verb) => (
                            <SplitItem key={verb}>
                              <Label isCompact>{verb}</Label>
                            </SplitItem>
                          ))}
                        </Split>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {activeTabKey === 3 && (
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                Role Assignments
              </Title>
              <Content component="p" className="pf-v6-u-color-200">
                No role assignments found for this role.
              </Content>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export { RoleDetail };

