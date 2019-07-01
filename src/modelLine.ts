class ModelLine {
	readonly from: ModelPoint;
	readonly to: ModelPoint;
	readonly id: string;

	public static makeId(fromId: number, toId: number): string {
		//line goes from lower to higher id point
		if (toId < fromId) {
			let temp = fromId;
			fromId = toId;
			toId = temp;
		}

		return `${fromId}->${toId}`;
	}

	constructor(from: ModelPoint, to: ModelPoint) {
		if (to.id < from.id) {
			let temp = from;
			from = to;
			to = temp;
		}

		this.from = from;
		this.to = to;
		//TODO: eliminate double swap of to and from
		this.id = ModelLine.makeId(from.id, to.id);
	}
}
