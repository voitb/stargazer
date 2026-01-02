export const ORDER_GAP = 10000;

export function calculateNewOrder(
	prevOrder: number | undefined,
	nextOrder: number | undefined,
): number {
	if (prevOrder === undefined && nextOrder === undefined) {
		return ORDER_GAP;
	}

	if (prevOrder === undefined) {
		return (nextOrder || ORDER_GAP) / 2;
	}

	if (nextOrder === undefined) {
		return prevOrder + ORDER_GAP;
	}

	return (prevOrder + nextOrder) / 2;
}
