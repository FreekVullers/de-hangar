import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getEquipmentNames } from '@/lib/api';
import ConfirmDialog from '../ConfirmDialog';
import OperationDetails from './OperationDetails';
import CreateOperationModal from './CreateOperationModal';
import OperationList from './OperationList';
import LinkedFlights from './LinkedFlights';
import FlightPicker from './FlightPicker';

interface FlightManagementProps {
  flights: any[];
}

export default function FlightManagement({ flights }: FlightManagementProps) {
  const [showFlightPicker, setShowFlightPicker] = useState(false);
  const [flightPickerSearch, setFlightPickerSearch] = useState('');
  const [flightPickerAircraft, setFlightPickerAircraft] = useState('');
  const [flightPickerDate, setFlightPickerDate] = useState('');
  const [flightPickerLocation, setFlightPickerLocation] = useState('');
  const [operations, setOperations] = useState<any[]>([]);
  const [operationFlights, setOperationFlights] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [showNewClientInput, setShowNewClientInput] = useState(false);
  const [showCreateOperationModal, setShowCreateOperationModal] = useState(false);
  const [newOperationName, setNewOperationName] = useState('');
  const [newOperationType, setNewOperationType] = useState('3D-mapping');
  const [operationToDelete, setOperationToDelete] = useState<any | null>(null);
  const [isDeletingOperation, setIsDeletingOperation] = useState(false);
  const [newOperationDate, setNewOperationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [aircraftNameMap, setAircraftNameMap] = useState<Record<string, string>>({});
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);

  const loadOperations = async () => {
    try {
      const result = await invoke<any[]>('get_operations');
      setOperations(result);
    } catch (error) {
      console.error('Failed to load operations:', error);
    }
  };

  const loadClients = async () => {
    try {
      const result = await invoke<any[]>('get_all_clients');
      setClients(result);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadOperationFlights = async (operationId: number) => {
    try {
      const result = await invoke<any[]>('get_operation_flights', {
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
          .map((flight: any) =>
            aircraftNameMap[flight.droneSerial] ??
            flight.aircraftName ??
            flight.droneModel
          )
          .filter(Boolean)
      )
    ).sort();
  }, [flights, aircraftNameMap]);

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(
        flights
          .map((flight: any) => flight.locationName ?? flight.homeLocationName)
          .filter(Boolean)
      )
    ).sort();
  }, [flights]);

  const linkedFlightIds = useMemo(() => {
    return new Set(operationFlights.map((flight: any) => flight.id));
  }, [operationFlights]);

  const filteredPickerFlights = useMemo(() => {
    const search = flightPickerSearch.toLowerCase();
    const locationSearch = flightPickerLocation.toLowerCase();

    return flights
      .filter((flight: any) => {
        if (linkedFlightIds.has(flight.id)) return false;

        const aircraft =
          aircraftNameMap[flight.droneSerial] ??
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
      
            <div className="mt-4 space-y-2">
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

              {selectedOperationId && (
                <OperationDetails>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Operatie details
                  </h4>
      
                  <p className="text-gray-400 text-sm mb-4">
                    Operatie ID: {selectedOperationId}
                  </p>
      
                  <h5 className="text-white font-medium mb-2">
                    Gekoppelde vluchtlogs
                  </h5>
      
                  <LinkedFlights
                    operationFlights={operationFlights}
                    selectedOperationId={selectedOperationId}
                    aircraftNameMap={aircraftNameMap}
                    onUnlinkFlight={async (flightId) => {
                        if (!selectedOperationId) return;

                        try {
                        await invoke('remove_flight_from_operation', {
                            operationId: selectedOperationId,
                            flightId,
                        });

                        await loadOperationFlights(selectedOperationId);
                        } catch (error) {
                        alert(String(error));
                        }
                    }}
                    />
      
                  <button
                    type="button"
                    onClick={() => setShowFlightPicker((value) => !value)}
                    className="px-3 py-2 rounded-lg border border-drone-primary text-white text-sm hover:bg-drone-primary/10"
                  >
                    + Vluchtlog koppelen
                  </button>
      
                  {showFlightPicker && (
                    <FlightPicker
                        aircraftOptions={aircraftOptions}
                        locationOptions={locationOptions}
                        filteredPickerFlights={filteredPickerFlights}
                        aircraftNameMap={aircraftNameMap}
                        flightPickerSearch={flightPickerSearch}
                        setFlightPickerSearch={setFlightPickerSearch}
                        flightPickerAircraft={flightPickerAircraft}
                        setFlightPickerAircraft={setFlightPickerAircraft}
                        flightPickerDate={flightPickerDate}
                        setFlightPickerDate={setFlightPickerDate}
                        flightPickerLocation={flightPickerLocation}
                        setFlightPickerLocation={setFlightPickerLocation}
                        onLinkFlight={async (flightId) => {
                        if (!selectedOperationId) return;

                        try {
                            await invoke('add_flight_to_operation', {
                            operationId: selectedOperationId,
                            flightId,
                            });

                            await loadOperationFlights(selectedOperationId);
                        } catch (error) {
                            alert(String(error));
                        }
                        }}
                    />
                  )}
                </OperationDetails>
              )}
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
