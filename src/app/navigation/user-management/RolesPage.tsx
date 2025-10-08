import React, { useState } from 'react';
import { Title, Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { Roles } from '@app/Roles/Roles';

export const RolesPage: React.FunctionComponent = () => {
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
        return <Roles />;
      case 1:
        return <div>Role Bindings content will go here</div>;
      default:
        return <Roles />;
    }
  };

  return (
    <div className="roles-page-container">
      <div className="page-header-section">
        <Title headingLevel="h1" size="lg">
          Roles
        </Title>
        <Tabs activeKey={activeTabKey} onSelect={handleTabClick} aria-label="Role tabs">
          <Tab eventKey={0} title={<TabTitleText>Roles</TabTitleText>} aria-label="Roles tab" />
          <Tab eventKey={1} title={<TabTitleText>Role bindings</TabTitleText>} aria-label="Role bindings tab" />
        </Tabs>
      </div>
      
      <div className="page-content-section">
        {renderTabContent()}
      </div>
    </div>
  );
};
