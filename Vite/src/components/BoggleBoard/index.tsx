import "./BoggleBoard.css";
import { useEffect, useRef, useState } from "react";
import { dict } from "../dict";
import { dice } from "../../dice";
import Definition from "./Definition";
import BoggleRow from "./BoggleRow";
import Instructions from "../Instructions";

const BoggleBoard = () => {
	// Length in seconds.
	const gameLength: number = 1;
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
	const [lastScore, setLastScore] = useState<string>("");
	const [timer, setTimer] = useState<number>(0);
	const [timerInterval, setTimerInterval] = useState<any>(null);
	const [start, setStart] = useState<boolean>(false);
	const [active, setActive] = useState<Array<Array<string>>>([
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
		["!", "!", "!", "!"],
	]);
	const [definition, setDefinition] = useState<any>();
	const [showDefinition, setShowDefinition] = useState(false);

	const wordRef = useRef<string>();
	wordRef.current = currentWord;
	const boardRef = useRef<Array<Array<string>>>();
	boardRef.current = board;
	const guessedRef = useRef<Array<string>>();
	guessedRef.current = guessed;
	const startRef = useRef<boolean>();
	startRef.current = start;
	const allPossibleWordsRef = useRef<Array<string>>();
	allPossibleWordsRef.current = allPossibleWords;
	const charRef = useRef<string>();
	charRef.current = characters;

	//Returns an matrix with shuffled characters
	function generateBoard(): Array<Array<string>> {
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
	}

	// Checks Dictionary Trie for valid prefixes
	function checkPrefix(word: string, cur: any): boolean {
		if (word.length === 0) return true;
		if (cur[word[0]] !== undefined)
			return checkPrefix(word.slice(1), cur[word[0]]);
		return false;
	}

	function checkWord(word: string, cur: any): boolean {
		// Get the root to start from
		if (word.length === 0 && cur["$"] === 0) return true;
		if (cur[word[0]] === 0 && word.length === 1) return true;
		if (cur[word[0]]) return checkWord(word.slice(1), cur[word[0]]);
		return false;
	}

	//Find all words on the board
	// Run nested loop to hit each cell and check if a word can
	// be formed starting with the letter in the cell
	function findAllWords(board: Array<Array<string>>): Array<string> {
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
	}

	// Recursive helper function for finding all words on board
	function findAllWordsHelper(
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		found: Array<string>
	): boolean {
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
		const removedLetter = board[i][j];
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
		board[i][j] = removedLetter;
		return false;
	}

	function type(input: string): void {
		if (!startRef.current) return;
		// Create copy of original board for searching and track active letters
		let boardCopy: Array<Array<string>> = [];
		boardRef.current?.forEach((row) => boardCopy.push([...row]));
		//  If backspace, delete a letter
		if (input === "Backspace") {
			if (!wordRef.current) return;
			let word = wordRef.current.slice(0, currentWord.length - 1);
			// To account for the last the last letters being 'Qu'
			if (word[word.length - 1] === "q") {
				word = word.slice(0, currentWord.length - 1);
			}
			const foundWord = checkAround(boardCopy, word);
			if (foundWord) {
				setCurrentWord((word) => (word += input));
			}
			setCurrentWord(word);
			return;
		}
		// When user clicks enter, check if the word exists
		if (input === "Enter") {
			// input there is no word or the length is too short, do nothing
			if (!wordRef.current) return;
			if (wordRef.current.length <= 2) return;
			// If the word has already been found, reset users word
			if (guessedRef.current?.find((word) => word === wordRef.current)) {
				setCurrentWord("");
				resetActive();
				return;
			}
			// if the word passes these checks but is not a valid word, reset users word
			const wordExists = allPossibleWordsRef.current?.find(
				(word) => word === wordRef.current
			);
			if (!wordExists) {
				setCurrentWord("");
				resetActive();
				return;
			}

			// If the word was correct, add it to the guesses array
			let newGuesses = [wordRef.current];
			if (guessedRef.current) newGuesses.push(...guessedRef.current);
			setGuessed(newGuesses);
			// Calculate the points the word was worth
			let wordPoints = points[wordRef.current.length];
			if (!points[wordRef.current.length]) {
				wordPoints = wordRef.current.length * 2;
			}
			// Adjust the score and reset the users word
			setScore((score) => (score += wordPoints));
			setLastScore(`${wordRef.current} + ${wordPoints}`);
			setCurrentWord("");
			return resetActive();
		}
		//If keyCode is not a letter, return
		let alphabet = "abcdefghijklmnopqrstuvwxyz";
		if (!alphabet.includes(input)) return;
		if (!charRef.current?.includes(input)) return;
		// If the key is q
		if (input === "q") input = "qu";
		// Find if the users word is on the board.
		if (checkAround(boardCopy, wordRef.current + input)) {
			setCurrentWord((word) => (word += input));
		}
	}

	// Helper for checking around the board for the users word
	function checkAroundHelper(
		board: Array<Array<string>>,
		word: string,
		i: number,
		j: number,
		k: number
	): Array<Array<string>> | boolean | undefined {
		if (k === word.length) return board;
		if (i < 0 || j < 0 || i > board.length - 1 || j > board[0].length - 1) {
			return false;
		}
		if (
			board[i][j] === word[k] ||
			(word[k] === "q" && board[i][j] === "qu")
		) {
			// To account for 'Qu'
			if (word[k] === "q" && board[i][j] === "qu") k++;
			const removedLetter = board[i][j];
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
			board[i][j] = removedLetter;
		}
	}
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
		if (timerInterval) clearInterval(timerInterval);
		setGuessed([]);
		setAllPossibleWords([]);
		resetActive();
		setLastScore("");
		setCurrentWord("");
		// Generate new board and store in state
		let newBoard = generateBoard();
		setBoard(newBoard);
		let allWords = findAllWords(newBoard);
		console.table(allWords);
		setAllPossibleWords(allWords.sort());
		setTimer(gameLength);
		setStart(true);
		// Remove focus from 'Play' button
		(document.activeElement as HTMLElement).blur();
		// Set timer
		let interval = setInterval(() => {
			setTimer((time) => (time -= 1));
		}, 1000);
		setTimerInterval(interval);
	}

	// Resets the active cells (Highlighted cells that user has used in their word attempt)
	function resetActive() {
		setActive([
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
			["!", "!", "!", "!"],
		]);
	}

	async function getDefinition(word: string) {
		if (!definition || (definition && definition.word !== word)) {
			const response = await fetch(
				`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
			);
			// If there is an error getting the definition from the API, create an error object
			// This message will be rendered instead of the words definition
			if (response.status !== 200) {
				const definitionError = {
					word: `Oops! Definition for '${word}' not found. Try searching the web.`,
					meanings: [],
				};
				setDefinition(definitionError);
			} else {
				// Otherwise set the definition
				const data = await response.json();
				setDefinition(data[0]);
			}
		}
		setShowDefinition(true);
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
		setLastScore("");
		resetActive();
		setCurrentWord("");
	}, [timer]);

	// Add event listener to watch for keystrokes
	const userType = (e: { key: string }) => {
		type(e.key);
	};
	useEffect(() => {
		window.addEventListener("keydown", userType);
		return () => window.removeEventListener("keydown", userType);
	}, [start]);

	return (
		<>
			<h1 className="title">Boggle</h1>
			<div className="social-links">
				<a
					href="https://github.com/yonilurie"
					target="_blank"
					referrerPolicy="no-referrer"
				>
					<i className="fa-brands fa-github"></i>
				</a>
				<a
					href="https://www.linkedin.com/in/yonilurie/"
					target="_blank"
					referrerPolicy="no-referrer"
				>
					<i className="fa-brands fa-linkedin-in"></i>
				</a>
			</div>
			{showDefinition && (
				<Definition
					definition={definition}
					setShowDefinition={setShowDefinition}
				></Definition>
			)}
			{/* Instructions on start page */}
			{!start && allPossibleWords.length === 0 && (
				<Instructions></Instructions>
			)}
			{/* Changes text depending on whether a game is currently active */}
			{start ? (
				<button onClick={startGame}>New Game</button>
			) : (
				<button onClick={startGame}>Play</button>
			)}
			{/* The boggle board, timer, and guessed words  */}
			{start && (
				<div className="game-container">
					<div className="board-info-container">
						<div className="word-container">
							{currentWord.length > 0 ? (
								<div className="word current-word">
									{currentWord.toUpperCase()}
								</div>
							) : (
								<div className="word last-score">
									{lastScore}
								</div>
							)}
						</div>
						<div className="boggle-board">
							{board.map((row, idx) => (
								<BoggleRow
									key={`row ${idx}`}
									row={row}
									active={active[idx]}
									userType={type}
								></BoggleRow>
							))}
						</div>
						<div className="timer">{timer} seconds left</div>
						<div className="points">Score: {score}</div>
						<div className="action-buttons">
							<button
								className="action-button delete"
								onClick={() => type("Backspace")}
							>
								Back
							</button>
							<button
								className="action-button enter"
								onClick={() => type("Enter")}
							>
								Enter
							</button>
						</div>
					</div>
					<div className="guessed-words">
						{guessed.map((guess) => (
							<li className="word" key={guess}>
								{guess}
							</li>
						))}
					</div>
				</div>
			)}
			{/* Once the game is over show all the words that were possible */}
			{!start && allPossibleWords.length > 0 && (
				<>
					<div>Score: {score}</div>
					<div>
						You got {guessed.length} out of{" "}
						{allPossibleWords.length} words!
					</div>
					<div className="word-definitions">
						{allPossibleWords.map((word) => {
							const found = guessed.find(
								(userWord) => userWord === word
							);
							return (
								<li
									key={word}
									className={`word ${
										found ? "found" : ""
									} definitions`}
									onClick={() => getDefinition(word)}
								>
									{word}
								</li>
							);
						})}
					</div>
				</>
			)}
		</>
	);
};

export default BoggleBoard;
