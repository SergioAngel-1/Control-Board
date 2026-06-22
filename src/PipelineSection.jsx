export default function PipelineSection({ steps }) {
  return (
    <div className="flex items-center flex-wrap gap-0 py-2 px-1">
      {steps.map((step, i) => (
        <span key={step.id} className="flex items-center gap-0">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              step.active
                ? 'bg-accent/15 border border-accent/25 text-accent'
                : 'bg-surface-raised border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            {step.text}
          </span>
          {i < steps.length - 1 && <span className="text-text-tertiary text-xs mx-1">&#8250;</span>}
        </span>
      ))}
    </div>
  );
}
