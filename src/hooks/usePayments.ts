import { useLiveQuery } from "dexie-react-hooks";
import {
  getAcademyPayments,
  getPayments,
} from "../services/paymentService";

export function usePayments() {
  const payments = useLiveQuery(() => getPayments(), []);

  return {
    payments: payments ?? [],
    loading: payments === undefined,
  };
}

export function useAcademyPayments(academyId?: number) {
  const payments = useLiveQuery(
    () =>
      academyId
        ? getAcademyPayments(academyId)
        : Promise.resolve([]),
    [academyId],
  );

  return {
    payments: payments ?? [],
    loading: payments === undefined,
  };
}
