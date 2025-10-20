import React, { useState } from 'react';
import {
  PageSection,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  Content,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import Overview from './Overview';

const Virtualization: React.FunctionComponent = () => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <div style={{ backgroundColor: '#151515' }}>
      {/* Header section with title and link */}
      <PageSection style={{ backgroundColor: '#151515', paddingBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title headingLevel="h1" size="2xl" style={{ color: '#ffffff' }}>
            Virtualization
          </Title>
          <a
            href="#"
            style={{
              color: '#73bcf7',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Download the virtctl command-line utility
            <ExternalLinkAltIcon style={{ fontSize: '12px' }} />
          </a>
        </div>
      </PageSection>

      {/* Tabs section */}
      <PageSection style={{ backgroundColor: '#151515', paddingTop: '16px', paddingBottom: '0' }}>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label="Virtualization tabs"
          role="region"
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Overview</TabTitleText>}
            aria-label="Overview tab"
          >
            <div style={{ backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 200px)' }}>
              <Overview />
            </div>
          </Tab>
          <Tab
            eventKey={1}
            title={<TabTitleText>Top consumers</TabTitleText>}
            aria-label="Top consumers tab"
          >
            <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 200px)' }}>
              <Content>Top consumers content coming soon</Content>
            </div>
          </Tab>
          <Tab
            eventKey={2}
            title={<TabTitleText>Migrations</TabTitleText>}
            aria-label="Migrations tab"
          >
            <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 200px)' }}>
              <Content>Migrations content coming soon</Content>
            </div>
          </Tab>
          <Tab
            eventKey={3}
            title={<TabTitleText>Settings</TabTitleText>}
            aria-label="Settings tab"
          >
            <div style={{ padding: '24px', backgroundColor: '#f0f0f0', minHeight: 'calc(100vh - 200px)' }}>
              <Content>Settings content coming soon</Content>
            </div>
          </Tab>
        </Tabs>
      </PageSection>
    </div>
  );
};

export default Virtualization;

