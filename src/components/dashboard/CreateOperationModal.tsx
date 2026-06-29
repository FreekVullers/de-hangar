import { invoke } from '@tauri-apps/api/core';
import type { Client } from '@/types/flight-management';

interface CreateOperationModalProps {
  clients: Client[];
  newOperationName: string;
  setNewOperationName: (value: string) => void;
  selectedClientId: number | null;
  setSelectedClientId: (value: number | null) => void;
  newClientName: string;
  setNewClientName: (value: string) => void;
  showNewClientInput: boolean;
  setShowNewClientInput: (value: boolean) => void;
  newOperationType: string;
  setNewOperationType: (value: string) => void;
  newOperationDate: string;
  setNewOperationDate: (value: string) => void;
  loadClients: () => Promise<void>;
  loadOperations: () => Promise<void>;
  onClose: () => void;
}

export default function CreateOperationModal({
  clients,
  newOperationName,
  setNewOperationName,
  selectedClientId,
  setSelectedClientId,
  newClientName,
  setNewClientName,
  showNewClientInput,
  setShowNewClientInput,
  newOperationType,
  setNewOperationType,
  newOperationDate,
  setNewOperationDate,
  loadClients,
  loadOperations,
  onClose,
}: CreateOperationModalProps) {
  return (
    <div className="mt-4 rounded-lg border border-gray-700 p-4 space-y-4">
      <h3 className="text-white font-medium">Nieuwe operatie</h3>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Naam operatie</label>
        <input
          value={newOperationName}
          onChange={(e) => setNewOperationName(e.target.value)}
          placeholder="Bijv. Cuypershuis Roermond"
          className="w-full rounded border border-gray-700 bg-drone-dark px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Klant</label>

        <select
          value={selectedClientId ?? ''}
          onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded border border-gray-700 bg-drone-dark px-3 py-2 text-white"
        >
          <option value="">Selecteer klant</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>

        {!showNewClientInput ? (
          <button
            type="button"
            onClick={() => setShowNewClientInput(true)}
            className="mt-2 text-sm text-drone-primary hover:text-white"
          >
            + Nieuwe klant
          </button>
        ) : (
          <div className="mt-2 flex gap-2">
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Nieuwe klantnaam"
              className="flex-1 rounded border border-gray-700 bg-drone-dark px-3 py-2 text-white"
            />

            <button
              type="button"
              onClick={async () => {
                if (!newClientName.trim()) return;

                const clientId = await invoke<number>('create_client', {
                  name: newClientName.trim(),
                });

                setNewClientName('');
                setShowNewClientInput(false);
                await loadClients();
                setSelectedClientId(clientId);
              }}
              className="px-3 py-2 rounded border border-gray-700 text-white"
            >
              Opslaan
            </button>

            <button
              type="button"
              onClick={() => {
                setNewClientName('');
                setShowNewClientInput(false);
              }}
              className="px-3 py-2 rounded border border-gray-700 text-gray-400"
            >
              Annuleren
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Type vlucht</label>

        <select
          value={newOperationType}
          onChange={(e) => setNewOperationType(e.target.value)}
          className="w-full rounded border border-gray-700 bg-drone-dark px-3 py-2 text-white"
        >
          <option value="3D-mapping">3D Mapping</option>
          <option value="Inspectie">Inspectie</option>
          <option value="Thermografie">Thermografie</option>
          <option value="LiDAR">LiDAR</option>
          <option value="Multispectraal">Multispectraal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Datum uitvoering</label>

        <input
          type="date"
          value={newOperationDate}
          onChange={(e) => setNewOperationDate(e.target.value)}
          className="w-full rounded border border-gray-700 bg-drone-dark px-3 py-2 text-white"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 rounded border border-gray-700 text-gray-300"
        >
          Annuleren
        </button>

        <button
          type="button"
          onClick={async () => {
            if (!newOperationName.trim()) {
              alert('Vul een naam voor de operatie in');
              return;
            }

            if (!selectedClientId) {
              alert('Selecteer een klant');
              return;
            }

            try {
              const projectId = await invoke<number>('create_project', {
                clientId: selectedClientId,
                name: newOperationName,
                location: null,
                notes: null,
              });

              await invoke('create_operation', {
                projectId,
                name: newOperationName,
                purpose: newOperationType,
                startTime: `${newOperationDate}T00:00:00Z`,
              });

              setNewOperationName('');
              setSelectedClientId(null);
              setShowNewClientInput(false);
              setNewClientName('');
              setNewOperationType('3D-mapping');
              setNewOperationDate(new Date().toISOString().split('T')[0]);

              onClose();
              await loadOperations();
            } catch (error) {
              console.error('Failed to create operation:', error);
            }
          }}
          className="px-3 py-2 rounded bg-drone-primary text-white"
        >
          Opslaan
        </button>
      </div>
    </div>
  );
}