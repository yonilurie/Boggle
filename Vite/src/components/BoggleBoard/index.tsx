import "./BoggleBoard.css";
import { useEffect, useRef, useState } from "react";
import { dict } from "./dict";
import { dice } from "../../dice";

const BoggleBoard = () => {
	const [boardSize, setBoardSize] = useState<number>(4);
	const [board, setBoard] = useState<Array<Array<string>>>([[]]);
	const [currentWord, setCurrentWord] = useState<string>("");
	const [characters, setCharacters] = useState<string>("");
	const [active, setActive] = useState<Array<Array<string>>>([
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
	]);
	const [score, setScore] = useState<number>(0);
	const [points] = useState<{ [wordLength: string]: number }>({
		"3": 1,
		"4": 2,
		"5": 3,
		"6": 5,
	});
	const [guessed, setGuessed] = useState<Array<string>>([]);

	const wordRef = useRef<string>();
	wordRef.current = currentWord;
	const boardRef = useRef<Array<Array<string>>>();
	boardRef.current = board;
	const charRef = useRef<string>();
	charRef.current = characters;
	const guessedRef = useRef<Array<string>>();
	guessedRef.current = guessed;

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
	const checkWord = (word: string, cur): boolean => {
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
		// Create copy of original board for searching and track active letters
		let boardCopy: Array<Array<string>> = [];
		boardRef.current?.forEach((row) => {
			boardCopy.push([...row]);
		});
		//  If backspace, delete a letter
		if (e.keyCode === 8) {
			if (!wordRef.current) return;
			let word = wordRef.current.slice(0, currentWord.length - 1);
			const foundWord = checkAround(boardCopy, word);
			if (foundWord) setCurrentWord((word) => (word += e.key));
			return setCurrentWord(word);
		}
		// When user clicks enter, check if the word exists
		if (e.keyCode === 13) {
			if (!wordRef.current) return;
			if (wordRef.current.length <= 2) return;
			if (!checkWord(wordRef.current, dict)) {
				setCurrentWord("");
				return resetActive();
			}
			let newGuesses = [...guessedRef.current, wordRef.current];
			setGuessed(newGuesses);
			let wordPoints = points[wordRef.current.length];
			if (!points[wordRef.current.length]) {
				wordPoints = wordRef.current.length * 2;
			}
			setScore((score) => (score += wordPoints));
			setCurrentWord("");
			return resetActive();
		}
		//If keyCode is not a letter, return
		if (e.keyCode < 65 || e.keyCode > 90) return;
		if (!charRef.current?.includes(e.key)) return;

		const foundWord = checkAround(boardCopy, wordRef.current + e.key);
		if (foundWord) setCurrentWord((word) => (word += e.key));
	}

	const checkAroundHelper = (
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		k: number
	): Array<Array<string>> | boolean | undefined => {
		if (k === word.length) return board;
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
				return board;
			}
			board[i][j] = tmp;
		}
	};

	function checkAround(board: Array<Array<string>>, word: string): boolean {
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board[0].length; j++) {
				if (checkAroundHelper(board, word, i, j, 0)) {
					updateActiveLetters(board);
					setActive(board);
					return true;
				}
			}
		}
		return false;
	}

	function updateActiveLetters(board: Array<Array<string>>) {
		for (let i = 0; i < boardSize; i++) {
			for (let j = 0; j < boardSize; j++) {
				if (board[i][j] !== "#") {
					board[i][j] = "!";
				}
			}
		}
	}

	function startGame() {
		let newBoard = generateBoard();
		setBoard(newBoard);
		document.body.addEventListener("keydown", type);
		document.activeElement?.blur();
	}

	function resetActive() {
		setActive([
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
		]);
	}

	useEffect(() => {
		console.table(guessed);
	}, [guessed]);

	return (
		<div>
			<button onClick={startGame}>play</button>
			<div>{currentWord}</div>
			<div className="boggle-board">
				{board.map((row, idx) => (
					<BoggleRow
						key={`row ${idx}`}
						row={row}
						active={active[idx]}
					></BoggleRow>
				))}
			</div>
			<div className="points">{score}</div>
			<div className="guessed-words">
				<ul>
					{guessed.map((guess) => {
						return <li key={guess}>{guess}</li>;
					})}
				</ul>
			</div>
		</div>
	);
};

interface Row {
	row: Array<string>;
	active: Array<string>;
}

function BoggleRow({ row, active }: Row) {
	if (!row.length) return null;
	return (
		<div className="boggle-row">
			{row.map((cell: string, i: number) => (
				<div
					key={`cell ${i}-${"cell"}`}
					className={`row-cell ${active[i] === "#" ? "active" : ""}`}
				>
					{cell.toUpperCase()}
				</div>
			))}
		</div>
	);
}

export default BoggleBoard;
