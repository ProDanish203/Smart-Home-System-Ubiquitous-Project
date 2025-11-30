"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Square, Upload, X, SwitchCamera } from "lucide-react";
import { toast } from "sonner";

interface CameraFeedProps {
  onFrameCaptured?: (frame: ImageData) => void;
  onDetectionStart?: () => void;
  onDetectionStop?: () => void;
  turnOffFlashlight?: () => void;
  title?: string;
  buttonText?: string;
  stopButtonText?: string;
}

export default function CameraFeed({
  onFrameCaptured,
  onDetectionStart,
  onDetectionStop,
  turnOffFlashlight,
  title = "Camera Feed",
  buttonText = "Open Camera",
  stopButtonText = "Stop Camera",
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
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
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: facingMode,
          advanced: [{ torch: false } as any],
        },
      });
      turnOffFlashlight?.();

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
    turnOffFlashlight?.();

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);

    onDetectionStop?.();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFrameCaptured) return;

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setUploadedImageUrl(imageUrl);

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            onFrameCaptured(imageData);
          }
        };
        img.src = imageUrl;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing uploaded image:", error);
      toast.error("Failed to process the uploaded image. Please try again.");
    }

    e.target.value = "";
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImage = () => {
    setUploadedImageUrl(null);
    turnOffFlashlight?.();
  };

  const switchCamera = async () => {
    if (isStreaming) {
      const newMode = facingMode === "user" ? "environment" : "user";
      setFacingMode(newMode);
      stopCamera();
      turnOffFlashlight?.();
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: newMode,
              advanced: [{ torch: false } as any],
            },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
            if (onDetectionStart) onDetectionStart();
            startFrameCapture();
          }
        } catch (error) {
          console.error("Error switching camera:", error);
        }
      }, 100);
    }
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
          {uploadedImageUrl ? (
            <>
              <img
                src={uploadedImageUrl}
                alt="Uploaded for detection"
                className="w-full h-full min-h-[500px] object-contain"
              />
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full" />
                Uploaded Image
              </div>
              <Button
                onClick={clearUploadedImage}
                size="icon"
                variant="destructive"
                className="absolute top-4 left-4 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              {facingMode === "user" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full min-h-[500px] object-cover"
                  style={{
                    transform: "scaleX(-1)",
                  }}
                />
              ) : facingMode === "environment" ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full min-h-[500px] object-cover"
                />
              ) : null}

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
              {isStreaming && (
                <Button
                  onClick={switchCamera}
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-4 right-4 rounded-full"
                >
                  <SwitchCamera className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" width={1280} height={720} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex gap-3">
          {!isStreaming ? (
            <Button
              onClick={startCamera}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors duration-200 gap-2"
              disabled={uploadedImageUrl !== null}
            >
              <Camera className="w-4 h-4" />
              {buttonText}
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium transition-colors duration-200 gap-2"
              disabled={uploadedImageUrl !== null}
            >
              <Square className="w-4 h-4" />
              {stopButtonText}
            </Button>
          )}

          <Button
            onClick={triggerFileUpload}
            variant="outline"
            className="gap-2 font-medium"
            disabled={isStreaming}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </Button>
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
