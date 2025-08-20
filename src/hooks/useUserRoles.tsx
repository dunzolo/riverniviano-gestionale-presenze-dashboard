import { UserTypes } from "@/utils/enum";
import { useUser } from "./useUser";

/**
 * Custom hook per verificare i ruoli dell'utente.
 */
export const useUserRoles = () => {
  const { user } = useUser();
  const roleNames = user?.role_names ?? [];

  /**
   * Controlla se l'utente ha uno specifico ruolo.
   * @param roles - Lista dei ruoli da verificare.
   * @returns true se l'utente ha almeno uno dei ruoli indicati.
   */
  const hasRole = (roles: UserTypes[]) =>
    roleNames.some((role: UserTypes) => roles.includes(role));

  const isAdmin = hasRole([UserTypes.FullAccess]);
  const isOperator = hasRole([UserTypes.Operator]);

  return {
    hasRole,
    isAdmin,
    isOperator,
    roleNames,
  };
};
