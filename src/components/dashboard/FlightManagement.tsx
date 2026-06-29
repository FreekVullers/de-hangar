import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getEquipmentNames } from '@/lib/api';
import ConfirmDialog from '../ConfirmDialog';
import OperationDetails from './OperationDetails';
import CreateOperationModal from './CreateOperationModal';
import OperationList from './OperationList';
import type { Client, FlightSummary, Operation } from '@/types/flight-management';

interface FlightManagementProps {
  flights: FlightSummary[];
}

export default function FlightManagement({ flights }: FlightManagementProps) {
  const [showFlightPicker, setShowFlightPicker] = useState(false);
  const [flightPickerSearch, setFlightPickerSearch] = useState('');
  const [flightPickerAircraft, setFlightPickerAircraft] = useState('');
  const [flightPickerDate, setFlightPickerDate] = useState('');
  const [flightPickerLocation, setFlightPickerLocation] = useState('');
  const [operations, setOperations] = useState<Operation[]>([]);
  const [operationFlights, setOperationFlights] = useState<FlightSummary[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [showCreateOperationModal, setShowCreateOperationModal] = useState(false);
  const [newOperationName, setNewOperationName] = useState('');
  const [newOperationType, setNewOperationType] = useState('3D-mapping');
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(null);
  const [isDeletingOperation, setIsDeletingOperation] = useState(false);
  const [newOperationDate, setNewOperationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [aircraftNameMap, setAircraftNameMap] = useState<Record<string, string>>({});
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);

  const loadOperations = async () => {
    try {
      const result = await invoke<Operation[]>('get_operations');
      setOperations(result);
    } catch (error) {
      console.error('Failed to load operations:', error);
    }
  };

  const loadClients = async () => {
    try {
      const result = await invoke<Client[]>('get_all_clients');
      setClients(result);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadOperationFlights = async (operationId: number) => {
    try {
      const result = await invoke<FlightSummary[]>('get_operation_flights', {
        operationId,
      });

      setOperationFlights(result);
    } catch (error) {
      console.error('Failed to load operation flights:', error);
    }
  };

  useEffect(() => {
    loadOperations();
    loadClients();
  }, []);

  useEffect(() => {
    getEquipmentNames()
      .then((names) => setAircraftNameMap(names.aircraft_names))
      .catch((error) => console.error('Failed to load equipment names:', error));
  }, []);

    const aircraftOptions = useMemo(() => {
    return Array.from(
        new Set(
        flights
            .map((flight) =>
            (flight.droneSerial ? aircraftNameMap[flight.droneSerial] : undefined) ??
            flight.aircraftName ??
            flight.droneModel
            )
            .filter((value): value is string => Boolean(value))
        )
    ).sort();
    }, [flights, aircraftNameMap]);

    const locationOptions = useMemo(() => {
    return Array.from(
        new Set(
        flights
            .map((flight) => flight.locationName ?? flight.homeLocationName)
            .filter((value): value is string => Boolean(value))
        )
    ).sort();
    }, [flights]);  

  const linkedFlightIds = useMemo(() => {
    return new Set(operationFlights.map((flight) => flight.id));
  }, [operationFlights]);

  const filteredPickerFlights = useMemo(() => {
    const search = flightPickerSearch.toLowerCase();
    const locationSearch = flightPickerLocation.toLowerCase();

    return flights
      .filter((flight) => {
        if (linkedFlightIds.has(flight.id)) return false;

        const aircraft =
          (flight.droneSerial ? aircraftNameMap[flight.droneSerial] : undefined) ??
          flight.aircraftName ??
          flight.droneModel ??
          '';

        const location = flight.locationName ?? flight.homeLocationName ?? '';

        const matchesSearch = [
          flight.displayName,
          flight.fileName,
          aircraft,
          flight.aircraftName,
          flight.droneModel,
          flight.startTime,
          flight.homeLat?.toString(),
          flight.homeLon?.toString(),
          location,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

        const matchesAircraft =
          !flightPickerAircraft || aircraft === flightPickerAircraft;

        const matchesDate =
          !flightPickerDate || flight.startTime?.startsWith(flightPickerDate);

        const matchesLocation =
          !flightPickerLocation ||
          location.toLowerCase().includes(locationSearch);

        return matchesSearch && matchesAircraft && matchesDate && matchesLocation;
      })
      .slice(0, 100);
  }, [
    flights,
    linkedFlightIds,
    aircraftNameMap,
    flightPickerSearch,
    flightPickerAircraft,
    flightPickerDate,
    flightPickerLocation,
  ]);

  const selectedOperation =
  operations.find((o) => o.id === selectedOperationId);

  return (
    <>
      <div className="w-full h-full overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Vluchtbeheer</h2>
          <p className="text-gray-400 mb-6">
            Beheer operaties, gekoppelde vluchtlogs, documenten en opmerkingen.
          </p>
      
          <div className="rounded-xl border border-gray-700 bg-drone-dark/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Operaties</h3>
      
              <button
                type="button"
                onClick={() => setShowCreateOperationModal(true)}
                className="px-3 py-2 rounded-lg bg-drone-primary/20 border border-drone-primary text-white text-sm hover:bg-drone-primary/30 transition-colors"
              >
                Nieuwe operatie
              </button>
            </div>
            {showCreateOperationModal && (
                <CreateOperationModal
                    clients={clients}
                    newOperationName={newOperationName}
                    setNewOperationName={setNewOperationName}
                    selectedClientId={selectedClientId}
                    setSelectedClientId={setSelectedClientId}
                    newClientName={newClientName}
                    setNewClientName={setNewClientName}
                    showNewClientInput={showNewClientInput}
                    setShowNewClientInput={setShowNewClientInput}
                    newOperationType={newOperationType}
                    setNewOperationType={setNewOperationType}
                    newOperationDate={newOperationDate}
                    setNewOperationDate={setNewOperationDate}
                    loadClients={loadClients}
                    loadOperations={loadOperations}
                    onClose={() => setShowCreateOperationModal(false)}
                />
                )}
            <p className="text-gray-500 text-sm">
              {operations.length} operaties gevonden
            </p>
      
            <div className="mt-6 grid grid-cols-12 gap-6">

                <div className="col-span-4">
                    <OperationList
                    operations={operations}
                    selectedOperationId={selectedOperationId}
                    onSelect={(operation) => {
                        if (selectedOperationId === operation.id) {
                        setSelectedOperationId(null);
                        setOperationFlights([]);
                        setShowFlightPicker(false);
                        return;
                        }

                        setSelectedOperationId(operation.id);
                        loadOperationFlights(operation.id);
                    }}
                    onDelete={(operation) => {
                        setOperationToDelete(operation);
                    }}
                    />
                </div>

                <div className="col-span-8">

                    {selectedOperationId ? (
                    <OperationDetails
                        selectedOperationId={selectedOperationId}
                        operationName={selectedOperation?.name ?? ''}
                        operationType={selectedOperation?.purpose ?? ''}
                        operationDate={selectedOperation?.startTime ?? ''}
                        operationFlights={operationFlights}
                        aircraftNameMap={aircraftNameMap}
                        showFlightPicker={showFlightPicker}
                        setShowFlightPicker={setShowFlightPicker}
                        aircraftOptions={aircraftOptions}
                        locationOptions={locationOptions}
                        filteredPickerFlights={filteredPickerFlights}
                        flightPickerSearch={flightPickerSearch}
                        setFlightPickerSearch={setFlightPickerSearch}
                        flightPickerAircraft={flightPickerAircraft}
                        setFlightPickerAircraft={setFlightPickerAircraft}
                        flightPickerDate={flightPickerDate}
                        setFlightPickerDate={setFlightPickerDate}
                        flightPickerLocation={flightPickerLocation}
                        setFlightPickerLocation={setFlightPickerLocation}
                        loadOperationFlights={loadOperationFlights}
                    />
                    ) : (
                    <div className="rounded-xl border border-gray-700 bg-drone-dark/40 p-12 text-center text-gray-500">
                        Selecteer links een operatie om de details te bekijken.
                    </div>
                    )}

                </div>

                </div>
          </div>
        </div>
      </div>
              
      <ConfirmDialog
        open={operationToDelete !== null}
        title="Operatie verwijderen"
        message={
          operationToDelete
            ? `Weet je zeker dat je de operatie "${operationToDelete.name}" wilt verwijderen?

De gekoppelde vluchtlogs blijven behouden.`
            : ''
        }
        confirmText="Verwijderen"
        cancelText="Annuleren"
        danger
        loading={isDeletingOperation}
        onCancel={() => setOperationToDelete(null)}
        onConfirm={async () => {
          if (!operationToDelete) return;

          setIsDeletingOperation(true);

          try {
            await invoke('delete_operation', {
              operationId: operationToDelete.id,
            });

            if (selectedOperationId === operationToDelete.id) {
              setSelectedOperationId(null);
            }

            setOperationToDelete(null);
            await loadOperations();
          } catch (error) {
            console.error(error);
          } finally {
            setIsDeletingOperation(false);
          }
        }}
      />
    </>
  );
}
