const Instructions = () => {
	return (
		<section className="instructions">
			<p className="instructions-header">How to play</p>
			<p>
				Try to find as many words as you can before the time runs out!
			</p>
			<div className="rules-header">Rules:</div>
			<ul className="rules-list">
				<li>
					Words must be composed of adjacent characters, diagonally,
					vertically, or horizontally
				</li>
				<li>
					Each individual letter may only be used only once per word
				</li>
				<li>Words must be at least 3 letters long</li>
			</ul>
			<p>Hint: Try to look for longer words!</p>
		</section>
	);
};

export default Instructions;
