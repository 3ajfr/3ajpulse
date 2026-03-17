import type { UserRole } from "@/lib/domain/enums";

const roleRank: Record<UserRole, number> = {
  OWNER: 4,
  MANAGER: 3,
  FINANCE: 2,
  MEMBER: 1,
};

export const roleLabels: Record<UserRole, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  FINANCE: "Finance",
  MEMBER: "Membre",
};

export function hasMinimumRole(currentRole: UserRole, requiredRole: UserRole) {
  return roleRank[currentRole] >= roleRank[requiredRole];
}

export function canAccessFinancials(role: UserRole) {
  return role === "OWNER" || role === "MANAGER" || role === "FINANCE";
}

export function canManageWorkspace(role: UserRole) {
  return role === "OWNER";
}

export function canManageOperations(role: UserRole) {
  return role === "OWNER" || role === "MANAGER";
}
