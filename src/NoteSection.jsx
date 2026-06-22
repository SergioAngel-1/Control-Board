export default function NoteSection({ text }) {
  return (
    <div className="px-4 py-3 rounded-[10px] bg-surface-raised border border-border text-sm text-text-secondary leading-relaxed">
      {text}
    </div>
  );
}
