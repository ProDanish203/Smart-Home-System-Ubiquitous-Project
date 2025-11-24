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

export interface VerifyDoorUnlockResponse {
  action: "denied" | "unlocked";
  message: string;
  success: boolean;
  person_name?: string;
  confidence?: number;
}

export interface DoorStatusResponse {
  registered_faces: number;
  last_action: string;
  last_person: string;
  last_timestamp: string;
  face_recognition_available: boolean;
  api_provider: string;
}

export interface GetWindowStatusApiResponse {
  id: number;
  is_open: boolean;
  mode: "auto" | "manual";
  auto_reason: string;
  timestamp: string;
}

export interface GetWindowLogsApiResponse {
  id: number;
  action: string;
  reason: string;
  weather_condition: string;
  timestamp: string;
}

export interface CheckWindowWeatherApiResponse {
  action: string;
  reason: string;
  weather: {
    temperature: number;
    description: string;
    humidity: number;
    feels_like: number;
    wind_speed: number;
    rain_probability: number;
    weather_code: number;
  };
  windows_open: boolean;
}
