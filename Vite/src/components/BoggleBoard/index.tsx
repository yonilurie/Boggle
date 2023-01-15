import "./BoggleBoard.css";
import { useEffect, useRef, useState } from "react";
import { dict } from "./dict";
import { dice } from "../../dice";

const BoggleBoard = () => {
	// Length in seconds.
	const gameLength: number = 12;
	// Game board size, n*n dice.
	const boardSize = 4;
	// Map of word length to points
	// Word longer than 6 characters gives points equal to word length times 2
	const points: { [wordLength: string]: number } = {
		"3": 1,
		"4": 2,
		"5": 3,
		"6": 5,
	};

	const [board, setBoard] = useState<Array<Array<string>>>([[]]);
	const [currentWord, setCurrentWord] = useState<string>("");
	const [characters, setCharacters] = useState<string>("");
	const [guessed, setGuessed] = useState<Array<string>>([]);
	const [allPossibleWords, setAllPossibleWords] = useState<Array<string>>([]);
	const [score, setScore] = useState<number>(0);
	const [lastScore, setLastScore] = useState<number>(0);
	const [timer, setTimer] = useState<number>(0);
	const [timerInterval, setTimerInterval] = useState<number | null>(null);
	const [start, setStart] = useState<boolean>(false);
	const [active, setActive] = useState<Array<Array<string>>>([
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
	]);

	const wordRef = useRef<string>();
	wordRef.current = currentWord;
	const boardRef = useRef<Array<Array<string>>>();
	boardRef.current = board;
	const charRef = useRef<string>();
	charRef.current = characters;
	const guessedRef = useRef<Array<string>>();
	guessedRef.current = guessed;
	const startRef = useRef<boolean>();
	startRef.current = start;

	//Returns an matrix with shuffled characters
	const generateBoard = (): Array<Array<string>> => {
		// Fisher-Yates Shuffle
		function shuffle(arr: Array<string>): Array<string> {
			let idx = arr.length;
			let randIdx;
			// While there remain elements to shuffle.
			while (idx != 0) {
				// Pick a remaining element.
				randIdx = Math.floor(Math.random() * idx);
				idx--;
				// And swap it with the current element.
				[arr[idx], arr[randIdx]] = [arr[randIdx], arr[idx]];
			}
			return arr;
		}
		// Create row array
		let chars = [];
		// Get random letter from each die and push to array
		for (let i = 0; i < dice.length; i++) {
			let random = Math.floor(Math.random() * 6);
			chars.push(dice[i][random]);
		}
		setCharacters(chars.join(""));
		// Shuffle the chars
		let shuffled: Array<string> = shuffle(chars);
		//Divide chars into 4X4 matrix
		let board: Array<Array<string>> = [];
		for (let i = 0; i < shuffled.length; i += boardSize) {
			board.push(shuffled.slice(i, i + 4));
		}
		return board;
	};
	// Checks Dictionary Trie for word
	// const checkWord = (word: string, cur: any): boolean => {
	// 	if (cur[word] && cur[word]["$"] === 0) return true;
	// 	if (word.length === 0 && cur[`$`] === 0) return true;
	// 	if (cur[word[0]]) return checkWord(word.slice(1), cur[word[0]]);
	// 	else if (!cur[word[0]]) return false;
	// 	else return false;
	// };
	// Checks Dictionary Trie for valid prefixes
	const checkPrefix = (word: string, cur: any): boolean => {
		if (word.length === 0) return true;
		if (cur[word[0]]) return checkPrefix(word.slice(1), cur[word[0]]);
		else if (!cur[word[0]]) return false;
		else return false;
	};

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

	//Find all words on the board
	// Run nested loop to hit each cell and check if a word can
	// be formed starting with the letter in the cell
	const findAllWords = (board): Array<string> => {
		// Create array for sotring all found words
		let allWords: Array<string> = [];
		// Loop through each cell using nested for loops
		for (let i = 0; i < boardSize; i++) {
			for (let j = 0; j < boardSize; j++) {
				// Create copy of original board for searching and track active letters
				let boardCopy: Array<Array<string>> = [];
				board.forEach((row) => boardCopy.push([...row]));
				// See if a word can be formed from the first char
				let canFormWord: boolean = findAllWordsHelper(
					boardCopy,
					"",
					i,
					j,
					allWords
				);
				// If a word is found, decrease j by one and try to
				// find another word from the same cell
				// This is to find words that can be formed by using previous word as prefix
				// e.g 'coup' => 'coups', 'car' => 'card'
				if (canFormWord) j--;
			}
		}
		return allWords;
	};

	// Recursive helper function for finding all words on board
	const findAllWordsHelper = (
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		found: Array<string>
	): boolean => {
		//Check if indeces are outside of the matrix
		if (i < 0 || j < 0) return false;
		if (i > board.length - 1 || j > board[0].length - 1) return false;
		// Check if cell contains '#'
		// if it does that means the letter is in use and cant be used again for this word.
		if (board[i][j] === "#") return false;
		// Add the character in the cell to the word
		word += board[i][j];
		// Check if the string is a valid prefix,
		// If it is we can stop there, as it can not become a word.
		let validPrefix = checkPrefix(word, dict);
		if (!validPrefix) return false;
		// If the word is the minimum length for a word, check if it is valid
		else if (word.length > 2) {
			let isWord = checkWord(word, dict);
			// If word is valid and not yet found, add to found words array
			if (isWord && !found.find((foundWord) => foundWord === word)) {
				found.push(word);
				return true;
			}
		}

		var tmp = board[i][j];
		board[i][j] = "#";
		if (
			findAllWordsHelper(board, word, i + 1, j, found) ||
			findAllWordsHelper(board, word, i - 1, j, found) ||
			findAllWordsHelper(board, word, i, j + 1, found) ||
			findAllWordsHelper(board, word, i, j - 1, found) ||
			findAllWordsHelper(board, word, i - 1, j - 1, found) ||
			findAllWordsHelper(board, word, i + 1, j - 1, found) ||
			findAllWordsHelper(board, word, i - 1, j + 1, found) ||
			findAllWordsHelper(board, word, i + 1, j + 1, found)
		) {
			return true;
		}
		board[i][j] = tmp;
		return false;
	};

	function type(e: {
		keyCode: number;
		key: string;
		stopPropagation: Function;
	}): void {
		if (!startRef.current) return;
		// Create copy of original board for searching and track active letters
		let boardCopy: Array<Array<string>> = [];
		boardRef.current?.forEach((row) => boardCopy.push([...row]));
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
			// If there is no word or the length is too short, do nothing
			if (!wordRef.current) return;
			if (wordRef.current.length <= 2) return;
			// If the word has already been found, reset users word
			if (guessedRef.current?.find((word) => word === wordRef.current)) {
				setCurrentWord("");
				return resetActive();
			}
			// if the word passes these checks but is not a valid word, reset users word
			if (!checkWord(wordRef.current, dict)) {
				setCurrentWord("");
				return resetActive();
			}
			// If the word was correct, add it to the guesses array
			let newGuesses = [...guessedRef.current, wordRef.current];
			setGuessed(newGuesses);
			// Calculate the points the word was worth
			let wordPoints = points[wordRef.current.length];
			if (!points[wordRef.current.length]) {
				wordPoints = wordRef.current.length * 2;
			}
			// Adjust the score and reset the users word
			setScore((score) => (score += wordPoints));
			setCurrentWord("");
			return resetActive();
		}
		//If keyCode is not a letter, return
		if (e.keyCode < 65 || e.keyCode > 90) return;
		if (!charRef.current?.includes(e.key)) return;
		let letter = e.key;
		// Find if the users word is on the board.
		const foundWord = checkAround(boardCopy, wordRef.current + letter);
		if (foundWord) setCurrentWord((word) => (word += letter));
	}

	// Helper for checking around the board for the users word
	const checkAroundHelper = (
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		k: number
	): Array<Array<string>> | boolean | undefined => {
		if (k === word.length) return board;
		if (i < 0 || j < 0 || i > board.length - 1 || j > board[0].length - 1) {
			return false;
		}
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
	// Using nested loops check each cell to see if the word can be formed on the board
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
	// Update the active letters so the user can see which letters
	// they have already  used in their attempt
	function updateActiveLetters(board: Array<Array<string>>) {
		for (let i = 0; i < boardSize; i++) {
			for (let j = 0; j < boardSize; j++) {
				if (board[i][j] !== "#") board[i][j] = "!";
			}
		}
	}
	// Starts the game, creates a new random board and a timer
	function startGame() {
		//If interval exists, clear it
		clearInterval(timerInterval);
		setGuessed([]);
		setAllPossibleWords([]);
		// Generate new board and store in state
		let newBoard = generateBoard();
		setBoard(newBoard);
		let allWords = findAllWords(newBoard);
		setAllPossibleWords(allWords.sort());
		setTimer(gameLength);
		setStart(true);

		// Add event listener to watch for keystrokes
		// Remove the event listener after the game ends
		document.addEventListener("keydown", type);
		setTimeout(
			() => document.removeEventListener("keydown", type),
			gameLength * 1000
		);

		// Remove focus from 'Play' button
		document.activeElement?.blur();
		// Set timer
		let interval = setInterval(() => {
			setTimer((time) => (time -= 1));
		}, 1000);
		setTimerInterval(interval);
	}

	// Resets the active cells (Highlgihted cells that user has used in their word attempt)
	function resetActive() {
		setActive([
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
		]);
	}

	// If the timer has reached zero, end the game and find all possible word combinations
	useEffect(() => {
		if (guessed.length === allPossibleWords.length) {
			setTimer(0);
			setStart(false);
		}
		if (timer > 0) return;
		if (timerInterval) clearInterval(timerInterval);
		setStart(false);
		setLastScore(score);
		resetActive();
		setCurrentWord("");
	}, [timer]);

	return (
		<>
			<button onClick={startGame}>play</button>
			<div>{currentWord}</div>

			{start && (
				<>
					<div className="boggle-board">
						{board.map((row, idx) => (
							<BoggleRow
								key={`row ${idx}`}
								row={row}
								active={active[idx]}
							></BoggleRow>
						))}
					</div>
					<div className="timer">{timer} seconds left</div>
					<div className="points">Score: {score}</div>
				</>
			)}

			{!start && allPossibleWords.length > 0 && (
				<>
					<div>Score: {lastScore}</div>

					<div>
						You got {guessed.length} / {allPossibleWords.length}{" "}
						words!
					</div>
				</>
			)}
			<div className="guessed-words">
				{start ? (
					<ul>
						{guessed.map((guess) => {
							return <li key={guess}>{guess}</li>;
						})}
					</ul>
				) : (
					allPossibleWords.map((word) => {
						if (guessed.find((userWord) => userWord === word)) {
							return (
								<li key={word} className="word found">
									{word}
								</li>
							);
						} else {
							return (
								<li className="word" key={word}>
									{word}
								</li>
							);
						}
					})
				)}
			</div>
		</>
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
