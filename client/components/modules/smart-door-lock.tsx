"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CameraFeed from "./camera-feed";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerFaceForDoor,
  manualDoorUnlock,
  getDoorLogs,
  clearDoorLogs,
  getRegisteredFaces,
  deleteRegisteredFace,
} from "@/API/door";
import { toast } from "sonner";
import { LoaderIcon, Upload, Trash2, User, CheckCircle } from "lucide-react";
import {
  GetDoorLogsApiResponse,
  GetRegisteredFacesResponse,
} from "@/API/api-response";

export default function SmartDoorLock() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [personName, setPersonName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ["door-logs"],
    queryFn: getDoorLogs,
    refetchInterval: 10000,
  });

  const { data: facesData, isLoading: isFacesLoading } = useQuery({
    queryKey: ["registered-faces"],
    queryFn: getRegisteredFaces,
    refetchInterval: 10000,
  });

  const logs: GetDoorLogsApiResponse[] =
    logsData?.success && Array.isArray(logsData.response)
      ? logsData.response
      : [];

  const registeredFaces: GetRegisteredFacesResponse[] =
    facesData?.success && Array.isArray(facesData.response)
      ? facesData.response
      : [];

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["door-logs"] }),
      queryClient.invalidateQueries({ queryKey: ["registered-faces"] }),
    ]);
  };

  const handleClearLogs = async () => {
    const { success, response } = await clearDoorLogs();
    if (success) {
      await refetchAll();
      toast.success("Logs cleared successfully");
    } else toast.error(`Error clearing logs: ${response}`);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterFace = async () => {
    if (!selectedImage || !personName.trim())
      return toast.error("Please provide both name and image");

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    const { success, response } = await registerFaceForDoor(
      personName.trim(),
      formData
    );

    if (success) {
      toast.success(`Face registered for ${personName}`);
      setPersonName("");
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetchAll();
    } else toast.error(`Failed to register face: ${response}`);

    setIsProcessing(false);
  };

  const handleDeleteFace = async (id: number, name: string) => {
    const { success, response } = await deleteRegisteredFace(id);

    if (success) {
      toast.success(`Removed ${name} from registered faces`);
      await refetchAll();
    } else {
      toast.error(`Failed to remove face: ${response}`);
    }
  };

  const handleManualUnlock = async () => {
    setIsProcessing(true);
    const { success, response } = await manualDoorUnlock("Manual Override");

    if (success) {
      toast.success("Door unlocked successfully");
      await refetchAll();
    } else {
      toast.error(`Failed to unlock door: ${response}`);
    }

    setIsProcessing(false);
  };

  const handleFramesCaptured = () => {
    toast.info("Face verification will be integrated soon");
  };

  const hasRegisteredFaces = registeredFaces.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {hasRegisteredFaces && (
            <CameraFeed
              onFramesCaptured={handleFramesCaptured}
              title="Door Entry Camera"
              buttonText="Start Verification"
              stopButtonText="Stop Verification"
            />
          )}

          {!hasRegisteredFaces && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  No Registered Faces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800">
                  Please register at least one face to enable the door entry
                  camera and verification system.
                </p>
              </CardContent>
            </Card>
          )}
          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Register New Face</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="person-name" className="text-sm font-medium">
                  Person Name
                </Label>
                <Input
                  id="person-name"
                  placeholder="Enter person's name"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="face-image" className="text-sm font-medium">
                  Face Image
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    ref={fileInputRef}
                    id="face-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <Button
                onClick={handleRegisterFace}
                disabled={isProcessing || !selectedImage || !personName.trim()}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Face"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Registered Faces</CardTitle>
            </CardHeader>
            <CardContent>
              {isFacesLoading ? (
                <div className="flex justify-center py-8">
                  <LoaderIcon className="animate-spin size-6" />
                </div>
              ) : registeredFaces.length > 0 ? (
                <div className="space-y-2">
                  {registeredFaces.map((face) => (
                    <div
                      key={face.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {face.person_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Registered:{" "}
                            {new Date(face.registered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteFace(face.id, face.person_name)
                        }
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No registered faces yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-border">
            <CardHeader>
              <CardTitle className="text-lg">Manual Override</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleManualUnlock}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  "Manual Unlock"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-white border-border max-h-[650px] h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between gap-2 text-foreground">
                <p className="text-lg">Door Lock Logs</p>
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
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-mono text-muted-foreground">
                            {log.timestamp}
                          </p>
                          {log.success ? (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <span className="text-red-600 text-xs">✕</span>
                          )}
                        </div>
                        <p className="mt-1 text-foreground leading-relaxed">
                          {log.action}
                        </p>
                        {log.person_name && (
                          <p className="text-muted-foreground mt-0.5">
                            Person: {log.person_name}
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
