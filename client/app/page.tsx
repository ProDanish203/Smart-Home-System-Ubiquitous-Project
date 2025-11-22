"use client";
import Link from "next/link";
import { MODULES } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main
      className="min-h-screen w-full bg-background bg-cover bg-center"
      style={{
        backgroundImage: "url(/home-banner.jpg)",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center mb-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Smart Home Control
          </h1>
          <p className="text-lg text-white">
            Manage your home automation systems from one unified interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {MODULES.map((module) => (
            <Link key={module.id} href={`/module/${module.value}`}>
              <Card className="h-72 cursor-pointer transition-all duration-200 hover:shadow-lg border-border hover:border-primary/40 bg-card group">
                <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200">
                    {module.icon}
                  </div>

                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {module.label}
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>

                  <div className="mt-6 h-1 w-12 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-white">
            Select a module to begin controlling your smart home
          </p>
        </div>
      </div>
    </main>
  );
}
