export default function QuoteFooter({ quotes, index, onClick }) {
  if (!quotes || quotes.length === 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Mostrar siguiente frase"
      className="w-full px-4 py-3.5 border-t border-border text-xs italic text-text-tertiary text-center cursor-pointer transition-colors hover:text-text-secondary min-h-[48px] flex items-center justify-center select-none"
    >
      {quotes[index % quotes.length]}
    </button>
  );
}
