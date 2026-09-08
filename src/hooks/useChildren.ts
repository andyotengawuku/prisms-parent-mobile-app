import { useQuery } from "@tanstack/react-query";
import { SAMPLE_CHILDREN } from "../lib/sample-data";

/** Profile/children freshness: 15 minutes */
const STALE_CHILDREN_MS = 15 * 60 * 1000;

export function useChildren() {
  return useQuery({
    queryKey: ["children"],
    queryFn: async () => SAMPLE_CHILDREN,
    staleTime: STALE_CHILDREN_MS,
  });
}
