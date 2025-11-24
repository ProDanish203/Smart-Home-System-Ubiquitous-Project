"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearWindowsLogs,
  controlWindow,
  getWindowsLogs,
  getWindowsStatus,
  getWindowsWeather,
  toggleWindowMode,
  checkWindowsWeather,
} from "@/API/windows";
import { toast } from "sonner";
import { LoaderIcon, CloudRain, Wind, Droplets } from "lucide-react";
import {
  GetWindowLogsApiResponse,
  GetWindowStatusApiResponse,
  CheckWindowWeatherApiResponse,
} from "@/API/api-response";

export default function SmartWindows() {
  const [currentCity] = useState("Karachi");
  const queryClient = useQueryClient();

  const { data: statusData } = useQuery({
    queryKey: ["windows-status"],
    queryFn: getWindowsStatus,
    refetchInterval: 10000,
  });

  const { data: weatherData } = useQuery({
    queryKey: ["windows-weather", currentCity],
    queryFn: () => getWindowsWeather(currentCity),
    refetchInterval: 60000,
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["windows-logs"],
    queryFn: getWindowsLogs,
    refetchInterval: 10000,
  });

  const windowStatus: GetWindowStatusApiResponse | null = statusData?.success
    ? statusData.response
    : null;
  const weather = weatherData?.success ? weatherData.response.weather : null;
  const isAutoMode = windowStatus?.mode === "auto";
  const isWindowOpen = windowStatus?.is_open ?? false;
  const autoReason = windowStatus?.auto_reason ?? "";

  const logs: GetWindowLogsApiResponse[] =
    logsData?.success && Array.isArray(logsData.response)
      ? logsData.response
      : [];

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["windows-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["windows-status"] }),
      queryClient.invalidateQueries({ queryKey: ["windows-weather"] }),
    ]);
  };

  const handleClearLogs = async () => {
    const { success, response } = await clearWindowsLogs();
    if (success) {
      await refetchAll();
      toast.success("Logs cleared successfully");
    } else toast.error(`Error clearing logs: ${response}`);
  };

  const toggleWindowState = async () => {
    const { success, response } = await controlWindow({
      is_open: !isWindowOpen,
      mode: "manual",
    });

    if (success) {
      await refetchAll();
      toast.success(
        `Windows ${!isWindowOpen ? "opened" : "closed"} successfully`
      );
    } else toast.error(`Error controlling windows: ${response}`);
  };

  const toggleAutoMode = async () => {
    const newMode = isAutoMode ? "manual" : "auto";
    const { success, response } = await toggleWindowMode(newMode);

    if (success) {
      await refetchAll();
      toast.success(`Switched to ${newMode} mode`);
    } else toast.error(`Error toggling mode: ${response}`);
  };

  const handleCheckWeather = async () => {
    const { success, response } = await checkWindowsWeather();

    if (success) {
      const checkResult = response as CheckWindowWeatherApiResponse;
      await refetchAll();
      toast.success(checkResult.action, {
        description: checkResult.reason,
      });
    } else toast.error(`Error checking weather: ${response}`);
  };

  const getWeatherIcon = () => {
    if (!weather?.description) return "☁️";
    const desc = weather.description.toLowerCase();
    if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️";
    if (desc.includes("cloud")) return "☁️";
    if (desc.includes("clear") || desc.includes("sun")) return "☀️";
    if (desc.includes("snow")) return "❄️";
    if (desc.includes("thunder") || desc.includes("storm")) return "⛈️";
    return "🌤️";
  };

  const getRainProbabilityColor = () => {
    if (!weather?.rain_probability) return "text-gray-500";
    if (weather.rain_probability > 70) return "text-red-600";
    if (weather.rain_probability > 40) return "text-orange-500";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Weather Conditions</span>
                <span className="text-3xl">{getWeatherIcon()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Temperature
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {weather?.temperature ?? "--"}°C
                  </p>
                  {weather?.feels_like && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Feels like {weather.feels_like}°C
                    </p>
                  )}
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Humidity
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {weather?.humidity ?? "--"}%
                  </p>
                  {weather?.description && (
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {weather.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      Wind Speed
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {weather?.wind_speed ?? "--"}{" "}
                    <span className="text-sm">km/h</span>
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      Rain Chance
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-bold ${getRainProbabilityColor()}`}
                  >
                    {weather?.rain_probability ?? "--"}%
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCheckWeather}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <CloudRain className="w-4 h-4 mr-2" />
                Check Weather & Auto-Adjust
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Window Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Windows</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isWindowOpen ? "Open" : "Closed"}
                  </p>
                  {isAutoMode && autoReason && (
                    <p className="text-xs text-primary mt-2 font-medium">
                      Auto: {autoReason}
                    </p>
                  )}
                </div>
                <span className="text-4xl">{isWindowOpen ? "☀️" : "🚪"}</span>
              </div>

              <Button
                onClick={toggleWindowState}
                disabled={isAutoMode}
                className={`w-full font-medium transition-colors duration-200 ${
                  isWindowOpen
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {isWindowOpen ? "Close Windows" : "Open Windows"}
              </Button>

              {isAutoMode && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 text-center font-medium">
                    ℹ️ Windows are in auto mode. Switch to manual to control
                    directly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Operating Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={toggleAutoMode}
                  className={`flex-1 font-medium transition-colors duration-200 ${
                    isAutoMode
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Auto Mode
                </Button>
                <Button
                  onClick={toggleAutoMode}
                  className={`flex-1 font-medium transition-colors duration-200 ${
                    !isAutoMode
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  Manual Mode
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {isAutoMode
                  ? "Windows automatically open/close based on weather conditions"
                  : "Control windows manually"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-border h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-foreground">
                <p className="text-lg">Window Activity</p>
                <Button
                  size="sm"
                  className="text-xs cursor-pointer"
                  onClick={handleClearLogs}
                >
                  Clear Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-96">
              <div className="space-y-2">
                {isLogsLoading ? (
                  <LoaderIcon className="animate-spin size-6" />
                ) : logs.length > 0 ? (
                  <>
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="text-xs pb-2 border-b border-border last:border-0"
                      >
                        <p className="font-mono text-muted-foreground">
                          {log.timestamp}
                        </p>
                        <p className="mt-1 text-foreground leading-relaxed font-medium">
                          {log.action}
                        </p>
                        {log.reason && (
                          <p className="text-muted-foreground mt-0.5">
                            Reason: {log.reason}
                          </p>
                        )}
                        {log.weather_condition && (
                          <p className="text-muted-foreground mt-0.5 capitalize">
                            Weather: {log.weather_condition}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No activity yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
