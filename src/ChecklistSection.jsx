import ChecklistItem from './ChecklistItem.jsx';
import AddItemInput from './components/AddItemInput.jsx';

export default function ChecklistSection({ items, onToggle, onDeleteItem, onUpdateItem, onAddItem, sectionId }) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map(item => (
        <ChecklistItem
          key={item.id}
          item={item}
          sectionId={sectionId}
          onToggle={() => onToggle(item.id)}
          onDelete={onDeleteItem}
          onUpdate={onUpdateItem}
        />
      ))}
      <AddItemInput sectionId={sectionId} onAdd={onAddItem} placeholder="Añadir tarea…" />
    </div>
  );
}