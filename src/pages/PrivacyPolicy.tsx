import { Shield, Mail, Eye, Database, Users, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms & Privacy</h1>
          <p className="text-muted-foreground">
            Our commitment to your privacy and terms of service
          </p>
        </div>

        <div className="space-y-8">
          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2"><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
                <p className="text-muted-foreground">
                  At Networq, we take your privacy seriously. This privacy policy explains how we collect, use, and protect your personal information.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4" />
                    Information We Collect
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>Contact information you provide (name, email, phone, company)</li>
                    <li>Profile information and photos you upload</li>
                    <li>Notes and tags you add to contacts</li>
                    <li>Usage data to improve our services</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4" />
                    How We Use Your Information
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>Provide and maintain our networking services</li>
                    <li>Enable you to connect with other users</li>
                    <li>Send important service notifications</li>
                    <li>Improve our app functionality and user experience</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4" />
                    Information Sharing
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>We only share information with your explicit consent</li>
                    <li>Your contact card is shared when you generate QR codes or share codes</li>
                    <li>We never sell your personal data to third parties</li>
                    <li>Anonymous, aggregated data may be used for analytics</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Lock className="h-4 w-4" />
                    Data Security
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>All data is encrypted in transit and at rest</li>
                    <li>We use industry-standard security measures</li>
                    <li>Regular security audits and updates</li>
                    <li>You can delete your account and data at any time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card>
            <CardHeader>
              <CardTitle>Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Acceptable Use</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>Use the service for legitimate networking purposes only</li>
                    <li>Do not share inappropriate, offensive, or harmful content</li>
                    <li>Respect other users' privacy and boundaries</li>
                    <li>Do not attempt to circumvent security measures</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Account Responsibility</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-6">
                    <li>You are responsible for maintaining account security</li>
                    <li>Keep your login credentials secure and private</li>
                    <li>Report any unauthorized access immediately</li>
                    <li>Ensure accuracy of information you provide</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Service Availability</h4>
                  <p className="text-muted-foreground ml-6">
                    We strive to maintain high service availability, but cannot guarantee 100% uptime. 
                    We reserve the right to modify or discontinue features with reasonable notice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span className="font-medium">Questions?</span>
                <span className="text-muted-foreground">Contact us at</span>
                <a href="mailto:support@networq.app" className="text-primary hover:underline">
                  support@networq.app
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};