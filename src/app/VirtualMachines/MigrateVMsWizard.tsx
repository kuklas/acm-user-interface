import * as React from 'react';
import {
  Modal,
  ModalVariant,
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

  const [targetCluster, setTargetCluster] = React.useState('');
  const [targetProject, setTargetProject] = React.useState('');

  const targetPlacementStep = (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Target placement</h2>
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {/* Source Section */}
        <div style={{ 
          flex: 1, 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>Source</h3>
          
          <FormGroup label="Cluster">
            <TextInput
              type="text"
              value="test-west-eu"
              isDisabled
              aria-label="Source cluster"
            />
          </FormGroup>

          <FormGroup label="Project">
            <TextInput
              type="text"
              value="test"
              isDisabled
              aria-label="Source project"
            />
          </FormGroup>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: '2rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
          →
        </div>

        {/* Target Section */}
        <div style={{ 
          flex: 1, 
          border: '1px solid var(--pf-t--global--border--color--default)', 
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Target *</h3>
            <Button 
              variant="link" 
              onClick={() => {
                setTargetCluster('');
                setTargetProject('');
              }}
              style={{ padding: 0, fontSize: '0.875rem' }}
            >
              Clear all
            </Button>
          </div>
          
          <FormGroup label="Cluster">
            <FormSelect
              value={targetCluster}
              onChange={(_event, value) => {
                setTargetCluster(value as string);
                setTargetProject(''); // Reset project when cluster changes
              }}
              aria-label="Target cluster"
            >
              <FormSelectOption value="" label="Select Cluster" />
              <FormSelectOption value="test-south-eu" label="test-south-eu" />
              <FormSelectOption value="test-north-eu" label="test-north-eu" />
              <FormSelectOption value="test-central-eu" label="test-central-eu" />
            </FormSelect>
          </FormGroup>

          <FormGroup label="Project">
            <FormSelect
              value={targetProject}
              onChange={(_event, value) => setTargetProject(value as string)}
              isDisabled={!targetCluster}
              aria-label="Target project"
            >
              <FormSelectOption 
                value="" 
                label={targetCluster ? "Select project" : "To select a project, pick a cluster"} 
              />
              {targetCluster && (
                <>
                  <FormSelectOption value="test" label="test" />
                  <FormSelectOption value="production" label="production" />
                  <FormSelectOption value="staging" label="staging" />
                  <FormSelectOption value="development" label="development" />
                </>
              )}
            </FormSelect>
          </FormGroup>
        </div>
      </div>
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

  const [activeStep, setActiveStep] = React.useState(1);

  const onNext = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    } else {
      handleSave();
    }
  };

  const onBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const getCurrentStep = () => {
    switch (activeStep) {
      case 1:
        return generalInformationStep;
      case 2:
        return targetPlacementStep;
      case 3:
        return migrationReadinessStep;
      case 4:
        return reviewStep;
      default:
        return generalInformationStep;
    }
  };

  const getStepName = () => {
    switch (activeStep) {
      case 1:
        return 'General information';
      case 2:
        return 'Target placement';
      case 3:
        return 'Migration readiness';
      case 4:
        return 'Review';
      default:
        return '';
    }
  };

  return (
    <Modal
      variant={ModalVariant.large}
      title="Migrate virtual machines"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <div style={{ marginBottom: '16px', color: 'var(--pf-t--global--text--color--subtle)' }}>
        Choose the target location for your VMs, then adjust your migration plan if necessary.
      </div>
      <div style={{ display: 'flex', minHeight: '400px' }}>
        <div style={{ width: '200px', borderRight: '1px solid var(--pf-t--global--border--color--default)', paddingRight: '16px', marginRight: '24px' }}>
          <div
            onClick={() => setActiveStep(1)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: activeStep === 1 ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ 
              marginRight: '8px', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: activeStep === 1 ? 'var(--pf-t--global--color--brand--default)' : 'var(--pf-t--global--background--color--secondary--default)',
              color: activeStep === 1 ? 'white' : 'inherit',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              1
            </span>
            General information
          </div>
          <div
            onClick={() => setActiveStep(2)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: activeStep === 2 ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ 
              marginRight: '8px', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: activeStep === 2 ? 'var(--pf-t--global--color--brand--default)' : 'var(--pf-t--global--background--color--secondary--default)',
              color: activeStep === 2 ? 'white' : 'inherit',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              2
            </span>
            Target placement
          </div>
          <div
            onClick={() => setActiveStep(3)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: activeStep === 3 ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ 
              marginRight: '8px', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: activeStep === 3 ? 'var(--pf-t--global--color--brand--default)' : 'var(--pf-t--global--background--color--secondary--default)',
              color: activeStep === 3 ? 'white' : 'inherit',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              3
            </span>
            Migration readiness
          </div>
          <div
            onClick={() => setActiveStep(4)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: activeStep === 4 ? 'var(--pf-t--global--background--color--action--plain--clicked)' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ 
              marginRight: '8px', 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: activeStep === 4 ? 'var(--pf-t--global--color--brand--default)' : 'var(--pf-t--global--background--color--secondary--default)',
              color: activeStep === 4 ? 'white' : 'inherit',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              4
            </span>
            Review
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {getCurrentStep()}
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        justifyContent: 'flex-start',
        borderTop: '1px solid var(--pf-t--global--border--color--default)',
        paddingTop: '16px',
        marginTop: '16px'
      }}>
        <Button variant="secondary" onClick={onBack} isDisabled={activeStep === 1}>
          Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          {activeStep === 4 ? 'Finish' : 'Next'}
        </Button>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

