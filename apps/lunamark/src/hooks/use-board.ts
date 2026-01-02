import { useQuery } from "@tanstack/react-query";
import type { Board } from "@/schemas/task";
import { getBoard } from "../server/board";

export const BOARD_QUERY_KEY = ["board"] as const;

export function useBoard() {
	return useQuery<Board, Error>({
		queryKey: BOARD_QUERY_KEY,
		queryFn: () => getBoard(),
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: true,
	});
}
