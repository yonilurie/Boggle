import "./BoggleBoard.css";
import { useEffect, useRef, useState } from "react";
import { dict } from "./dict";
import { dice } from "../../dice";

const BoggleBoard = () => {
	const [boardSize, setBoardSize] = useState<number>(4);
	const [board, setBoard] = useState<Array<Array<string>>>([[]]);
	const [currentWord, setCurrentWord] = useState<string>("");
	const [characters, setCharacters] = useState<string>("");
	const [active, setActive] = useState<Array<Array<number>>>([[]]);
	const [score, setScore] = useState<number>(0);
	const [points] = useState<{ [wordLength: string]: number }>({
		"3": 1,
		"4": 2,
		"5": 3,
		"6": 4,
		"7": 2,
	});

	const wordRef = useRef<string>();
	wordRef.current = currentWord;
	const boardRef = useRef<Array<Array<string>>>();
	boardRef.current = board;
	const charRef = useRef<string>();
	charRef.current = characters;

	//Returns an matrix with characters
	const generateBoard = (): Array<Array<string>> => {
		// Create board array
		let chars = [];
		// Get random letter from each die and push to array
		for (let i = 0; i < dice.length; i++) {
			let random = Math.floor(Math.random() * 6);
			chars.push(dice[i][random]);
		}
		setCharacters(chars.join(""));
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

	function type(e: { keyCode: number; key: string }): void {
		//  If backspace, delete a letter
		if (e.keyCode === 8) {
			if (!wordRef.current) return;
			let word = wordRef.current.slice(0, currentWord.length - 1);
			return setCurrentWord(word);
		}
		// When user clicks enter, check if the word exists
		if (e.keyCode === 13) {
		}
		//If keyCode is not a letter, return
		if (e.keyCode < 65 || e.keyCode > 90) return;
		if (!charRef.current?.includes(e.key)) return;
		let boardCopy: Array<Array<string>> = [];
		boardRef.current?.forEach((row) => {
			boardCopy.push([...row]);
		});
		const foundWord = checkAround(boardCopy, wordRef.current + e.key);
		if (foundWord) setCurrentWord((word) => (word += e.key));
	}

	const checkAroundHelper = (
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		k: number
	): boolean | undefined => {
		if (k === word.length) return true;
		if (i < 0 || j < 0 || i > board.length - 1 || j > board[0].length - 1)
			return false;
		if (board[i][j] === word[k]) {
			var tmp = board[i][j];
			board[i][j] = "#";
			if (
				checkAroundHelper(board, word, i + 1, j, k + 1) ||
				checkAroundHelper(board, word, i - 1, j, k + 1) ||
				checkAroundHelper(board, word, i, j + 1, k + 1) ||
				checkAroundHelper(board, word, i, j - 1, k + 1) ||
				checkAroundHelper(board, word, i - 1, j - 1, k + 1) ||
				checkAroundHelper(board, word, i + 1, j - 1, k + 1) ||
				checkAroundHelper(board, word, i - 1, j + 1, k + 1) ||
				checkAroundHelper(board, word, i + 1, j + 1, k + 1)
			) {
				return true;
			}
			board[i][j] = tmp;
		}
	};

	function checkAround(board: Array<Array<string>>, word: string): boolean {
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[0].length; j++) {
				if (checkAroundHelper(board, word, i, j, 0)) return true;
			}
		}
		return false;
	}

	function startGame() {
		let newBoard = generateBoard();
		setBoard(newBoard);
		document.body.addEventListener("keydown", type);
	}

	useEffect(() => {
		console.log(currentWord);
	}, [currentWord]);

	return (
		<div>
			<button onClick={startGame}>play</button>
			<div>{currentWord}</div>
			<div className="boggle-board">
				{board.map((row, idx) => (
					<BoggleRow key={`row ${idx}`} row={row}></BoggleRow>
				))}
			</div>
		</div>
	);
};

function BoggleRow({ row }: Array<string>) {
	if (!row.length) return null;
	return (
		<div className="boggle-row">
			<div
				className={`row-cell ${
					row.length && row[0] === row[0].toUpperCase()
						? "active"
						: ""
				}`}
			>
				{row[0].toUpperCase()}
			</div>
			<div
				className={`row-cell ${
					row.length && row[1] === row[1].toUpperCase()
						? "active"
						: ""
				}`}
			>
				{row[1].toUpperCase()}
			</div>
			<div
				className={`row-cell ${
					row.length && row[2] === row[2].toUpperCase()
						? "active"
						: ""
				}`}
			>
				{row[2].toUpperCase()}
			</div>
			<div
				className={`row-cell ${
					row.length && row[3] === row[3].toUpperCase()
						? "active"
						: ""
				}`}
			>
				{row[3].toUpperCase()}
			</div>
		</div>
	);
}

export default BoggleBoard;
