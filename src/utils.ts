

export function shuffleArray(array: number[]): number[] {
	let curIndex = array.length, randIndex;

	while (curIndex != 0) {
		randIndex = Math.floor(Math.random() * curIndex);
		curIndex--;

		[array[curIndex], array[randIndex]] = [array[randIndex], array[curIndex]];
	}

	return array;
}