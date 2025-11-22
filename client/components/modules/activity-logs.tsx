"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  status: "success" | "processing" | "error";
  details?: string;
  user?: string;
}

interface ActivityLogsProps {
  logs: ActivityLog[];
  title?: string;
  clearLogs?: () => void;
}

export default function ActivityLogs({
  logs,
  title = "Activity Logs",
  clearLogs,
}: ActivityLogsProps) {
  const getStatusIcon = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusBadgeClass = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <Card className="border-border bg-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5" />
            {title}
          </div>
          {clearLogs && (
            <Button
              size="sm"
              className="text-xs cursor-pointer"
              onClick={clearLogs}
            >
              Clear Logs
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="min-h-96">
          <div className="space-y-3 pr-4">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground text-sm">No logs yet</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 rounded-lg bg-muted border border-border hover:bg-muted/60 transition-colors"
                >
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-foreground font-medium text-sm truncate">
                        {log.action}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${getStatusBadgeClass(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-muted-foreground text-xs mb-1 truncate">
                        {log.details}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                      {log.user && (
                        <>
                          <span>•</span>
                          <User className="w-3 h-3" />
                          {log.user}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
