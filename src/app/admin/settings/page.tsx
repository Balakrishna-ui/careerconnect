"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Shield, CreditCard, Mail, Globe, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">Configure global variables, integrations, and policies.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="financial"><CreditCard className="w-4 h-4 mr-2" /> Financials</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" /> Email Settings</TabsTrigger>
          <TabsTrigger value="integrations"><Database className="w-4 h-4 mr-2" /> Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
              <CardDescription>Global details used across the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Name</label>
                  <Input defaultValue="CareerConnect" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <Input defaultValue="support@careerconnect.io" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Platform Description (Meta)</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue="Connect with industry experts for 1-on-1 career mentorship."
                  />
                </div>
              </div>
              <Button><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Commission & Payouts</CardTitle>
              <CardDescription>Configure platform fees and tax rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Commission (%)</label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Tax Rate (%)</label>
                  <Input type="number" defaultValue="18" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payout Cycle</label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="weekly">Weekly (Every Monday)</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly (1st of Month)</option>
                  </select>
                </div>
              </div>
              <Button><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-300">Halt All Payouts</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">Suspend the automated mentor payout script globally.</p>
                </div>
                <Button variant="destructive">Halt Payouts</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would have similar setup */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Session timeouts, 2FA enforcement, and password policies would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
