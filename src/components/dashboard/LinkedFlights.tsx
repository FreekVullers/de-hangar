interface LinkedFlightsProps {
  operationFlights: any[];
  selectedOperationId: number;
  aircraftNameMap: Record<string, string>;
  onUnlinkFlight: (flightId: number) => Promise<void>;
}

export default function LinkedFlights({
  operationFlights,
  selectedOperationId,
  aircraftNameMap,
  onUnlinkFlight,
}: LinkedFlightsProps) {
  return (
    <>
      <h5 className="text-white font-medium mb-2">
        Gekoppelde vluchtlogs
      </h5>

      {operationFlights.length === 0 && (
        <p className="text-gray-500 text-sm mb-3">
          Nog geen vluchtlogs gekoppeld
        </p>
      )}

      {operationFlights.length > 0 && (
        <div className="space-y-2 mb-3">
          {operationFlights.map((flight: any) => (
            <div
              key={flight.id}
              className="rounded border border-gray-700 px-3 py-3 text-sm flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-white font-medium">
                  {flight.displayName}
                </div>

                <div className="text-gray-400 text-xs mt-1">
                  {flight.startTime ?? 'Geen tijd'} ·{' '}
                  {aircraftNameMap[flight.droneSerial] ??
                    flight.aircraftName ??
                    flight.droneModel ??
                    'Onbekende drone'}{' '}
                  · {flight.homeLocationName ?? 'Geen locatie'} ·{' '}
                  {Math.round((flight.durationSecs ?? 0) / 60)} min
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  {Math.round(flight.totalDistance ?? 0)} m · {flight.photoCount ?? 0} foto’s
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!selectedOperationId) return;
                  onUnlinkFlight(flight.id);
                }}
                className="text-red-400 hover:text-red-300"
                title="Vluchtlog ontkoppelen"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}