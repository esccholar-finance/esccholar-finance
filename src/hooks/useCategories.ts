import { useLiveQuery } from "dexie-react-hooks";
import { getCategories } from "../services/categoryService";

export function useCategories() {
  const categories = useLiveQuery(() => getCategories(), []);

  return {
    categories: categories ?? [],
    loading: categories === undefined,
  };
}
