import { useLiveQuery } from "dexie-react-hooks";
import { getAcademies } from "../services/academyService";

export function useAcademies() {
  const academies = useLiveQuery(() => getAcademies(), []);

  return {
    academies: academies ?? [],
    loading: academies === undefined,
  };
}
