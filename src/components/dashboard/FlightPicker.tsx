import { DebouncedInput } from '../ui/DebouncedInput';
import type { FlightSummary } from '@/types/flight-management';

interface FlightPickerProps {
  aircraftOptions: string[];
  locationOptions: string[];
  filteredPickerFlights: FlightSummary[];
  aircraftNameMap: Record<string, string>;

  flightPickerSearch: string;
  setFlightPickerSearch: (value: string) => void;

  flightPickerAircraft: string;
  setFlightPickerAircraft: (value: string) => void;

  flightPickerDate: string;
  setFlightPickerDate: (value: string) => void;

  flightPickerLocation: string;
  setFlightPickerLocation: (value: string) => void;

  onLinkFlight: (flightId: number) => Promise<void>;
}

export default function FlightPicker({
  aircraftOptions,
  locationOptions,
  filteredPickerFlights,
  aircraftNameMap,
  flightPickerSearch,
  setFlightPickerSearch,
  flightPickerAircraft,
  setFlightPickerAircraft,
  flightPickerDate,
  setFlightPickerDate,
  flightPickerLocation,
  setFlightPickerLocation,
  onLinkFlight,
}: FlightPickerProps) {
  return (
    <div className="mt-4 rounded-lg border border-gray-700 p-3">
      <DebouncedInput
        value={flightPickerSearch}
        onDebouncedChange={setFlightPickerSearch}
        placeholder="Zoeken op naam..."
        className="w-full mb-3 rounded border border-gray-700 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <select
          value={flightPickerAircraft}
          onChange={(event) => setFlightPickerAircraft(event.target.value)}
          className="rounded border border-gray-700 bg-drone-dark px-3 py-2 text-sm text-white"
        >
          <option value="">Alle toestellen</option>
          {aircraftOptions.map((aircraft: string) => (
            <option key={aircraft} value={aircraft}>
              {aircraft}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={flightPickerDate}
          onChange={(event) => setFlightPickerDate(event.target.value)}
          className="rounded border border-gray-700 bg-drone-dark px-3 py-2 text-sm text-white"
        />

        <DebouncedInput
          value={flightPickerLocation}
          onDebouncedChange={setFlightPickerLocation}
          placeholder="Zoek/kies plaatsnaam..."
          list="flight-location-options"
          className="rounded border border-gray-700 bg-drone-dark px-3 py-2 text-sm text-white placeholder:text-gray-500"
        />

        <datalist id="flight-location-options">
          {locationOptions.map((location: string) => (
            <option key={location} value={location} />
          ))}
        </datalist>
      </div>

      <div className="max-h-80 overflow-auto">
        {filteredPickerFlights.map((flight) => (
          <button
            key={flight.id}
            type="button"
            onClick={() => onLinkFlight(flight.id)}
            className="w-full text-left px-3 py-2 border-b border-gray-800 hover:bg-white/5 text-sm"
          >
            <div className="text-white font-medium">
              {flight.displayName}
            </div>

            <div className="text-gray-400 text-xs">
              {flight.startTime ?? 'Geen tijd'} ·{' '}
              {flight.homeLocationName ??
                (flight.homeLat && flight.homeLon
                  ? `${flight.homeLat.toFixed(5)}, ${flight.homeLon.toFixed(5)}`
                  : 'Geen locatie')}{' '}
              · {(flight.droneSerial ? aircraftNameMap[flight.droneSerial] : undefined) ??
                flight.aircraftName ??
                flight.droneModel ??
                'Onbekende drone'} ·{' '}
              {Math.round((flight.durationSecs ?? 0) / 60)} min
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}