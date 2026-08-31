import { beatNotePool, type NoteKey } from "./logic";

type Props = {
  noteKey: NoteKey;
  groupNotes?: NoteKey[];
  noteIndex: number;
};

function NoteSvg({ html }: { html: string }) {
  return <span className="note-icon" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function BeatDisplay({ noteKey, groupNotes, noteIndex }: Props) {
  const note = beatNotePool[noteKey];
  if (groupNotes && groupNotes.length > 1) {
    return (
      <div className="beat-row">
        {groupNotes.map((nk, i) => {
          const n = beatNotePool[nk];
          const isCurrent = i === noteIndex;
          return (
            <div key={`${nk}-${i}`} className={`beat-item${isCurrent ? " current" : ""}`}>
              <div className="animal-icon">
                <img src={n.animalSrc} alt={n.animalAlt} />
              </div>
              <NoteSvg html={n.noteSvg} />
              <div className="beat-label">{isCurrent ? `👆 ${n.name}` : n.name}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="beat-note">
      <div className="animal-part">
        <img src={note.animalSrc} alt={note.animalAlt} />
      </div>
      <div className="note-part" dangerouslySetInnerHTML={{ __html: note.noteSvg }} />
    </div>
  );
}
