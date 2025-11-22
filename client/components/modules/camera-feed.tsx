"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square } from "lucide-react";

interface CameraFeedProps {
  onFramesCaptured?: (frames: ImageData[]) => void;
  title?: string;
  buttonText?: string;
  stopButtonText?: string;
}

export default function CameraFeed({
  onFramesCaptured,
  title = "Camera Feed",
  buttonText = "Open Camera",
  stopButtonText = "Stop Camera",
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const framesRef = useRef<ImageData[]>([]);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        startFrameCapture();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const startFrameCapture = () => {
    framesRef.current = [];
    setFrameCount(0);

    // Capture 60 frames over 1 minute (1 frame per second)
    let capturedFrames = 0;
    captureIntervalRef.current = setInterval(() => {
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const imageData = ctx.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          framesRef.current.push(imageData);
          setFrameCount(capturedFrames + 1);
          capturedFrames += 1;

          if (capturedFrames >= 60) {
            stopFrameCapture();
            onFramesCaptured?.(framesRef.current);
          }
        }
      }
    }, 1000);
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
    }
    setIsStreaming(false);
    setFrameCount(0);
  };

  return (
    <Card className="border-border bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-muted rounded-lg overflow-hidden aspect-video border border-border">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <p className="text-muted-foreground">Camera not active</p>
            </div>
          )}
          {isStreaming && frameCount > 0 && (
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
              {frameCount}/60
            </div>
          )}
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

        {/* Controls */}
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
              ? `Capturing frames... ${frameCount}/60 frames collected`
              : "Click to start capturing frames"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
