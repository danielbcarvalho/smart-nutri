import { useQuery, QueryClient } from "@tanstack/react-query";
import { fetchFoodDb } from "./foodDbService";

export function useFoodDb() {
  return useQuery({
    queryKey: ["foodDb"],
    queryFn: fetchFoodDb,
    staleTime: 1000 * 60 * 60, // 1 hora
    cacheTime: 1000 * 60 * 60 * 6, // 6 horas
  });
}

// Para prefetch manual fora de hooks:
// import { useQueryClient } from '@tanstack/react-query';
// const queryClient = useQueryClient();
// getPreloadFoodDb(queryClient);
export function getPreloadFoodDb(queryClient: QueryClient) {
  queryClient.prefetchQuery({
    queryKey: ["foodDb"],
    queryFn: fetchFoodDb,
  });
}
