import Link from "next/link";
import { MODULES } from "@/lib/data";
import SmartDoorLock from "@/components/modules/smart-door-lock";
import SmartFan from "@/components/modules/smart-fan";
import SmartLights from "@/components/modules/smart-lights";
import SmartWindows from "@/components/modules/smart-window";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return MODULES.map(({ value }) => ({
    slug: value,
  }));
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;

  const module = MODULES.find((m) => m.value === slug);

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Module not found
          </h1>
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const renderModule = () => {
    switch (slug) {
      case "door-lock":
        return <SmartDoorLock />;
      case "smart-fan":
        return <SmartFan />;
      case "smart-lights":
        return <SmartLights />;
      case "smart-windows":
        return <SmartWindows />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="sm:text-3xl text-2xl">{module.icon}</span>
            <div>
              <h1 className="sm:text-2xl text-xl font-bold text-foreground">
                {module.label}
              </h1>
              <p className="text-sm text-muted-foreground max-md:hidden">
                {module.description}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors duration-200 flex items-center justify-between gap-2"
          >
            <ChevronLeft className="size-5 inline-block" />
            <span className="max-md:hidden">Back</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderModule()}
      </div>
    </main>
  );
}
