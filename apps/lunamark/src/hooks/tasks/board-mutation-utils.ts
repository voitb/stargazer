import type { QueryClient } from "@tanstack/react-query";
import type { Board } from "@/schemas/task";
import { BOARD_QUERY_KEY } from "../kanban/use-board";

export type BoardMutationContext = { previousBoard: Board | undefined };

/**
 * Creates optimistic mutation callbacks for board operations.
 * Handles: cancel queries → snapshot → optimistic update → rollback on error → invalidate.
 *
 * @see https://github.com/TanStack/query/blob/main/examples/optimistic-updates-typescript/pages/index.tsx
 */
export function createBoardMutationCallbacks<TInput>(
	queryClient: QueryClient,
	optimisticUpdate: (board: Board, input: TInput) => Board,
) {
	return {
		onMutate: async (input: TInput): Promise<BoardMutationContext> => {
			await queryClient.cancelQueries({ queryKey: BOARD_QUERY_KEY });
			const previousBoard = queryClient.getQueryData<Board>(BOARD_QUERY_KEY);

			if (previousBoard) {
				queryClient.setQueryData(
					BOARD_QUERY_KEY,
					optimisticUpdate(previousBoard, input),
				);
			}

			return { previousBoard };
		},

		onError: (
			_err: Error,
			_input: TInput,
			context: BoardMutationContext | undefined,
		) => {
			if (context?.previousBoard) {
				queryClient.setQueryData(BOARD_QUERY_KEY, context.previousBoard);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: BOARD_QUERY_KEY });
		},
	};
}

export function generateTempId(): string {
	return `temp-${crypto.randomUUID()}`;
}
