"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Zap,
  LayoutGrid,
} from "lucide-react";

export default function PlaygroundPortal() {
  const variations = [
    {
      title: "Gantt Scheduler",
      description:
        "Industrial-grade resource scheduling with reactive drag & drop. Orchestrate workforce in real-time.",
      icon: Zap,
      href: "/playground/dispatch",
      color: "bg-amber-500",
      stats: "Dynamic Routing • Auto-Laning",
    },
    {
      title: "Calendar View",
      description:
        "Standard month, week, and day views for any application. Supports events, dragging, and quick creation.",
      icon: Calendar,
      href: "/playground/calendar",
      color: "bg-blue-500",
      stats: "Responsive Grid • i18n Ready",
    },
    {
      title: "Resource View",
      description:
        "Track equipment, rooms, and personnel allocation across a timeline. Prevent over-scheduling easily.",
      icon: Users,
      href: "/playground/resource",
      color: "bg-emerald-500",
      stats: "Conflict Detection • Capacity View",
    },
    {
      title: "Timeline Chart",
      description:
        "A compact linear visualization of events. Perfect for simple coordination and task sequences.",
      icon: Clock,
      href: "/playground/timeline",
      color: "bg-purple-500",
      stats: "Compact Rows • High Density",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar
        title="Playground"
        subtitle="Explore all production-ready scheduling variants"
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="mb-12 text-center md:text-left">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold tracking-tight">
            COMPONENT INTERACTIVE GALLERY
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 text-balance uppercase">
            Scheduling <span className="text-blue-500">Playground</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            Test and interact with our pre-built scheduling components. Each
            variant is optimized for specific industrial and commercial use
            cases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {variations.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <Link href={item.href}>
                  <Card className="h-full border-border/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden cursor-pointer relative bg-card">
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none -mr-8 -mt-8 rounded-full ${item.color}`}
                    />
                    <CardHeader className="pb-4">
                      <div
                        className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-${item.color.split("-")[1]}-500/20 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-black tracking-tight italic uppercase">
                          {item.title}
                        </CardTitle>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardDescription className="text-base font-medium leading-relaxed mt-2 text-muted-foreground">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          {item.stats}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold uppercase tracking-widest"
                        >
                          Demo Available
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-20 p-12 rounded-3xl bg-muted/30 border border-border/50 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <LayoutGrid className="h-10 w-10 text-muted-foreground mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-3 tracking-tight italic uppercase">
            Need a custom implementation?
          </h2>
          <p className="text-muted-foreground max-w-md text-base mb-8 font-medium">
            Our library is fully composable. You can mix and match these views
            or extend them to build your unique scheduling interface.
          </p>
          <Link href="/docs">
            <Button
              variant="outline"
              className="rounded-full px-8 bg-transparent"
            >
              View Architecture Docs
            </Button>
          </Link>
        </div>
      </div>

      <footer className="border-t border-border/50 py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
          <p>© 2024 CALENDAR SYSTEM • PRAGMATIC ENGINE</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
