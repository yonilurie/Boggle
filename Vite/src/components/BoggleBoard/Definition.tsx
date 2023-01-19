import { FC } from "react";
interface Props {
	definition: {
		word: string;
		meanings: Array<Words>;
	};
	setShowDefinition: Function;
}

interface Words {
	partOfSpeech: string;
	definitions: Array<{ definition: string }>;
}

const Definition: FC<Props> = ({ definition, setShowDefinition }) => {
	return (
		<div
			className="definition-container"
			onClick={(e) => {
				if (e.currentTarget != e.target) return;
				setShowDefinition(false);
			}}
		>
			<div className="definition">
				<button
					onClick={() => setShowDefinition(false)}
					className="exit"
				>
					X
				</button>
				<div className="definition-word">{definition.word}</div>
				{definition.meanings.map((word) => {
					return (
						<div
							key={word.definitions[0].definition}
							className="definition-details"
						>
							<div className="definition-part-of-speech">
								• {word.partOfSpeech}
							</div>
							<div className="definition-meaning">
								{word.definitions[0].definition}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Definition;
