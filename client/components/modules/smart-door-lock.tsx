"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CameraFeed from "./camera-feed";
import ActivityLogs, { type ActivityLog } from "./activity-logs";

export default function SmartDoorLock() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const addLog = (
    action: string,
    status: "success" | "processing" | "error" = "success",
    details?: string,
    user?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) =>
      [
        { id: Date.now().toString(), timestamp, action, status, details, user },
        ...prev,
      ].slice(0, 50)
    );
  };

  const handleFramesCaptured = async () => {
    setIsProcessing(true);
    addLog("Frame capture completed", "success", "60 frames collected");

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog("Analyzing frames", "processing", "Running AI model");

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog(
      "Face detection",
      "success",
      "Person identified as John Doe",
      "John Doe"
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    addLog("Biometric verification", "success", "Match confidence 99.2%");

    await new Promise((resolve) => setTimeout(resolve, 1200));
    addLog("Security check", "success", "No threats detected");

    await new Promise((resolve) => setTimeout(resolve, 800));
    addLog("Door unlock signal", "processing", "Sending to lock");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    addLog(
      "Door unlocked",
      "success",
      "Status: Successfully unlocked at 2:34 PM",
      "System"
    );

    setIsProcessing(false);
  };

  const manualUnlock = async () => {
    setIsProcessing(true);
    addLog("Manual unlock initiated", "processing");

    await new Promise((resolve) => setTimeout(resolve, 1500));
    addLog("Authorization verified", "success");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    addLog("Door successfully unlocked", "success", "Status: Unlocked");

    setIsProcessing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <CameraFeed
          onFramesCaptured={handleFramesCaptured}
          title="Door Entry Camera"
          buttonText="Start Verification"
        />

        <Card className="border-border bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Manual Override</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={manualUnlock}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Manual Unlock"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <ActivityLogs
          logs={logs}
          title="Door Lock Logs"
          clearLogs={() => setLogs([])}
        />
      </div>
    </div>
  );
}
