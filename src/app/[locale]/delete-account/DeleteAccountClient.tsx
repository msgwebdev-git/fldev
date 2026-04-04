"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Trash2, Mail, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Delete Your Account</h1>
          <p className="text-muted-foreground text-lg">
            We're sorry to see you go. Here's how to delete your Festivalul Lupilor account.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              How to Request Account Deletion
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>To delete your account, send an email to:</p>
              <a
                href="mailto:support@festivalul-lupilor.md?subject=Account%20Deletion%20Request"
                className="inline-block text-primary font-semibold text-lg hover:underline"
              >
                support@festivalul-lupilor.md
              </a>
              <p>Include the following in your email:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Subject: <strong>Account Deletion Request</strong></li>
                <li>The email address associated with your account</li>
                <li>Your full name (optional, for verification)</li>
              </ul>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              What Data Will Be Deleted
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Your account profile and personal information
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                Push notification tokens and preferences
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                App settings and language preferences
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-amber-500/30 bg-amber-500/5">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Important Information
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                Order history and purchased tickets will be retained for legal and financial record-keeping purposes.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                Account deletion is permanent and cannot be undone.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                We will process your request within 7 business days.
              </li>
            </ul>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            For any questions, contact us at{" "}
            <a href="mailto:support@festivalul-lupilor.md" className="text-primary hover:underline">
              support@festivalul-lupilor.md
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
