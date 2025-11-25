"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square } from "lucide-react";

interface CameraFeedProps {
  onFrameCaptured?: (frame: ImageData) => void;
  onDetectionStart?: () => void;
  onDetectionStop?: () => void;
  title?: string;
  buttonText?: string;
  stopButtonText?: string;
}

export default function CameraFeed({
  onFrameCaptured,
  onDetectionStart,
  onDetectionStop,
  title = "Camera Feed",
  buttonText = "Open Camera",
  stopButtonText = "Stop Camera",
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback(() => {
    if (canvasRef.current && videoRef.current && onFrameCaptured) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        onFrameCaptured(imageData);
      }
    }
  }, [onFrameCaptured]);

  const startCamera = async () => {
    try {
      setPermissionDenied(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        if (onDetectionStart) onDetectionStart();
        startFrameCapture();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setPermissionDenied(true);

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          alert(
            "Camera permission denied. Please allow camera access in your browser settings and try again."
          );
        } else if (error.name === "NotFoundError") {
          alert("No camera found on this device.");
        } else {
          alert(
            "Unable to access camera. Please check permissions and try again."
          );
        }
      }
    }
  };

  const startFrameCapture = () => {
    captureIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 3000);
  };

  const stopFrameCapture = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const stopCamera = () => {
    stopFrameCapture();

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);

    onDetectionStop?.();
  };

  return (
    <Card className="border-border bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-sm:px-2">
        <div className="relative bg-muted rounded-lg overflow-hidden border border-border max-h-[500px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full min-h-[500px] object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <p className="text-muted-foreground">
                {permissionDenied
                  ? "Camera permission denied"
                  : "Camera not active"}
              </p>
            </div>
          )}
          {isStreaming && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

        <div className="flex gap-3">
          {!isStreaming ? (
            <Button
              onClick={startCamera}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200 gap-2"
            >
              <Camera className="w-4 h-4" />
              {buttonText}
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 gap-2"
            >
              <Square className="w-4 h-4" />
              {stopButtonText}
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <p className="text-muted-foreground text-sm">
            {isStreaming
              ? "🎥 Capturing and analyzing frames every second..."
              : permissionDenied
              ? "❌ Please grant camera permission to start detection"
              : "Click to start camera and begin detection"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
