"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearFanActivityLogs,
  controlFan,
  getFanActivityLogs,
  getFanStatus,
  getFanWeather,
  toggleFanMode,
} from "@/API/fan";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import {
  GetFanLogsApiResponse,
  GetFanStatusApiResponse,
  GetWeatherApiResponse,
} from "@/API/api-response";

export default function SmartFan() {
  const [currentCity] = useState("Karachi");
  const queryClient = useQueryClient();
  const fanSpeedDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ["fan-status"],
    queryFn: getFanStatus,
    refetchInterval: 10000,
  });

  const { data: weatherData } = useQuery({
    queryKey: ["fan-weather", currentCity],
    queryFn: () => getFanWeather(currentCity),
    refetchInterval: 60000,
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["fan-logs"],
    queryFn: getFanActivityLogs,
    refetchInterval: 10000,
  });

  const fanStatus: GetFanStatusApiResponse | null = statusData?.success
    ? statusData.response
    : null;
  const weather: GetWeatherApiResponse | null = weatherData?.success
    ? weatherData.response
    : null;

  const isAutoMode = fanStatus?.mode === "auto";
  const fanSpeed = fanStatus?.speed_level ?? 0;
  const temperature = weather?.temperature ?? fanStatus?.temperature ?? 22;
  const isActive = fanStatus?.is_active ?? false;

  const logs: GetFanLogsApiResponse[] =
    logsData?.success && Array.isArray(logsData.response)
      ? logsData.response
      : [];

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["fan-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["fan-status"] }),
    ]);
  };

  useEffect(() => {
    return () => {
      if (fanSpeedDebounceRef.current)
        clearTimeout(fanSpeedDebounceRef.current);
    };
  }, []);

  const handleClearLogs = async () => {
    const { success, response } = await clearFanActivityLogs();
    if (success) {
      await refetchAll();
      toast.success("Logs cleared successfully");
    } else toast.error(`Error clearing logs: ${response}`);
  };

  const handleFanSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number.parseInt(e.target.value);

    if (fanSpeedDebounceRef.current) clearTimeout(fanSpeedDebounceRef.current);

    queryClient.setQueryData(["fan-status"], (old: any) => {
      if (!old?.success) return old;
      return {
        ...old,
        response: {
          ...old.response,
          speed_level: newSpeed,
          mode: "manual",
        },
      };
    });

    fanSpeedDebounceRef.current = setTimeout(async () => {
      const { success, response } = await controlFan({
        speedLeveL: newSpeed.toString(),
        mode: "manual",
      });

      if (success) await refetchAll();
      else {
        toast.error(`Error setting fan speed: ${response}`);
        await refetchAll();
      }
    }, 500);
  };

  const toggleAutoMode = async () => {
    const newMode = isAutoMode ? "manual" : "auto";
    const { success, response } = await toggleFanMode(newMode);

    if (success) await refetchAll();
    else toast.error(`Error toggling mode: ${response}`);
  };

  const getFanSpeedLabel = () => {
    if (fanSpeed === 0) return "Off";
    if (fanSpeed <= 25) return "Low";
    if (fanSpeed <= 50) return "Medium";
    if (fanSpeed <= 75) return "High";
    return "Maximum";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Weather & Temperature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Current Temperature
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {temperature}°C
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
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Fan Speed Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-4">
                  <label className="text-sm font-medium text-foreground">
                    Speed Level
                  </label>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary">
                      {fanSpeed}%
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getFanSpeedLabel()}
                    </p>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fanSpeed}
                  onChange={handleFanSpeedChange}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                  disabled={isAutoMode}
                />
              </div>

              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded-full transition-colors duration-200 ${
                      i < Math.ceil((fanSpeed / 100) * 5)
                        ? "bg-primary"
                        : "bg-border"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Fan Status</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isActive ? "Running" : "Stopped"}
                  </p>
                </div>
                <span className="text-3xl">{isActive ? "🌀" : "⏸️"}</span>
              </div>
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
                  ? "Fan speed automatically adjusts based on temperature"
                  : "Control fan speed manually"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-border h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-foreground">
                <p className="text-lg">Fan Activity</p>
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
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        <p className="mt-1 text-foreground leading-relaxed">
                          {log.action} ({log.status})
                        </p>
                        {log.details && (
                          <p className="text-muted-foreground mt-0.5">
                            {log.details}
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
