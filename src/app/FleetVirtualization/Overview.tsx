import React, { useState } from 'react';
import {
  Title,
  Card,
  CardBody,
  Grid,
  GridItem,
  Button,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  ExpandableSection,
  Content,
  Divider,
} from '@patternfly/react-core';
import {
  RocketIcon,
  BullhornIcon,
  CubesIcon,
  ExclamationCircleIcon,
  OffIcon,
  PauseCircleIcon,
  CheckCircleIcon,
  AngleRightIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

const Overview: React.FunctionComponent = () => {
  const [isHealthAlertsOpen, setIsHealthAlertsOpen] = useState(false);
  const [isVMResourceOpen, setIsVMResourceOpen] = useState(false);
  const [isAdditionalStatusesExpanded, setIsAdditionalStatusesExpanded] = useState(false);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      {/* Getting started resources */}
      <ExpandableSection
        toggleText="Getting started resources"
        isExpanded={true}
        displaySize="lg"
      >
        <Grid hasGutter style={{ marginTop: '16px' }}>
          <GridItem span={4}>
            <Card isFullHeight>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <RocketIcon style={{ fontSize: '20px', color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                  <Title headingLevel="h3" size="lg">Quick Starts</Title>
                </div>
                <Content style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Learn how to create, import, and run virtual machines on OpenShift with step-by-step instructions and tasks.
                </Content>
                <div style={{ marginBottom: '12px' }}>
                  <Button variant="link" isInline>
                    Create a virtual machine from a volume
                  </Button>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <Button variant="link" isInline>
                  View all quick starts
                </Button>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={4}>
            <Card isFullHeight>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BullhornIcon style={{ fontSize: '20px', color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                  <Title headingLevel="h3" size="lg">Feature highlights</Title>
                </div>
                <Content style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Read about the latest information and key virtualization features on the Virtualization highlights.
                </Content>
                <div style={{ marginBottom: '12px' }}>
                  <Button variant="link" isInline>
                    Save memory with OpenShift Virtualization using Free Page Reporting
                  </Button>
                  <span style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginLeft: '8px' }}>
                    • 8 min read
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <Button variant="link" isInline>
                    OpenShift Virtualization 4.20 Highlights
                  </Button>
                  <span style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginLeft: '8px' }}>
                    • 5 min read
                  </span>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <Button variant="link" isInline>
                  Visit the blog
                </Button>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={4}>
            <Card isFullHeight>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CubesIcon style={{ fontSize: '20px', color: 'var(--pf-t--global--icon--color--brand--default)' }} />
                  <Title headingLevel="h3" size="lg">Related operators</Title>
                </div>
                <Content style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Ease operational complexity with virtualization by using Operators.
                </Content>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 500 }}>Kubernetes NMState Operator</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 500 }}>OpenShift Data Foundation</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 500 }}>Migration Toolkit for Virtualization</div>
                  <Content style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Migrate multiple virtual machine workloads to OpenShift Virtualization.
                  </Content>
                </div>
                <Divider style={{ margin: '16px 0' }} />
                <Button variant="link" isInline>
                  Learn more about Operators
                </Button>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </ExpandableSection>

      {/* Metric Cards */}
      <Grid hasGutter style={{ marginTop: '24px' }}>
        <GridItem span={3}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="2xl" style={{ textAlign: 'center', marginBottom: '8px' }}>
                4
              </Title>
              <Content style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                VirtualMachines
              </Content>
              <Content style={{ textAlign: 'center', fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '16px' }}>
                Last 8 days' trend
              </Content>
              <div style={{ height: '100px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  5 VMs
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  0 VMs
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Oct 17
                </div>
                <svg width="100%" height="100" viewBox="0 0 280 100" style={{ marginLeft: '30px' }}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#d2d2d2" strokeWidth="1" />
                  ))}
                  {/* Area chart */}
                  <path
                    d="M 0 80 L 35 80 L 70 80 L 105 80 L 140 80 L 175 20 L 210 40 L 245 40 L 245 100 L 0 100 Z"
                    fill="rgba(6, 153, 220, 0.2)"
                    stroke="#0699dc"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={3}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="2xl" style={{ textAlign: 'center', marginBottom: '8px' }}>
                2
              </Title>
              <Content style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                vCPU usage
              </Content>
              <Content style={{ textAlign: 'center', fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '16px' }}>
                Last 8 days' trend
              </Content>
              <div style={{ height: '100px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  2 vCPU
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  0 vCPU
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Oct 17
                </div>
                <svg width="100%" height="100" viewBox="0 0 280 100" style={{ marginLeft: '30px' }}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#d2d2d2" strokeWidth="1" />
                  ))}
                  {/* Area chart - flat line at 2 vCPU */}
                  <path
                    d="M 0 50 L 35 50 L 70 50 L 105 50 L 140 50 L 175 50 L 210 50 L 245 50 L 245 100 L 0 100 Z"
                    fill="rgba(6, 153, 220, 0.2)"
                    stroke="#0699dc"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={3}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="2xl" style={{ textAlign: 'center', marginBottom: '8px' }}>
                881.5
              </Title>
              <Content style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                Memory (MiB)
              </Content>
              <Content style={{ textAlign: 'center', fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '16px' }}>
                Last 8 days' trend
              </Content>
              <div style={{ height: '100px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  905.2 MiB
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  0 MiB
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Oct 17
                </div>
                <svg width="100%" height="100" viewBox="0 0 280 100" style={{ marginLeft: '30px' }}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#d2d2d2" strokeWidth="1" />
                  ))}
                  {/* Area chart - small dip at the end */}
                  <path
                    d="M 0 10 L 35 10 L 70 10 L 105 10 L 140 10 L 175 10 L 210 13 L 245 13 L 245 100 L 0 100 Z"
                    fill="rgba(6, 153, 220, 0.2)"
                    stroke="#0699dc"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={3}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="2xl" style={{ textAlign: 'center', marginBottom: '8px' }}>
                3.93
              </Title>
              <Content style={{ textAlign: 'center', fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                Storage (GiB)
              </Content>
              <Content style={{ textAlign: 'center', fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '16px' }}>
                Last 8 days' trend
              </Content>
              <div style={{ height: '100px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  3.93 GiB
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  0 GiB
                </div>
                <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: '10px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                  Oct 17
                </div>
                <svg width="100%" height="100" viewBox="0 0 280 100" style={{ marginLeft: '30px' }}>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="280" y2={y} stroke="#d2d2d2" strokeWidth="1" />
                  ))}
                  {/* Area chart - flat line */}
                  <path
                    d="M 0 10 L 35 10 L 70 10 L 105 10 L 140 10 L 175 10 L 210 10 L 245 10 L 245 100 L 0 100 Z"
                    fill="rgba(6, 153, 220, 0.2)"
                    stroke="#0699dc"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Alerts */}
      <Card style={{ marginTop: '24px' }}>
        <CardBody>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title headingLevel="h3" size="lg">Alerts (0)</Title>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button variant="link">View all</Button>
              <Dropdown
                isOpen={isHealthAlertsOpen}
                onSelect={() => setIsHealthAlertsOpen(false)}
                onOpenChange={(isOpen) => setIsHealthAlertsOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsHealthAlertsOpen(!isHealthAlertsOpen)}
                    isExpanded={isHealthAlertsOpen}
                  >
                    Show virtualization health alerts
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="all">All alerts</DropdownItem>
                  <DropdownItem key="critical">Critical alerts only</DropdownItem>
                  <DropdownItem key="warning">Warning alerts only</DropdownItem>
                </DropdownList>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Bottom section: VM statuses and VMs per resource */}
      <Grid hasGutter style={{ marginTop: '24px' }}>
        <GridItem span={6}>
          <Card isFullHeight>
            <CardBody>
              <Title headingLevel="h3" size="lg" style={{ marginBottom: '24px' }}>
                VirtualMachine statuses
              </Title>
              <Grid hasGutter>
                <GridItem span={3}>
                  <div style={{ textAlign: 'center' }}>
                    <ExclamationCircleIcon style={{ fontSize: '24px', color: 'var(--pf-t--global--icon--color--status--danger--default)', marginBottom: '8px' }} />
                    <Title headingLevel="h2" size="xl">0</Title>
                    <Content style={{ fontSize: '14px' }}>Error</Content>
                  </div>
                </GridItem>
                <GridItem span={3}>
                  <div style={{ textAlign: 'center' }}>
                    <CheckCircleIcon style={{ fontSize: '24px', color: 'var(--pf-t--global--icon--color--status--success--default)', marginBottom: '8px' }} />
                    <Title headingLevel="h2" size="xl">2</Title>
                    <Content style={{ fontSize: '14px' }}>Running</Content>
                  </div>
                </GridItem>
                <GridItem span={3}>
                  <div style={{ textAlign: 'center' }}>
                    <OffIcon style={{ fontSize: '24px', color: 'var(--pf-t--global--icon--color--subtle)', marginBottom: '8px' }} />
                    <Title headingLevel="h2" size="xl">2</Title>
                    <Content style={{ fontSize: '14px' }}>Stopped</Content>
                  </div>
                </GridItem>
                <GridItem span={3}>
                  <div style={{ textAlign: 'center' }}>
                    <PauseCircleIcon style={{ fontSize: '24px', color: 'var(--pf-t--global--icon--color--subtle)', marginBottom: '8px' }} />
                    <Title headingLevel="h2" size="xl">0</Title>
                    <Content style={{ fontSize: '14px' }}>Paused</Content>
                  </div>
                </GridItem>
              </Grid>
              <Divider style={{ margin: '24px 0' }} />
              <ExpandableSection
                toggleText="Additional statuses (6)"
                isExpanded={isAdditionalStatusesExpanded}
                onToggle={(_event, isExpanded) => setIsAdditionalStatusesExpanded(isExpanded)}
              >
                <div style={{ paddingTop: '16px' }}>
                  <Content style={{ fontSize: '14px', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Additional status information would appear here
                  </Content>
                </div>
              </ExpandableSection>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem span={6}>
          <Card isFullHeight>
            <CardBody>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title headingLevel="h3" size="lg">
                  VirtualMachines per resource
                </Title>
                <Dropdown
                  isOpen={isVMResourceOpen}
                  onSelect={() => setIsVMResourceOpen(false)}
                  onOpenChange={(isOpen) => setIsVMResourceOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsVMResourceOpen(!isVMResourceOpen)}
                      isExpanded={isVMResourceOpen}
                    >
                      Show VirtualMachine per Templates
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem key="templates">Show VirtualMachine per Templates</DropdownItem>
                    <DropdownItem key="clusters">Show VirtualMachine per Clusters</DropdownItem>
                    <DropdownItem key="projects">Show VirtualMachine per Projects</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                {/* Donut chart placeholder */}
                <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '24px' }}>
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    {/* Blue segment (50%) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#06c"
                      strokeWidth="40"
                      strokeDasharray="220 440"
                      transform="rotate(-90 100 100)"
                    />
                    {/* Light blue segment (50%) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke="#73bcf7"
                      strokeWidth="40"
                      strokeDasharray="220 440"
                      strokeDashoffset="-220"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <Title headingLevel="h2" size="2xl">2</Title>
                    <Content style={{ fontSize: '16px' }}>VMs</Content>
                  </div>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#06c', borderRadius: '2px' }}></div>
                    <Content style={{ fontSize: '14px' }}>1 fedora-server-small</Content>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#73bcf7', borderRadius: '2px' }}></div>
                    <Content style={{ fontSize: '14px' }}>1 rhel9-server-small</Content>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Overview;

