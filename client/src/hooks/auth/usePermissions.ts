import { useAppSelector } from '../../states/hooks';
import { RoleTypes } from '../../types/auth.type';

type Resource = 'orders' | 'users' | 'assignments' | 'audit_logs' | 'settings';
type Action = 'view' | 'create' | 'edit' | 'delete';

interface PermissionMatrix {
  [role: string]: {
    [resource: string]: Action[];
  };
}

const permissionMatrix: PermissionMatrix = {
  ADMIN: {
    orders: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete'],
    assignments: ['view', 'create', 'edit', 'delete'],
    audit_logs: ['view'],
    settings: ['view', 'edit'],
  },
  RIDER: {
    orders: ['view', 'edit'],
    users: ['view'],
    assignments: ['view', 'edit'],
    audit_logs: [],
    settings: ['view'],
  },
  CUSTOMER: {
    orders: ['view', 'create'],
    users: [],
    assignments: [],
    audit_logs: [],
    settings: ['view'],
  },
  STAFF: {
    orders: ['view', 'create', 'edit'],
    users: ['view'],
    assignments: ['view', 'create'],
    audit_logs: ['view'],
    settings: ['view'],
  },
};

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const getUserRoles = (): RoleTypes[] => {
    if (!user?.userRoles) return [];
    return user.userRoles.map(ur => ur.role.name);
  };

  const hasPermission = (resource: Resource, action: Action): boolean => {
    const roles = getUserRoles();
    
    return roles.some(role => {
      const rolePermissions = permissionMatrix[role];
      if (!rolePermissions) return false;
      
      const resourcePermissions = rolePermissions[resource];
      if (!resourcePermissions) return false;
      
      return resourcePermissions.includes(action);
    });
  };

  const canView = (resource: Resource): boolean => hasPermission(resource, 'view');
  const canCreate = (resource: Resource): boolean => hasPermission(resource, 'create');
  const canEdit = (resource: Resource): boolean => hasPermission(resource, 'edit');
  const canDelete = (resource: Resource): boolean => hasPermission(resource, 'delete');

  const hasRole = (role: RoleTypes): boolean => {
    const roles = getUserRoles();
    return roles.includes(role);
  };

  const hasAnyRole = (roles: RoleTypes[]): boolean => {
    const userRoles = getUserRoles();
    return roles.some(role => userRoles.includes(role));
  };

  const isAdmin = (): boolean => hasRole(RoleTypes.ADMIN);
  const isRider = (): boolean => hasRole(RoleTypes.RIDER);
  const isCustomer = (): boolean => hasRole(RoleTypes.CUSTOMER);
  const isStaff = (): boolean => hasRole(RoleTypes.STAFF);

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasRole,
    hasAnyRole,
    isAdmin,
    isRider,
    isCustomer,
    isStaff,
  };
};