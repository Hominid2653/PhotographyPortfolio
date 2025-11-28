"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Image,
  Upload,
  Eye,
  EyeOff,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Images,
  Camera,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getAllPhotosClient } from "@/lib/photos-client";
import type { PhotoWithUrl } from "@/lib/photos";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadPhotos();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const allPhotos = await getAllPhotosClient();
      setPhotos(allPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: photos.length,
    visible: photos.filter((p) => p.is_visible).length,
    featured: photos.filter((p) => p.is_featured).length,
    hidden: photos.filter((p) => !p.is_visible).length,
  };

  // Format stats for display
  const statsCards = [
    {
      title: "Total Photos",
      value: stats.total,
      change: `${stats.visible} visible`,
      trend: "info" as const,
      icon: Image,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Visible Photos",
      value: stats.visible,
      change: `${stats.hidden} hidden`,
      trend: stats.visible > stats.hidden ? ("up" as const) : ("down" as const),
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Featured Photos",
      value: stats.featured,
      change: `${stats.total - stats.featured} regular`,
      trend: "info" as const,
      icon: Star,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Hidden Photos",
      value: stats.hidden,
      change: `${stats.visible} visible`,
      trend: stats.hidden > 0 ? ("down" as const) : ("up" as const),
      icon: EyeOff,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  // Get recent photos (last 5)
  const recentPhotos = photos.slice(0, 5);

  // Mock activities (can be replaced with real activity log later)
  const recentActivities = [
    {
      user: "System",
      action: "New photo uploaded",
      photo: recentPhotos[0]?.title || recentPhotos[0]?.file_name || "Photo",
      time: recentPhotos[0]?.created_at
        ? new Date(recentPhotos[0].created_at).toLocaleDateString()
        : "Recently",
      type: "success" as const,
    },
    {
      user: "Admin",
      action: "Photo updated",
      photo: recentPhotos[1]?.title || recentPhotos[1]?.file_name || "Photo",
      time: recentPhotos[1]?.created_at
        ? new Date(recentPhotos[1].created_at).toLocaleDateString()
        : "Recently",
      type: "info" as const,
    },
    {
      user: "Admin",
      action: "Photo featured",
      photo: recentPhotos[2]?.title || recentPhotos[2]?.file_name || "Photo",
      time: recentPhotos[2]?.created_at
        ? new Date(recentPhotos[2].created_at).toLocaleDateString()
        : "1 hour ago",
      type: "success" as const,
    },
    {
      user: "System",
      action: "Photo visibility changed",
      photo: recentPhotos[3]?.title || recentPhotos[3]?.file_name || "Photo",
      time: recentPhotos[3]?.created_at
        ? new Date(recentPhotos[3].created_at).toLocaleDateString()
        : "2 hours ago",
      type: "info" as const,
    },
  ];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <SidebarInset className="md:ml-[16rem]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage your photography portfolio and upload photos for Kabarak
                University Graduation Class of 2025.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {loading
                ? // Loading skeletons
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card
                      key={index}
                      className="border-0 bg-gradient-to-br from-background to-muted/20"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="w-10 h-10 rounded-lg" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                : statsCards.map((stat, index) => (
                    <Card
                      key={index}
                      className="border-0 bg-gradient-to-br from-background to-muted/20"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <div
                          className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">
                          {stat.value}
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-1">
                          {stat.trend === "up" ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : stat.trend === "down" ? (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          ) : null}
                          <span
                            className={
                              stat.trend === "up"
                                ? "text-green-600"
                                : stat.trend === "down"
                                ? "text-red-600"
                                : "text-muted-foreground"
                            }
                          >
                            {stat.change}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Activity */}
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-0">
                    {recentActivities.map((activity, index) => (
                      <li key={index}>
                        <div className="flex items-start gap-3 py-4">
                          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-primary">
                              <span className="font-semibold">
                                {activity.user}
                              </span>{" "}
                              {activity.action}{" "}
                              <span className="font-semibold">
                                {activity.photo}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.time}
                            </p>
                          </div>
                          <Badge
                            variant={
                              activity.type === "success"
                                ? "default"
                                : "outline"
                            }
                            className="ml-auto flex-shrink-0"
                          >
                            {activity.type}
                          </Badge>
                        </div>
                        {index < recentActivities.length - 1 && (
                          <Separator className="my-0" />
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recent Photos */}
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Recent Photos</CardTitle>
                    <Link
                      href="/protected/admin/photos"
                      className="text-sm text-primary hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <ul className="space-y-0">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <li key={index}>
                          <div className="flex items-center justify-between py-4">
                            <div className="flex-1">
                              <Skeleton className="h-5 w-48 mb-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20 flex-shrink-0" />
                          </div>
                          {index < 3 && <Separator className="my-0" />}
                        </li>
                      ))}
                    </ul>
                  ) : recentPhotos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No photos yet</p>
                      <Link
                        href="/protected/admin/upload"
                        className="text-primary hover:underline mt-2 inline-block"
                      >
                        Upload your first photo
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-0">
                      {recentPhotos.map((photo, index) => (
                        <li key={photo.id}>
                          <Link
                            href="/protected/admin/photos"
                            className="flex items-center justify-between py-4 hover:bg-accent/5 px-2 rounded transition-colors -mx-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-primary">
                                {photo.title || photo.file_name}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Uploaded:{" "}
                                {photo.created_at
                                  ? new Date(
                                      photo.created_at
                                    ).toLocaleDateString()
                                  : "Recently"}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <Badge
                                variant={
                                  photo.is_visible
                                    ? "default"
                                    : photo.is_featured
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {photo.is_featured
                                  ? "Featured"
                                  : photo.is_visible
                                  ? "Visible"
                                  : "Hidden"}
                              </Badge>
                            </div>
                          </Link>
                          {index < recentPhotos.length - 1 && (
                            <Separator className="my-0" />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: "Upload Photos",
                      href: "/protected/admin/upload",
                      icon: Upload,
                    },
                    {
                      title: "Manage Photos",
                      href: "/protected/admin/photos",
                      icon: Images,
                    },
                    {
                      title: "View Portfolio",
                      href: "/portfolio",
                      icon: Camera,
                    },
                  ].map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex items-center gap-3 p-4 rounded-lg border bg-white hover:bg-accent/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent transition-colors">
                        <action.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-medium text-primary">
                        {action.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
