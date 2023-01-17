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
	definitions: { definition: Array<{ definition: string }> };
}

const Definition: FC<Props> = ({ definition, setShowDefinition }) => {
	return (
		<div className="definition">
			<div className="definition-word">{definition.word}</div>
			{definition.meanings.map((meaning) => {
				return (
					<div
						key={meaning.definitions[0].definition}
						className="definition-details"
					>
						<div className="definition-part-of-speech">
							• {meaning.partOfSpeech}
						</div>
						<div className="definition-meaning">
							{meaning.definitions[0].definition}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default Definition;
