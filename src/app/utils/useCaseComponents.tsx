/**
 * Dynamically exports components based on the selected use case
 * Maps use-case-1 to fleet-admin-rbac and use-case-2 to tenant-admin-access prototypes
 */

// Use Case 1 (Fleet Admin) - from fleet-admin-rbac prototype
import { Clusters as Clusters1 } from '@app/prototypes/fleet-admin-rbac/Clusters/Clusters';
import { ClusterDetail as ClusterDetail1 } from '@app/prototypes/fleet-admin-rbac/Clusters/ClusterDetail';
import { IdentitiesPage as IdentitiesPage1 } from '@app/prototypes/fleet-admin-rbac/navigation/user-management/IdentitiesPage';
import { RolesPage as RolesPage1 } from '@app/prototypes/fleet-admin-rbac/navigation/user-management/RolesPage';
import { IdentityProvidersPage as IdentityProvidersPage1 } from '@app/prototypes/fleet-admin-rbac/navigation/user-management/IdentityProvidersPage';
import { ProjectsPage as ProjectsPage1 } from '@app/prototypes/fleet-admin-rbac/navigation/core-platforms/ProjectsPage';
import { GovernancePage as GovernancePage1 } from '@app/prototypes/fleet-admin-rbac/navigation/governance/GovernancePage';
import { CreatePolicy as CreatePolicy1 } from '@app/prototypes/fleet-admin-rbac/Governance/CreatePolicy';
import { IdentityDetail as IdentityDetail1 } from '@app/prototypes/fleet-admin-rbac/Identities/IdentityDetail';
import { GroupDetail as GroupDetail1 } from '@app/prototypes/fleet-admin-rbac/Identities/GroupDetail';
import { CreateGroup as CreateGroup1 } from '@app/prototypes/fleet-admin-rbac/Identities/CreateGroup';
import { CreateRole as CreateRole1 } from '@app/prototypes/fleet-admin-rbac/Roles/CreateRole';
import { RoleDetail as RoleDetail1 } from '@app/prototypes/fleet-admin-rbac/Roles/RoleDetail';
import { IdentityProviderDetail as IdentityProviderDetail1 } from '@app/prototypes/fleet-admin-rbac/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider as AddLDAPProvider1 } from '@app/prototypes/fleet-admin-rbac/IdentityProvider/AddLDAPProvider';
import { ProjectDetail as ProjectDetail1 } from '@app/prototypes/fleet-admin-rbac/Projects/ProjectDetail';

// Use Case 2 (Tenant Admin) - from tenant-admin-access prototype
import { Clusters as Clusters2 } from '@app/prototypes/tenant-admin-access/Clusters/Clusters';
import { ClusterDetail as ClusterDetail2 } from '@app/prototypes/tenant-admin-access/Clusters/ClusterDetail';
import { IdentitiesPage as IdentitiesPage2 } from '@app/prototypes/tenant-admin-access/navigation/user-management/IdentitiesPage';
import { RolesPage as RolesPage2 } from '@app/prototypes/tenant-admin-access/navigation/user-management/RolesPage';
import { IdentityProvidersPage as IdentityProvidersPage2 } from '@app/prototypes/tenant-admin-access/navigation/user-management/IdentityProvidersPage';
import { ProjectsPage as ProjectsPage2 } from '@app/prototypes/tenant-admin-access/navigation/core-platforms/ProjectsPage';
import { GovernancePage as GovernancePage2 } from '@app/prototypes/tenant-admin-access/navigation/governance/GovernancePage';
import { CreatePolicy as CreatePolicy2 } from '@app/prototypes/tenant-admin-access/Governance/CreatePolicy';
import { IdentityDetail as IdentityDetail2 } from '@app/prototypes/tenant-admin-access/Identities/IdentityDetail';
import { GroupDetail as GroupDetail2 } from '@app/prototypes/tenant-admin-access/Identities/GroupDetail';
import { CreateGroup as CreateGroup2 } from '@app/prototypes/tenant-admin-access/Identities/CreateGroup';
import { CreateRole as CreateRole2 } from '@app/prototypes/tenant-admin-access/Roles/CreateRole';
import { RoleDetail as RoleDetail2 } from '@app/prototypes/tenant-admin-access/Roles/RoleDetail';
import { IdentityProviderDetail as IdentityProviderDetail2 } from '@app/prototypes/tenant-admin-access/IdentityProvider/IdentityProviderDetail';
import { AddLDAPProvider as AddLDAPProvider2 } from '@app/prototypes/tenant-admin-access/IdentityProvider/AddLDAPProvider';
import { ProjectDetail as ProjectDetail2 } from '@app/prototypes/tenant-admin-access/Projects/ProjectDetail';

// Shared components - use empty placeholders for now
import { OverviewPage as VirtualizationOverview } from '@app/FleetVirtualization/EmptyPages';

// Placeholder exports for Quotas (not in main branch structure)
const QuotasPage = () => null;
const QuotaDetail = () => null;
const CreateQuota = () => null;

// Export Use Case 1 (Fleet Admin) as default for build compatibility
export {
  Clusters1 as ClustersPage,
  ClusterDetail1 as ClusterDetailPage,
  IdentitiesPage1 as IdentitiesPage,
  RolesPage1 as RolesPage,
  IdentityProvidersPage1 as IdentityProvidersPage,
  ProjectsPage1 as ProjectsPage,
  GovernancePage1 as GovernancePage,
  CreatePolicy1 as CreatePolicy,
  IdentityDetail1 as IdentityDetail,
  GroupDetail1 as GroupDetail,
  CreateGroup1 as CreateGroup,
  CreateRole1 as CreateRole,
  RoleDetail1 as RoleDetail,
  IdentityProviderDetail1 as IdentityProviderDetail,
  AddLDAPProvider1 as AddLDAPProvider,
  ProjectDetail1 as ProjectDetail,
  QuotasPage,
  QuotaDetail,
  CreateQuota,
  VirtualizationOverview,
};
