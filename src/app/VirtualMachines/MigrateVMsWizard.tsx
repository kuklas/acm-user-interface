import * as React from 'react';
import {
  Modal,
  ModalVariant,
  Wizard,
  WizardStep,
  WizardHeader,
  Button,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';

interface MigrateVMsWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVMs: number[];
}

export const MigrateVMsWizard: React.FunctionComponent<MigrateVMsWizardProps> = ({
  isOpen,
  onClose,
  selectedVMs,
}) => {
  const [migrationName, setMigrationName] = React.useState('');
  const [migrationReason, setMigrationReason] = React.useState('not-stated');

  const handleClose = () => {
    // Reset form
    setMigrationName('');
    setMigrationReason('not-stated');
    onClose();
  };

  const handleSave = () => {
    console.log('Migration plan created:', {
      name: migrationName,
      reason: migrationReason,
      vms: selectedVMs,
    });
    handleClose();
  };

  const generalInformationStep = (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>General information</h2>
      
      <Form>
        <FormGroup label="Name" isRequired>
          <TextInput
            type="text"
            id="migration-name"
            name="migration-name"
            value={migrationName}
            onChange={(_event, value) => setMigrationName(value)}
            placeholder="Random-generated-name-with-a-date"
          />
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            If you don't create a name, we'll generate a migration plan name for you
          </div>
        </FormGroup>

        <FormGroup label="Migration reason (optional)">
          <FormSelect
            value={migrationReason}
            onChange={(_event, value) => setMigrationReason(value as string)}
            id="migration-reason"
            name="migration-reason"
          >
            <FormSelectOption value="not-stated" label="Not stated" />
            <FormSelectOption value="hardware-maintenance" label="Hardware maintenance" />
            <FormSelectOption value="load-balancing" label="Load balancing" />
            <FormSelectOption value="disaster-recovery" label="Disaster recovery" />
            <FormSelectOption value="resource-optimization" label="Resource optimization" />
            <FormSelectOption value="other" label="Other" />
          </FormSelect>
          <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginTop: '8px' }}>
            Select a reason for migration
          </div>
        </FormGroup>
      </Form>
    </div>
  );

  const targetPlacementStep = (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Target placement</h2>
      <p>Select the target cluster and namespace for your virtual machines.</p>
      {/* Placeholder for target placement content */}
    </div>
  );

  const migrationReadinessStep = (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Migration readiness</h2>
      <p>Review the migration readiness checks for your virtual machines.</p>
      {/* Placeholder for migration readiness content */}
    </div>
  );

  const reviewStep = (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Review</h2>
      <p>Review your migration plan before proceeding.</p>
      {/* Placeholder for review content */}
    </div>
  );

  const steps: WizardStep[] = [
    {
      name: 'General information',
      id: 'general-info',
      component: generalInformationStep,
    },
    {
      name: 'Target placement',
      id: 'target-placement',
      component: targetPlacementStep,
    },
    {
      name: 'Migration readiness',
      id: 'migration-readiness',
      component: migrationReadinessStep,
    },
    {
      name: 'Review',
      id: 'review',
      component: reviewStep,
    },
  ];

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={handleClose}
      hasNoBodyWrapper
      aria-label="Migrate virtual machines wizard"
    >
      <Wizard
        header={
          <WizardHeader
            title="Migrate virtual machines"
            description="Choose the target location for your VMs, then adjust your migration plan if necessary."
            onClose={handleClose}
          />
        }
        steps={steps}
        onClose={handleClose}
        onSave={handleSave}
      />
    </Modal>
  );
};

