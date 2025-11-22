"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CameraFeed from "./camera-feed";
import { type ActivityLog } from "./activity-logs";

export default function SmartLights() {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [brightness, setBrightness] = useState(80);
  const [currentTime, setCurrentTime] = useState("14:30");
  const [personPresent, setPersonPresent] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const brightnessDebounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleFramesCaptured = () => {
    addLog("Presence analysis complete", "success", "60 frames processed");
    setTimeout(() => {
      setPersonPresent(true);
      addLog("Person detected", "success", "Room status updated");
    }, 1000);
  };

  useEffect(() => {
    if (isAutoMode) {
      const [hours] = currentTime.split(":").map(Number);
      const isDayTime = hours >= 6 && hours < 18;

      if (personPresent) {
        if (!lightsOn) {
          setLightsOn(true);
          addLog(
            "Lights activated",
            "success",
            isDayTime ? "Day mode" : "Night mode"
          );
        }
      } else {
        if (lightsOn) {
          setLightsOn(false);
          addLog("Lights deactivated", "success", "No person detected");
        }
      }
    }
  }, [personPresent, isAutoMode, currentTime, lightsOn]);

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBrightness = Number.parseInt(e.target.value);
    setBrightness(newBrightness);
    setIsAutoMode(false);

    if (brightnessDebounceRef.current) {
      clearTimeout(brightnessDebounceRef.current);
    }

    brightnessDebounceRef.current = setTimeout(() => {
      addLog(
        "Brightness adjusted",
        "success",
        `Manual mode: ${newBrightness}%`
      );
    }, 500);
  };

  const toggleLights = () => {
    setLightsOn(!lightsOn);
    setIsAutoMode(false);
    addLog(
      lightsOn ? "Lights turned off" : "Lights turned on",
      "success",
      "Manual control"
    );
  };

  const togglePersonPresence = () => {
    setPersonPresent(!personPresent);
    addLog(
      personPresent ? "Room empty" : "Person detected",
      "success",
      "Simulated status"
    );
  };

  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode);
    addLog(isAutoMode ? "Auto mode disabled" : "Auto mode enabled", "success");
  };

  useEffect(() => {
    return () => {
      if (brightnessDebounceRef.current) {
        clearTimeout(brightnessDebounceRef.current);
      }
    };
  }, []);

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
                  onClick={() => setLogs([])}
                >
                  Clear Logs
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-64">
              <div className="space-y-2">
                {logs.slice(0, 5).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No activity yet
                  </p>
                ) : (
                  logs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="text-xs pb-2 border-b border-border last:border-0"
                    >
                      <p className="font-mono text-muted-foreground">
                        {log.timestamp}
                      </p>
                      <p className="mt-1 text-foreground leading-relaxed">
                        {log.action}
                      </p>
                    </div>
                  ))
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
              <Button
                onClick={togglePersonPresence}
                variant="outline"
                className="w-full border-border hover:bg-muted text-foreground font-medium transition-colors duration-200 bg-white"
              >
                Simulate {personPresent ? "Room Empty" : "Person Present"}
              </Button>
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
