import React, { useState } from 'react';
import { Title, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { IdentityProvider } from '@app/IdentityProvider/IdentityProvider';

export const IdentityProvidersPage: React.FunctionComponent = () => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  const renderTabContent = () => {
    switch (activeTabKey) {
      case 0:
        return <IdentityProvider />;
      case 1:
        return <div>LDAP configuration content will go here</div>;
      case 2:
        return <div>OAuth configuration content will go here</div>;
      default:
        return <IdentityProvider />;
    }
  };

  return (
    <div className="identity-providers-page-container">
      <div className="page-header-section">
        <Title headingLevel="h1" size="lg">
          Identity Providers
        </Title>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Identity provider tabs">
          <Tab eventKey={0} title={<TabTitleText>Identity providers</TabTitleText>} aria-label="Identity providers tab" />
          <Tab eventKey={1} title={<TabTitleText>LDAP</TabTitleText>} aria-label="LDAP tab" />
          <Tab eventKey={2} title={<TabTitleText>OAuth</TabTitleText>} aria-label="OAuth tab" />
        </Tabs>
      </div>
      
      <div className="page-content-section">
        {renderTabContent()}
      </div>
    </div>
  );
};
