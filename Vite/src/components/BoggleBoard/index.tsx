import "./BoggleBoard.css";
import { FC, useEffect, useState } from "react";
import { dict } from "./dict";

interface BoggleRow {
	row: Array<string>;
}

const BoggleRow: FC<BoggleRow> = ({ row }) => {
	return (
		<div className="boggle-row">
			<div className="row-cell">{row[0]}</div>
			<div className="row-cell">{row[1]}</div>
			<div className="row-cell">{row[2]}</div>
			<div className="row-cell">{row[3]}</div>
		</div>
	);
};

const BoggleBoard = () => {
	const [boardSize, setBoardSize] = useState<number>(4);
	const [boardLetters, setBoardLetters] = useState<Array<Array<string>>>([
		[],
	]);
	const [currWord, setCurrWord] = useState<string>("");

	//Hard coded dice from actual boggle game.
	//Having random letters chosen from the alphabet makes finding words
	// much more difficult
	const dice: Array<Array<string>> = [
		["t", "o", "u", "m", "i", "c"],
		["x", "r", "e", "d", "l", "i"],
		["d", "t", "s", "t", "y", "i"],
		["a", "b", "o", "j", "b", "o"],
		["t", "w", "a", "o", "o", "t"],
		["s", "e", "i", "u", "n", "e"],
		["t", "v", "w", "r", "h", "e"],
		["p", "k", "s", "f", "f", "a"],
		["r", "t", "l", "e", "y", "t"],
		["h", "i", "qu", "u", "m", "n"],
		["e", "e", "a", "a", "n", "g"],
		["z", "h", "n", "l", "r", "n"],
		["s", "s", "t", "i", "e", "o"],
		["s", "c", "h", "p", "o", "a"],
		["r", "e", "y", "d", "l", "v"],
		["w", "n", "h", "g", "e", "e"],
	];

	//Returns an matrix with characters
	const generateBoard = () => {
		// Create board array
		let chars = [];
		// Get random letter from each die and push to array
		for (let i = 0; i < dice.length; i++) {
			let random = Math.floor(Math.random() * 6);
			chars.push(dice[i][random]);
		}
		// Shuffle the chars
		// Fisher-Yates Shuffle
		function shuffle(array: Array<string>): Array<string> {
			let currentIndex = array.length;
			let randomIndex;
			// While there remain elements to shuffle.
			while (currentIndex != 0) {
				// Pick a remaining element.
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex--;
				// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex],
					array[currentIndex],
				];
			}
			return array;
		}
		let shuffledChars: Array<string> = shuffle(chars);
		//Divide chars into 4X4 matrix
		let board: Array<Array<string>> = [];
		for (let i = 0; i < shuffledChars.length; i += boardSize) {
			board.push(shuffledChars.slice(i, i + 4));
		}
		return board;
	};

	//Check if a word is present in the dictionary
	const checkWord = (word: string, cur: any): boolean => {
		// Get the root to start from
		cur = cur || dict;
		// Go through every leaf
		for (var node in cur) {
			// If the start of the word matches the leaf
			if (word.indexOf(node) === 0) {
				// If it's a number
				var val =
					typeof cur[node] === "number" && cur[node]
						? // Substitute in the removed suffix object
						  dict.$[cur[node]]
						: // Otherwise use the current value
						  cur[node];
				// If this leaf finishes the word
				if (node.length === word.length) {
					// Return 'true' only if we've reached a final leaf
					return val === 0 || val.$ === 0;
					// Otherwise continue traversing deeper
					// down the tree until we find a match
				} else {
					return checkWord(word.slice(node.length), val);
				}
			}
		}
		return false;
	};

	useEffect(() => {
		setBoardLetters(generateBoard());
		document.body.addEventListener("keydown", (e) => console.log(e.key));
	}, []);

	return (
		<div className="boggle-board">
			{boardLetters.map((row, idx) => (
				<BoggleRow key={`row ${idx}`} row={row}></BoggleRow>
			))}
		</div>
	);
};

export default BoggleBoard;
