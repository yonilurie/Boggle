interface Row {
	row: Array<string>;
	active: Array<string>;
	userType: Function;
}

function BoggleRow({ row, active, userType }: Row) {
	return (
		<div className="boggle-row">
			{row.map((cell: string, i: number) => (
				<div
					key={`cell ${i}-${"cell"}`}
					className={`row-cell ${active[i] === "#" ? "active" : ""}`}
					onClick={() => userType(cell.charAt(0))}
				>
					{cell.charAt(0).toUpperCase() + cell.slice(1)}
				</div>
			))}
		</div>
	);
}
export default BoggleRow;
