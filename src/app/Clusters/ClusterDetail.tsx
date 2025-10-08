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
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Card,
  CardBody,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const ClusterDetail: React.FunctionComponent = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const navigate = useNavigate();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  
  useDocumentTitle(`ACM | ${clusterName}`);

  const handleTabClick = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const handleCreateRoleAssignment = () => {
    setIsWizardOpen(true);
  };

  const OverviewTab = () => (
    <div className="table-content-card">
      <Card>
        <CardBody>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>Name</DescriptionListTerm>
              <DescriptionListDescription>{clusterName}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Namespace</DescriptionListTerm>
              <DescriptionListDescription>{clusterName}</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Namespace bindings</DescriptionListTerm>
              <DescriptionListDescription>None</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Ready test</DescriptionListTerm>
              <DescriptionListDescription>None</DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>Role assignments</DescriptionListTerm>
              <DescriptionListDescription>0</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    </div>
  );

  const RoleAssignmentsTab = () => (
    <div className="table-content-card">
      <EmptyState>
        <CubesIcon />
        <Title headingLevel="h2" size="lg">
          No role assignments created yet
        </Title>
        <EmptyStateBody>
          Control what users and groups can access or view by assigning them a role for your managed resources.
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

  return (
    <>
      <PageSection>
        <div className="page-header-section">
          <Breadcrumb className="pf-v6-u-mb-md">
            <BreadcrumbItem
              to="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/infrastructure/clusters');
              }}
            >
              Clusters
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>
          </Breadcrumb>
          
          <Title headingLevel="h1" size="lg">
            {clusterName}
          </Title>
          
          <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Cluster detail tabs">
            <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>} aria-label="Overview tab">
              <div className="page-content-section">
                <OverviewTab />
              </div>
            </Tab>
            <Tab eventKey={1} title={<TabTitleText>Role assignments</TabTitleText>} aria-label="Role assignments tab">
              <div className="page-content-section">
                <RoleAssignmentsTab />
              </div>
            </Tab>
          </Tabs>
        </div>
      </PageSection>

      <RoleAssignmentWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} clusterName={clusterName} />
    </>
  );
};

export { ClusterDetail };

