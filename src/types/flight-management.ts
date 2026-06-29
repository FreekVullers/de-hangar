export interface Client {
  id: number;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface Operation {
  id: number;
  projectId?: number | null;
  name: string;
  purpose?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  totalDurationSecs?: number | null;
  notesDefects?: string | null;
  notesIncidents?: string | null;
}

export interface FlightSummary {
  id: number;
  fileName?: string | null;
  displayName?: string | null;
  droneModel?: string | null;
  droneSerial?: string | null;
  aircraftName?: string | null;
  startTime?: string | null;
  durationSecs?: number | null;
  totalDistance?: number | null;
  homeLat?: number | null;
  homeLon?: number | null;
  locationName?: string | null;
  homeLocationName?: string | null;
  photoCount?: number | null;
}