"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ActivityLogs, { type ActivityLog } from "./activity-logs";

export default function SmartFan() {
  const [temperature, setTemperature] = useState(22);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const temperatureDebounceRef = useRef<NodeJS.Timeout>(null);
  const fanSpeedDebounceRef = useRef<NodeJS.Timeout>(null);

  const addLog = (
    action: string,
    status: "success" | "processing" | "error" = "success",
    details?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) =>
      [
        { id: Date.now().toString(), timestamp, action, status, details },
        ...prev,
      ].slice(0, 50)
    );
  };

  useEffect(() => {
    if (isAutoMode) {
      if (temperature > 28) {
        setFanSpeed(100);
      } else if (temperature > 26) {
        setFanSpeed(75);
      } else if (temperature > 24) {
        setFanSpeed(50);
      } else if (temperature > 20) {
        setFanSpeed(25);
      } else {
        setFanSpeed(0);
      }
    }
  }, [temperature, isAutoMode]);

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = Number.parseInt(e.target.value);
    setTemperature(newTemp);

    // Clear previous timeout
    if (temperatureDebounceRef.current) {
      clearTimeout(temperatureDebounceRef.current);
    }

    // Set new timeout to log after user stops adjusting
    temperatureDebounceRef.current = setTimeout(() => {
      addLog(
        "Temperature adjusted",
        "success",
        `New temperature: ${newTemp}°C`
      );
    }, 500);
  };

  const handleFanSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = Number.parseInt(e.target.value);
    setFanSpeed(newSpeed);
    setIsAutoMode(false);

    // Clear previous timeout
    if (fanSpeedDebounceRef.current) {
      clearTimeout(fanSpeedDebounceRef.current);
    }

    // Set new timeout to log after user stops adjusting
    fanSpeedDebounceRef.current = setTimeout(() => {
      addLog("Fan speed set", "success", `Manual mode: ${newSpeed}%`);
    }, 500);
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    addLog(isAutoMode ? "Auto mode disabled" : "Auto mode enabled", "success");
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (temperatureDebounceRef.current) {
        clearTimeout(temperatureDebounceRef.current);
      }
      if (fanSpeedDebounceRef.current) {
        clearTimeout(fanSpeedDebounceRef.current);
      }
    };
  }, []);

  const getFanSpeedLabel = () => {
    if (fanSpeed === 0) return "Off";
    if (fanSpeed <= 25) return "Low";
    if (fanSpeed <= 50) return "Medium";
    if (fanSpeed <= 75) return "High";
    return "Maximum";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-lg">Temperature Sensor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-end justify-between mb-4">
                <label className="text-sm font-medium text-foreground">
                  Current Temperature
                </label>
                <span className="text-3xl font-bold text-primary">
                  {temperature}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="35"
                value={temperature}
                onChange={handleTemperatureChange}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>15°C</span>
                <span>35°C</span>
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

      <div className="lg:col-span-1">
        <ActivityLogs
          logs={logs}
          title="Fan Activity"
          clearLogs={() => setLogs([])}
        />
      </div>
    </div>
  );
}
