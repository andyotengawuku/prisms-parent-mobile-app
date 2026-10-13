import { useHome } from "./useHome";

export function useChildren() {
  const query = useHome();
  return { ...query, data: query.data?.children };
}
