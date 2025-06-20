"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/retroui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Badge } from "@/components/retroui/Badge";
import { Avatar } from "@/components/retroui/Avatar";
import { Text } from "@/components/retroui/Text";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
} from "lucide-react";

// Mock data for demo purposes
const mockTeamMembers = [
  {
    id: "1",
    name: "Master Miguel",
    email: "miguel@designhandoff.com",
    role: "Owner",
    avatar: null,
    status: "active",
    joinedAt: "2024-01-15",
    lastActive: "2 minutes ago",
  },
  {
    id: "2",
    name: "Sarah Designer",
    email: "sarah@design.co",
    role: "Designer",
    avatar: null,
    status: "active",
    joinedAt: "2024-01-20",
    lastActive: "1 hour ago",
  },
  {
    id: "3",
    name: "Alex Developer",
    email: "alex@dev.com",
    role: "Developer",
    avatar: null,
    status: "pending",
    joinedAt: null,
    lastActive: null,
  },
];

const roleIcons = {
  Owner: Crown,
  Admin: Shield,
  Designer: Eye,
  Developer: Users,
};

const roleColors = {
  Owner: "danger",
  Admin: "warning",
  Designer: "secondary",
  Developer: "outline",
} as const;

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const filteredMembers = mockTeamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Team">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Team Management
            </h1>
            <Text className="text-muted-foreground">
              Manage your team members and their permissions
            </Text>
          </div>

          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="font-bold"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Invite form */}
        {showInviteForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    // Handle invite logic here
                    console.log("Inviting:", inviteEmail);
                    setInviteEmail("");
                    setShowInviteForm(false);
                  }}
                >
                  Send Invite
                </Button>
              </div>
              <Text className="text-sm text-muted-foreground">
                Team members will receive an email invitation to join your
                projects.
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Search and filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Team stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Text className="text-2xl font-bold text-black dark:text-white">
                    {mockTeamMembers.length}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Total Members
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Text className="text-2xl font-bold text-black dark:text-white">
                    {
                      mockTeamMembers.filter((m) => m.status === "active")
                        .length
                    }
                  </Text>
                  <Text className="text-sm text-muted-foreground">Active</Text>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <Text className="text-2xl font-bold text-black dark:text-white">
                    {
                      mockTeamMembers.filter((m) => m.status === "pending")
                        .length
                    }
                  </Text>
                  <Text className="text-sm text-muted-foreground">Pending</Text>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Text className="text-2xl font-bold text-black dark:text-white">
                    {
                      mockTeamMembers.filter((m) => m.role === "Designer")
                        .length
                    }
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Designers
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team members list */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const RoleIcon =
                  roleIcons[member.role as keyof typeof roleIcons];

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <Avatar.Fallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar.Fallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <Text className="font-medium text-black dark:text-white">
                            {member.name}
                          </Text>
                          <Badge
                            variant={
                              roleColors[member.role as keyof typeof roleColors]
                            }
                            className="flex items-center gap-1"
                          >
                            <RoleIcon className="w-3 h-3" />
                            {member.role}
                          </Badge>
                          {member.status === "pending" && (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </div>
                        <Text className="text-sm text-muted-foreground">
                          {member.email}
                        </Text>
                        {member.lastActive && (
                          <Text className="text-xs text-muted-foreground">
                            Last active: {member.lastActive}
                          </Text>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Empty state */}
        {filteredMembers.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <Text className="text-lg font-medium mb-2">
              No team members found
            </Text>
            <Text className="text-muted-foreground">
              Try adjusting your search terms or invite new members.
            </Text>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
