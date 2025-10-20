import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Grid,
  GridItem,
  Title,
  Content,
  Button,
  ExpandableSection,
  Label,
} from '@patternfly/react-core';
import { CheckCircleIcon, AngleRightIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';

const Settings: React.FunctionComponent = () => {
  const [activeSection, setActiveSection] = useState('Cluster');
  const [virtualizationFeaturesExpanded, setVirtualizationFeaturesExpanded] = useState(false);
  const [generalSettingsExpanded, setGeneralSettingsExpanded] = useState(false);
  const [guestManagementExpanded, setGuestManagementExpanded] = useState(false);
  const [resourceManagementExpanded, setResourceManagementExpanded] = useState(false);
  const [scsiExpanded, setScsiExpanded] = useState(false);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <Grid hasGutter>
        {/* Left sidebar */}
        <GridItem span={2}>
          <Card>
            <CardBody style={{ padding: 0 }}>
              <div
                onClick={() => setActiveSection('Cluster')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'Cluster' ? 'var(--pf-t--global--background--color--primary--clicked)' : 'transparent',
                  borderLeft: activeSection === 'Cluster' ? '3px solid var(--pf-t--global--color--brand--default)' : '3px solid transparent',
                  fontWeight: activeSection === 'Cluster' ? 500 : 400,
                }}
              >
                Cluster
              </div>
              <div
                onClick={() => setActiveSection('User')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'User' ? 'var(--pf-t--global--background--color--primary--clicked)' : 'transparent',
                  borderLeft: activeSection === 'User' ? '3px solid var(--pf-t--global--color--brand--default)' : '3px solid transparent',
                  fontWeight: activeSection === 'User' ? 500 : 400,
                }}
              >
                User
              </div>
              <div
                onClick={() => setActiveSection('Preview features')}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: activeSection === 'Preview features' ? 'var(--pf-t--global--background--color--primary--clicked)' : 'transparent',
                  borderLeft: activeSection === 'Preview features' ? '3px solid var(--pf-t--global--color--brand--default)' : '3px solid transparent',
                  fontWeight: activeSection === 'Preview features' ? 500 : 400,
                }}
              >
                Preview features
              </div>
            </CardBody>
          </Card>
        </GridItem>

        {/* Main content area */}
        <GridItem span={10}>
          <Card>
            <CardBody>
              {activeSection === 'Cluster' && (
                <>
                  {/* Version information */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      padding: '24px',
                      marginBottom: '24px',
                    }}
                  >
                    <Grid hasGutter>
                      <GridItem span={4}>
                        <Content style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                          Installed version
                        </Content>
                        <Content style={{ fontSize: '16px' }}>4.20.0-194</Content>
                      </GridItem>
                      <GridItem span={4}>
                        <Content style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                          Update status
                        </Content>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                          <Content style={{ fontSize: '16px' }}>Up to date</Content>
                        </div>
                      </GridItem>
                      <GridItem span={4}>
                        <Content style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                          Channel
                        </Content>
                        <Content style={{ fontSize: '16px' }}>
                          <a
                            href="#"
                            style={{
                              color: 'var(--pf-t--global--color--brand--default)',
                              textDecoration: 'underline',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            stable
                            <ExternalLinkAltIcon style={{ fontSize: '12px' }} />
                          </a>
                        </Content>
                      </GridItem>
                    </Grid>
                  </div>

                  {/* Virtualization features */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      onClick={() => setVirtualizationFeaturesExpanded(!virtualizationFeaturesExpanded)}
                      style={{
                        padding: '16px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AngleRightIcon
                          style={{
                            transform: virtualizationFeaturesExpanded ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        />
                        <Title headingLevel="h3" size="md">
                          Virtualization features
                        </Title>
                      </div>
                      <Button variant="primary">Configure features</Button>
                    </div>
                    {virtualizationFeaturesExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        <Content>Virtualization features configuration content...</Content>
                      </div>
                    )}
                  </div>

                  {/* General settings */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      onClick={() => setGeneralSettingsExpanded(!generalSettingsExpanded)}
                      style={{
                        padding: '16px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <AngleRightIcon
                        style={{
                          transform: generalSettingsExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Title headingLevel="h3" size="md">
                        General settings
                      </Title>
                    </div>
                    {generalSettingsExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        <Content>General settings configuration content...</Content>
                      </div>
                    )}
                  </div>

                  {/* Guest management */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      onClick={() => setGuestManagementExpanded(!guestManagementExpanded)}
                      style={{
                        padding: '16px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <AngleRightIcon
                        style={{
                          transform: guestManagementExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Title headingLevel="h3" size="md">
                        Guest management
                      </Title>
                    </div>
                    {guestManagementExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        <Content>Guest management configuration content...</Content>
                      </div>
                    )}
                  </div>

                  {/* Resource management */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      onClick={() => setResourceManagementExpanded(!resourceManagementExpanded)}
                      style={{
                        padding: '16px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <AngleRightIcon
                        style={{
                          transform: resourceManagementExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Title headingLevel="h3" size="md">
                        Resource management
                      </Title>
                    </div>
                    {resourceManagementExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        <Content>Resource management configuration content...</Content>
                      </div>
                    )}
                  </div>

                  {/* SCSI persistent reservation */}
                  <div
                    style={{
                      border: '1px solid var(--pf-t--global--border--color--default)',
                      borderRadius: 'var(--pf-t--global--border--radius--small)',
                    }}
                  >
                    <div
                      onClick={() => setScsiExpanded(!scsiExpanded)}
                      style={{
                        padding: '16px 24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <AngleRightIcon
                        style={{
                          transform: scsiExpanded ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s',
                        }}
                      />
                      <Title headingLevel="h3" size="md">
                        SCSI persistent reservation
                      </Title>
                    </div>
                    {scsiExpanded && (
                      <div style={{ padding: '0 24px 24px 24px' }}>
                        <Content>SCSI persistent reservation configuration content...</Content>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSection === 'User' && (
                <div style={{ padding: '24px' }}>
                  <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
                    User Settings
                  </Title>
                  <Content>User settings content coming soon...</Content>
                </div>
              )}

              {activeSection === 'Preview features' && (
                <div style={{ padding: '24px' }}>
                  <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
                    Preview Features
                  </Title>
                  <Content>Preview features content coming soon...</Content>
                </div>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Settings;

