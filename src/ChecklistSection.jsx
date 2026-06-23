import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ChecklistItem from './ChecklistItem.jsx';
import AddItemInput from './components/AddItemInput.jsx';

export default function ChecklistSection({ items, onToggle, onDeleteItem, onUpdateItem, onAddItem, sectionId, onReorderItems }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = items.map(i => i.id);
    const oldIdx = ids.indexOf(active.id);
    const newIdx = ids.indexOf(over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    ids.splice(oldIdx, 1);
    ids.splice(newIdx, 0, active.id);
    onReorderItems(sectionId, ids);
  }

  return (
    <div className="flex flex-col gap-0.5">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onDelete={onDeleteItem}
              onUpdate={onUpdateItem}
            />
          ))}
        </SortableContext>
      </DndContext>
      <AddItemInput sectionId={sectionId} onAdd={onAddItem} placeholder="Añadir tarea…" />
    </div>
  );
}