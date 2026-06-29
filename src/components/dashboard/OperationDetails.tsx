import { invoke } from '@tauri-apps/api/core';
import type { FlightSummary } from '@/types/flight-management';
import LinkedFlights from './LinkedFlights';
import FlightPicker from './FlightPicker';

interface OperationDetailsProps {
  selectedOperationId: number;
  operationFlights: FlightSummary[];
  aircraftNameMap: Record<string, string>;

  showFlightPicker: boolean;
  setShowFlightPicker: (value: boolean | ((current: boolean) => boolean)) => void;

  aircraftOptions: string[];
  locationOptions: string[];
  filteredPickerFlights: FlightSummary[];

  flightPickerSearch: string;
  setFlightPickerSearch: (value: string) => void;

  flightPickerAircraft: string;
  setFlightPickerAircraft: (value: string) => void;

  flightPickerDate: string;
  setFlightPickerDate: (value: string) => void;

  flightPickerLocation: string;
  setFlightPickerLocation: (value: string) => void;

  loadOperationFlights: (operationId: number) => Promise<void>;

  operationName: string;
  operationType: string;
  operationDate: string;
  clientName?: string;
}

export default function OperationDetails({
  selectedOperationId,
  operationFlights,
  aircraftNameMap,
  showFlightPicker,
  setShowFlightPicker,
  aircraftOptions,
  locationOptions,
  filteredPickerFlights,
  flightPickerSearch,
  setFlightPickerSearch,
  flightPickerAircraft,
  setFlightPickerAircraft,
  flightPickerDate,
  setFlightPickerDate,
  flightPickerLocation,
  setFlightPickerLocation,
  loadOperationFlights,
  operationName,
  operationType,
  operationDate,
  clientName,
}: OperationDetailsProps) {
  return (
    <div className="mt-6 rounded-xl border border-gray-700 p-4">
        <div className="mb-6 border-b border-gray-700 pb-5">

        <h2 className="text-2xl font-bold text-white">
            {operationName}
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">

            <div>
                <span className="text-gray-500">Klant</span>
                <div className="text-white">
                    {clientName ?? '-'}
                </div>
            </div>

            <div>
                <span className="text-gray-500">Datum</span>
                <div className="text-white">
                    {operationDate}
                </div>
            </div>

            <div>
                <span className="text-gray-500">Type</span>
                <div className="text-white">
                    {operationType}
                </div>
            </div>

            <div>
                <span className="text-gray-500">Operatie ID</span>
                <div className="text-white">
                    #{selectedOperationId}
                </div>
            </div>

        </div>

    </div>

      <h5 className="text-white font-medium mb-2">
        Gekoppelde vluchtlogs
      </h5>

      <LinkedFlights
        operationFlights={operationFlights}
        selectedOperationId={selectedOperationId}
        aircraftNameMap={aircraftNameMap}
        onUnlinkFlight={async (flightId) => {
          await invoke('remove_flight_from_operation', {
            operationId: selectedOperationId,
            flightId,
          });

          await loadOperationFlights(selectedOperationId);
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
            await invoke('add_flight_to_operation', {
              operationId: selectedOperationId,
              flightId,
            });

            await loadOperationFlights(selectedOperationId);
          }}
        />
      )}
    </div>
  );
}