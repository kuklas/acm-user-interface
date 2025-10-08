import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Content,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const IdentityDetail: React.FunctionComponent = () => {
  const { identityName } = useParams<{ identityName: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  
  useDocumentTitle(`ACM | ${identityName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
  };

  const DetailsTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <Content component="p">
            Details for {identityName}
          </Content>
        </CardBody>
      </Card>
    </div>
  );

  const YAMLTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <Content component="p">
            YAML configuration for {identityName}
          </Content>
        </CardBody>
      </Card>
    </div>
  );

  const RoleAssignmentsTab = () => (
    <div className="table-content-card">
      <EmptyState>
        <CubesIcon />
        <Title headingLevel="h2" size="lg">
          No role assignment created yet
        </Title>
        <EmptyStateBody>
          Description text that allows users to easily understand what this is for and how does it help them achieve their needs.
        </EmptyStateBody>
        <EmptyStateActions>
          <Button variant="primary" onClick={handleCreateRoleAssignment}>
            Create role assignment
          </Button>
        </EmptyStateActions>
        <EmptyStateBody>
          <Button component="a" href="#" variant="link">
            Link to documentation
          </Button>
        </EmptyStateBody>
      </EmptyState>
    </div>
  );

  const GroupsTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <Content component="p">
            Groups for {identityName}
          </Content>
        </CardBody>
      </Card>
    </div>
  );

  const UsersTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <Content component="p">
            Users for {identityName}
          </Content>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <>
      <PageSection>
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management');
              }}
            >
              User management
            </BreadcrumbItem>
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/user-management/identities');
              }}
            >
              Identities
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{identityName}</BreadcrumbItem>
          </Breadcrumb>
          
          <Title headingLevel="h1" size="lg">
            {identityName}
          </Title>
          
          <Content component="p" className="pf-v6-u-color-200">
            {identityName}
          </Content>
          
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Identity detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Details</TabTitleText>} aria-label="Details tab">
              <div className="page-content-section">
                <DetailsTab />
              </div>
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>YAML</TabTitleText>} aria-label="YAML tab">
              <div className="page-content-section">
                <YAMLTab />
              </div>
            </Tab>
            <Tab eventKey={2} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab">
              <div className="page-content-section">
                <RoleAssignmentsTab />
              </div>
            </Tab>
            <Tab eventKey={3} title={<TabTitleText>Groups</TabTitleText>} aria-label="Groups tab">
              <div className="page-content-section">
                <GroupsTab />
              </div>
            </Tab>
          </Tabs>
        </div>
      </PageSection>

      <RoleAssignmentWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </>
  );
};

export { IdentityDetail };

