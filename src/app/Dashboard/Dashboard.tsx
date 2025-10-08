import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardTitle,
  CardBody,
  Gallery,
  Button,
  Flex,
  FlexItem,
  Content,
  Icon,
} from '@patternfly/react-core';
import { UsersIcon, CubesIcon, KeyIcon, ServerIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { RoleAssignmentWizard } from '@app/RoleAssignment/RoleAssignmentWizard';

const Dashboard: React.FunctionComponent = () => {
  useDocumentTitle('ACM RBAC | Dashboard');
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);

  const stats = [
    { title: 'Total Users', value: '45', icon: UsersIcon, color: 'blue' },
    { title: 'Groups', value: '12', icon: CubesIcon, color: 'green' },
    { title: 'Roles', value: '24', icon: KeyIcon, color: 'purple' },
    { title: 'Clusters', value: '8', icon: ServerIcon, color: 'orange' },
  ];

  return (
    <>
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              alignItems={{ default: 'alignItemsCenter' }}
            >
              <FlexItem>
                <Title headingLevel="h1" size="lg">
                  Advanced Cluster Management - RBAC Dashboard
                </Title>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="primary"
                  icon={<PlusCircleIcon />}
                  onClick={() => setIsWizardOpen(true)}
                  size="lg"
                >
                  Create Role Assignment
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
          
          <FlexItem>
            <Gallery hasGutter minWidths={{ default: '250px' }}>
              {stats.map((stat, index) => (
                <Card key={index} isFullHeight>
                  <CardTitle>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <Icon size="lg">
                          <stat.icon />
                        </Icon>
                      </FlexItem>
                      <FlexItem>
                        <Content component="p">{stat.title}</Content>
                      </FlexItem>
                    </Flex>
                  </CardTitle>
                  <CardBody>
                    <Content component="h2" className="pf-v6-u-font-size-3xl pf-v6-u-font-weight-bold">
                      {stat.value}
                    </Content>
                  </CardBody>
                </Card>
              ))}
            </Gallery>
          </FlexItem>

          <FlexItem>
            <Card>
              <CardTitle>Quick Actions</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Button variant="link" isInline onClick={() => setIsWizardOpen(true)}>
                      Create a new role assignment
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="link" isInline component="a" href="/identities">
                      Manage users and groups
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="link" isInline component="a" href="/roles">
                      View and create roles
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="link" isInline component="a" href="/inventory">
                      Browse cluster inventory
                    </Button>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>

          <FlexItem>
            <Card>
              <CardTitle>Recent Activity</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Content component="p" className="pf-v6-u-font-size-sm">
                      <strong>John Doe</strong> was assigned <strong>kubevirt.io:admin</strong> role on{' '}
                      <strong>production-cluster</strong>
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p" className="pf-v6-u-font-size-sm">
                      <strong>developers</strong> group was granted <strong>kubevirt.io:edit</strong> on{' '}
                      <strong>staging-cluster</strong>
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p" className="pf-v6-u-font-size-sm">
                      New custom role <strong>custom-vm-operator</strong> was created
                    </Content>
                  </FlexItem>
                  <FlexItem>
                    <Content component="p" className="pf-v6-u-font-size-sm">
                      <strong>Alice Williams</strong> was added to <strong>cluster-admins</strong> group
                    </Content>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>
        </Flex>
      </PageSection>

      <RoleAssignmentWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </>
  );
};

export { Dashboard };
