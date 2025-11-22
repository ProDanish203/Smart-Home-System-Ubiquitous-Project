"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CameraFeed from "./camera-feed";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearLightActivityLogs,
  controlLight,
  getLightActivityLogs,
  getLightStatus,
  toggleLightMode,
} from "@/API/light";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import {
  GetLightLogsApiResponse,
  GetLightStatusApiResponse,
} from "@/API/api-response";

export default function SmartLights() {
  const [currentTime, setCurrentTime] = useState("14:30");
  const queryClient = useQueryClient();
  const brightnessDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ["light-status"],
    queryFn: getLightStatus,
    refetchInterval: 10000,
  });

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["light-logs"],
    queryFn: getLightActivityLogs,
    refetchInterval: 10000,
  });

  const lightStatus: GetLightStatusApiResponse | null = statusData?.success
    ? statusData.response
    : null;
  const isAutoMode = lightStatus?.mode === "auto" ? true : false;
  const brightness = lightStatus?.brightness ?? 80;
  const personPresent = lightStatus?.presence_detected ?? false;
  const lightsOn = lightStatus?.is_on ?? true;

  const logs: GetLightLogsApiResponse[] =
    logsData?.success && Array.isArray(logsData.response)
      ? logsData.response
      : [];

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["light-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["light-status"] }),
    ]);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (brightnessDebounceRef.current)
        clearTimeout(brightnessDebounceRef.current);
    };
  }, []);

  const handleClearLogs = async () => {
    const { success, response } = await clearLightActivityLogs();
    if (success) {
      await refetchAll();
      toast.success("Logs cleared successfully");
    } else toast.error(`Error clearing logs: ${response}`);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBrightness = Number.parseInt(e.target.value);

    if (brightnessDebounceRef.current) {
      clearTimeout(brightnessDebounceRef.current);
    }

    queryClient.setQueryData(["light-status"], (old: any) => {
      if (!old?.success) return old;
      return {
        ...old,
        response: {
          ...old.response,
          brightness: newBrightness,
          mode: "manual",
        },
      };
    });

    brightnessDebounceRef.current = setTimeout(async () => {
      const { success, response } = await controlLight({
        is_on: lightsOn,
        brightness: newBrightness,
        mode: "manual",
      });

      if (success) await refetchAll();
      else {
        toast.error(`Error setting brightness: ${response}`);
        await refetchAll();
      }
    }, 500);
  };

  const toggleLights = async () => {
    const { success, response } = await controlLight({
      is_on: !lightsOn,
      brightness,
      mode: "manual",
    });

    if (success) await refetchAll();
    else toast.error(`Error toggling lights: ${response}`);
  };

  const toggleAutoMode = async () => {
    const newMode = isAutoMode ? "manual" : "auto";
    const { success, response } = await toggleLightMode(newMode);

    if (success) await refetchAll();
    else toast.error(`Error toggling mode: ${response}`);
  };

  const handleFramesCaptured = () => {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CameraFeed
            onFramesCaptured={handleFramesCaptured}
            title="Presence Detection Camera"
            buttonText="Start Detection"
            stopButtonText="Stop Detection"
          />
        </div>

        <div>
          <Card className="bg-white border-border h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-foreground">
                <p className="text-lg">Recent Activity</p>
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
                        <p className="mt-1 text-foreground leading-relaxed">
                          {log.action} - Brightness: {log.brightness}% (
                          {log.reason})
                        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Current Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-primary font-mono">
                  {currentTime}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Live time-based automation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Presence Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {personPresent ? "👤" : "🚫"}
                  </span>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Room Status
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {personPresent ? "Person detected" : "Empty"}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    personPresent ? "bg-emerald-500" : "bg-gray-400"
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Light Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Main Lights</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lightsOn ? "On" : "Off"}
                  </p>
                </div>
                <span className="text-3xl">{lightsOn ? "💡" : "🌑"}</span>
              </div>

              <div>
                <div className="flex items-end justify-between mb-3">
                  <label className="text-sm font-medium text-foreground">
                    Brightness
                  </label>
                  <span className="text-lg font-semibold text-primary">
                    {brightness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={handleBrightnessChange}
                  disabled={!lightsOn}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
                />
              </div>

              <Button
                onClick={toggleLights}
                className={`w-full font-medium transition-colors duration-200 ${
                  lightsOn
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {lightsOn ? "Turn Off Lights" : "Turn On Lights"}
              </Button>
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
                  ? "Lights automatically control based on time and presence"
                  : "Manually control lights"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
