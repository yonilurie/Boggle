interface Row {
	row: Array<string>;
	active: Array<string>;
}

function BoggleRow({ row, active }: Row) {
	return (
		<div className="boggle-row">
			{row.map((cell: string, i: number) => (
				<div
					key={`cell ${i}-${"cell"}`}
					className={`row-cell ${active[i] === "#" ? "active" : ""}`}
				>
					{cell.charAt(0).toUpperCase() + cell.slice(1)}
				</div>
			))}
		</div>
	);
}
export default BoggleRow;
