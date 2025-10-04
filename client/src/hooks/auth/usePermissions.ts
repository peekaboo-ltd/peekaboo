import { useMemo } from 'react';
import { useAppSelector } from '../../states/hooks';
import { RoleTypes } from '../../types/auth.type';

type Resource = 'orders' | 'users' | 'assignments' | 'audit-logs' | 'settings';
type Action = 'view' | 'create' | 'edit' | 'delete';

interface Permission {
  resource: Resource;
  actions: Action[];
}

// Permission matrix based on roles
const ROLE_PERMISSIONS: Record<RoleTypes, Permission[]> = {
  [RoleTypes.ADMIN]: [
    { resource: 'orders', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'users', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'assignments', actions: ['view', 'create', 'edit', 'delete'] },
    { resource: 'audit-logs', actions: ['view'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
  [RoleTypes.RIDER]: [
    { resource: 'orders', actions: ['view'] },
    { resource: 'assignments', actions: ['view', 'edit'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
  [RoleTypes.CUSTOMER]: [
    { resource: 'orders', actions: ['view', 'create'] },
    { resource: 'settings', actions: ['view', 'edit'] },
  ],
};

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const permissions = useMemo(() => {
    if (!user || !user.userRoles) return [];

    // Get all permissions for user's roles
    const allPermissions: Permission[] = [];
    
    user.userRoles.forEach(userRole => {
      const rolePermissions = ROLE_PERMISSIONS[userRole.role.name as RoleTypes] || [];
      rolePermissions.forEach(permission => {
        // Find existing permission for resource or add new one
        const existingPermission = allPermissions.find(p => p.resource === permission.resource);
        if (existingPermission) {
          // Merge actions (avoid duplicates)
          permission.actions.forEach(action => {
            if (!existingPermission.actions.includes(action)) {
              existingPermission.actions.push(action);
            }
          });
        } else {
          allPermissions.push({ ...permission, actions: [...permission.actions] });
        }
      });
    });

    return allPermissions;
  }, [user]);

  const hasPermission = (resource: Resource, action: Action): boolean => {
    const permission = permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  const canView = (resource: Resource): boolean => hasPermission(resource, 'view');
  const canCreate = (resource: Resource): boolean => hasPermission(resource, 'create');
  const canEdit = (resource: Resource): boolean => hasPermission(resource, 'edit');
  const canDelete = (resource: Resource): boolean => hasPermission(resource, 'delete');

  const hasRole = (role: RoleTypes): boolean => {
    if (!user || !user.userRoles) return false;
    return user.userRoles.some(userRole => userRole.role.name === role);
  };

  const hasAnyRole = (roles: RoleTypes[]): boolean => {
    if (!user || !user.userRoles) return false;
    return user.userRoles.some(userRole => roles.includes(userRole.role.name as RoleTypes));
  };

  const isOwner = (resourceOwnerId: string): boolean => {
    if (!user) return false;
    return user.id === resourceOwnerId;
  };

  const canAccessResource = (resource: Resource, action: Action, ownerId?: string): boolean => {
    // Admin can access everything
    if (hasRole(RoleTypes.ADMIN)) return true;

    // Check general permission
    if (hasPermission(resource, action)) {
      // For some resources, non-admin users can only access their own
      if (resource === 'orders' && hasRole(RoleTypes.CUSTOMER)) {
        return !ownerId || isOwner(ownerId);
      }
      if (resource === 'assignments' && hasRole(RoleTypes.RIDER)) {
        return !ownerId || isOwner(ownerId);
      }
      return true;
    }

    return false;
  };

  return {
    permissions,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasRole,
    hasAnyRole,
    isOwner,
    canAccessResource,
  };
};