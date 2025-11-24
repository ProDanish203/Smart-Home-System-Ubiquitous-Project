export interface GetWeatherApiResponse {
  temperature: number;
  description: string;
  humidity: number;
  feels_like: number;
}

export interface GetFanLogsApiResponse {
  id: number;
  action: string;
  details: string;
  status: string;
  timestamp: string;
}

export interface ControlFanApiResponse {
  id: number;
  is_active: boolean;
  mode: "auto" | "manual";
  speed_level: number;
  temperature: number;
  timestamp: string;
}

export interface GetFanStatusApiResponse {
  id: number;
  temperature: number;
  speed_level: number;
  mode: string;
  is_active: boolean;
  timestamp: string;
}

export interface GetLightStatusApiResponse {
  id: string;
  is_on: boolean;
  brightness: number;
  mode: "auto" | "manual";
  presence_detected: boolean;
  timestamp: string;
}

export interface GetLightLogsApiResponse {
  id: number;
  action: string;
  brightness: number;
  reason: string;
  timestamp: string;
}

export interface GetLightTimeApiResponse {
  current_time: string;
  current_hour: number;
  is_night: boolean;
  night_hours: string;
  message: string;
}

export interface DetectPresenceApiResponse {
  brightness: number;
  is_dark: boolean;
  is_night: boolean;
  lights_on: boolean;
  message: string;
  mode: "auto" | "manual";
  presence_detected: boolean;
}

export interface GetDoorLogsApiResponse {
  id: number;
  action: string;
  person_name: string;
  success: boolean;
  timestamp: string;
}

export interface GetRegisteredFacesResponse {
  id: number;
  person_name: string;
  registered_at: string;
}
