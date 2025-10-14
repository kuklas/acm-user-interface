// Virtualization Schema Types

export interface VirtualMachine {
  id: string;
  name: string;
  clusterId: string;
  namespaceId: string;
  status: 'Running' | 'Stopped' | 'Error' | 'Paused' | 'Starting' | 'Stopping';
  os: 'RHEL 8' | 'RHEL 9' | 'Fedora 38' | 'Fedora 39' | 'Windows Server 2019' | 'Windows Server 2022' | 'Ubuntu 22.04';
  cpu: number; // cores
  memory: string; // e.g., "8 GiB"
  storage: string; // e.g., "50 GiB"
  ipAddress: string;
  node: string;
  created: string; // ISO date string
}

export interface InstanceType {
  id: string;
  name: string;
  cpu: number;
  memory: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  os: string;
  description: string;
  cpu: number;
  memory: string;
  storage: string;
}

