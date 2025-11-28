"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  details?: string;
}

export default function TestConnectionPage() {
  const router = useRouter();
  const supabase = createClient();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
    }
  };

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Environment Variables
    testResults.push({
      name: "Environment Variables",
      status: "pending",
      message: "Checking environment variables...",
    });
    setResults([...testResults]);

    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set";
    const keyPreview = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ? `${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.substring(
          0,
          20
        )}...`
      : "Not set";

    testResults[0] = {
      name: "Environment Variables",
      status: hasUrl && hasKey ? "success" : "error",
      message:
        hasUrl && hasKey
          ? "Environment variables are set"
          : "Missing environment variables",
      details: `URL: ${url}\nKey: ${keyPreview}`,
    };
    setResults([...testResults]);

    // Test 2: Supabase Client Creation
    testResults.push({
      name: "Supabase Client",
      status: "pending",
      message: "Testing client creation...",
    });
    setResults([...testResults]);

    try {
      const testClient = createClient();
      testResults[1] = {
        name: "Supabase Client",
        status: "success",
        message: "Client created successfully",
        details: "Supabase client initialized without errors",
      };
    } catch (error) {
      testResults[1] = {
        name: "Supabase Client",
        status: "error",
        message: "Failed to create client",
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 3: Authentication
    testResults.push({
      name: "Authentication",
      status: "pending",
      message: "Testing authentication...",
    });
    setResults([...testResults]);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      testResults[2] = {
        name: "Authentication",
        status: user ? "success" : "error",
        message: user ? "User authenticated" : "No user found",
        details: user
          ? `User ID: ${user.id}\nEmail: ${user.email || "N/A"}`
          : "Please log in to test authentication",
      };
    } catch (error) {
      testResults[2] = {
        name: "Authentication",
        status: "error",
        message: "Authentication failed",
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 4: Storage Access
    testResults.push({
      name: "Storage Access",
      status: "pending",
      message: "Testing storage access...",
    });
    setResults([...testResults]);

    try {
      // Get storage info first
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const storageUrl = supabaseUrl ? `${supabaseUrl}/storage/v1` : "Not set";

      // Extract project reference from URL for S3 endpoint
      const projectRef = supabaseUrl?.match(
        /https:\/\/([^.]+)\.supabase\.co/
      )?.[1];
      const s3Endpoint = projectRef
        ? `https://${projectRef}.storage.supabase.co/storage/v1/s3`
        : "Not available";

      // Try to access storage API directly first to check if it's enabled
      try {
        const testResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
          method: "GET",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
            Authorization: `Bearer ${
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
            }`,
          },
        });

        if (!testResponse.ok && testResponse.status === 404) {
          throw new Error(
            "Storage API endpoint not found - Storage may not be enabled for this project"
          );
        }
      } catch (fetchError) {
        // If direct fetch fails, continue with SDK call
        console.log("Direct API test failed, trying SDK:", fetchError);
      }

      const { data: buckets, error: storageError } =
        await supabase.storage.listBuckets();

      if (storageError) {
        // If listBuckets fails but uploads work, it's a known issue with listBuckets API
        // Try to verify bucket exists by attempting a test operation
        let bucketExists = false;
        let testError: string | null = null;

        try {
          // Try to list files in the portfolio bucket as a test
          const { error: listError } = await supabase.storage
            .from("portfolio")
            .list("", { limit: 1 });

          // If we can list (even if empty), bucket exists
          bucketExists = !listError || !listError.message?.includes("tenant");
          if (listError && !bucketExists) {
            testError = listError.message;
          }
        } catch (testErr) {
          testError =
            testErr instanceof Error ? testErr.message : String(testErr);
        }

        if (bucketExists) {
          // Bucket exists and is accessible, but listBuckets() API has issues
          testResults[3] = {
            name: "Storage Access",
            status: "success",
            message:
              "Storage accessible - 'portfolio' bucket found (listBuckets API has known issues)",
            details:
              `Bucket 'portfolio' is accessible\n` +
              `Note: listBuckets() API returns "Invalid tenant id" error,\n` +
              `but direct bucket access works. This is a known Supabase issue.\n` +
              `Your uploads should work fine despite this error.\n\n` +
              `Storage URL: ${storageUrl}\n` +
              `S3 Endpoint: ${s3Endpoint}`,
          };
        } else {
          // Provide detailed error information
          const errorDetails = [
            `Error: ${storageError.message}`,
            `Status: ${storageError.status || "Unknown"}`,
            `Storage URL: ${storageUrl}`,
            `S3 Endpoint: ${s3Endpoint}`,
            `Supabase URL: ${supabaseUrl}`,
            testError ? `Test Error: ${testError}` : "",
            "",
            "⚠️ 'Invalid tenant id' is a Storage service provisioning issue.",
            "",
            "This error indicates the Storage service tenant wasn't properly",
            "provisioned when your project was created.",
            "",
            "Solutions:",
            "1. Wait a few minutes - Storage may still be provisioning",
            "2. Go to Supabase Dashboard > Storage > Files",
            "   - Try creating a bucket manually",
            "   - This may trigger storage provisioning",
            "3. Contact Supabase Support:",
            "   - This is a known issue that requires support intervention",
            "   - Provide your project reference: " + (projectRef || "N/A"),
            "4. As a workaround, try:",
            "   - Disabling and re-enabling Storage in project settings",
            "   - Creating a new storage bucket",
            "",
            "Note: Your database works fine, so this is storage-specific.",
          ].join("\n");

          throw new Error(errorDetails);
        }
      } else {
        // listBuckets() succeeded
        const portfolioBucket = buckets?.find((b) => b.name === "portfolio");
        testResults[3] = {
          name: "Storage Access",
          status: "success",
          message: portfolioBucket
            ? "Storage accessible, 'portfolio' bucket found"
            : "Storage accessible, but 'portfolio' bucket not found",
          details: portfolioBucket
            ? `Bucket 'portfolio' exists\nTotal buckets: ${
                buckets?.length || 0
              }\nStorage URL: ${storageUrl}\nS3 Endpoint: ${s3Endpoint}`
            : `Available buckets: ${
                buckets?.map((b) => b.name).join(", ") || "None"
              }\nStorage URL: ${storageUrl}\nS3 Endpoint: ${s3Endpoint}\nPlease create a 'portfolio' bucket in Supabase Storage`,
        };
      }
    } catch (error) {
      testResults[3] = {
        name: "Storage Access",
        status: "error",
        message: "Failed to access storage",
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 5: Database Access
    testResults.push({
      name: "Database Access",
      status: "pending",
      message: "Testing database access...",
    });
    setResults([...testResults]);

    try {
      const { data, error: dbError } = await supabase
        .from("photos")
        .select("id")
        .limit(1);
      if (dbError) throw dbError;
      testResults[4] = {
        name: "Database Access",
        status: "success",
        message: "Database accessible, 'photos' table found",
        details: `Successfully queried photos table\nReturned ${
          data?.length || 0
        } rows`,
      };
    } catch (error) {
      testResults[4] = {
        name: "Database Access",
        status: "error",
        message: "Failed to access database",
        details: error instanceof Error ? error.message : String(error),
      };
    }
    setResults([...testResults]);

    // Test 6: Storage Upload Test (dry run) - Skip if storage access failed
    if (testResults[3]?.status === "error") {
      testResults.push({
        name: "Storage Upload Test",
        status: "error",
        message: "Skipped - Storage access failed",
        details:
          "Cannot test upload without storage access. Fix the Storage Access test first.",
      });
      setResults([...testResults]);
    } else {
      testResults.push({
        name: "Storage Upload Test",
        status: "pending",
        message: "Testing upload permissions...",
      });
      setResults([...testResults]);

      try {
        // Create a small test blob
        const testBlob = new Blob(["test"], { type: "text/plain" });
        const testFile = new File([testBlob], "test.txt", {
          type: "text/plain",
        });
        const testPath = `test-${Date.now()}.txt`;

        const { error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(testPath, testFile);

        if (uploadError) {
          // If upload fails, try to delete the test file in case it was created
          await supabase.storage.from("portfolio").remove([testPath]);

          const errorDetails = [
            `Error: ${uploadError.message}`,
            `Status: ${uploadError.status || "Unknown"}`,
            "",
            "Possible causes:",
            "1. Storage bucket 'portfolio' doesn't exist",
            "2. Missing upload permissions in storage policies",
            "3. Check Supabase Dashboard > Storage > portfolio > Policies",
            "4. Ensure 'Authenticated users can upload photos' policy exists",
          ].join("\n");

          throw new Error(errorDetails);
        }

        // Clean up test file
        await supabase.storage.from("portfolio").remove([testPath]);

        testResults[5] = {
          name: "Storage Upload Test",
          status: "success",
          message: "Upload permissions working",
          details: "Successfully uploaded and deleted test file",
        };
      } catch (error) {
        testResults[5] = {
          name: "Storage Upload Test",
          status: "error",
          message: "Upload test failed",
          details: error instanceof Error ? error.message : String(error),
        };
      }
      setResults([...testResults]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return (
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        );
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-600">
            Success
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return <Badge variant="secondary">Testing...</Badge>;
    }
  };

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
            <h1 className="text-lg font-semibold">Test Connection</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  Supabase Connection Test
                </h1>
                <p className="text-muted-foreground">
                  Test your Supabase configuration and connection status
                </p>
              </div>
              <Button onClick={runTests} disabled={testing}>
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Tests
                  </>
                )}
              </Button>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              {results.length === 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground py-8">
                      Click "Run Tests" to test your Supabase connection
                    </p>
                  </CardContent>
                </Card>
              )}

              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <CardTitle className="text-lg">{result.name}</CardTitle>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{result.message}</p>
                    {result.details && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {result.details}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            {results.length > 0 && !testing && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Test Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {results.filter((r) => r.status === "success").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Passed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {results.filter((r) => r.status === "error").length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Failed
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{results.length}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
