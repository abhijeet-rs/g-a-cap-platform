import { RoleInfo, Role, Permission } from '@/lib/types';

export const roleMap: Record<string, Role> = {
  am: 'am', ae: 'ae', coordinator: 'coord', analyst: 'analyst', manager: 'gab', admin: 'admin',
};

export const roles: Record<Role, RoleInfo> = {
  am: { email: 'am@gapartners.com', role: 'am', label: 'Account Manager', short: 'AM', name: 'Dana Whitfield', permissions: ['create', 'edit', 'esign'], color: '#C60C30' },
  ae: { email: 'ae@gapartners.com', role: 'ae', label: 'Account Executive', short: 'AE', name: 'Marcus Reyes', permissions: ['create', 'edit', 'approve', 'esign'], color: '#0074B8' },
  coord: { email: 'coordinator@gapartners.com', role: 'coord', label: 'Benefits Coordinator', short: 'BC', name: 'Lena Ortiz', permissions: [], color: '#5B6770' },
  analyst: { email: 'analyst@gapartners.com', role: 'analyst', label: 'Benefits Analyst', short: 'BA', name: 'Sam Cho', permissions: [], color: '#5B6770' },
  gab: { email: 'manager@gapartners.com', role: 'gab', label: 'GAB Manager', short: 'GM', name: 'Priya Nair', permissions: ['create', 'edit', 'approve', 'publish', 'esign'], color: '#1A7A4A' },
  admin: { email: 'admin@gapartners.com', role: 'admin', label: 'System Admin', short: 'SA', name: 'Root Admin', permissions: ['create', 'edit', 'approve', 'publish', 'esign', 'admin'], color: '#5A45C7' },
};

export function canDo(role: Role, perm: Permission): boolean {
  return roles[role].permissions.includes(perm);
}
