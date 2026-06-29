import type { Operation } from '@/types/flight-management';

interface OperationListProps {
  operations: Operation[];
  selectedOperationId: number | null;
  onSelect: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
}

export default function OperationList({
  operations,
  selectedOperationId,
  onSelect,
  onDelete,
}: OperationListProps) {
  return (
    <div className="mt-4 space-y-2">
      {operations.map((operation) => (
        <div
          key={operation.id}
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            selectedOperationId === operation.id
              ? 'border-drone-primary bg-drone-primary/10 text-white'
              : 'border-gray-700 text-white hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSelect(operation)}
              className="flex-1 text-left"
            >
              {operation.name}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(operation);
              }}
              className="ml-3 text-red-400 hover:text-red-300 transition-colors"
              title="Operatie verwijderen"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}