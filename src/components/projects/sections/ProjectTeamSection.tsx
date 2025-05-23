import { Project } from "@/lib/types/project";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Avatar } from "@/components/retroui/Avatar";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import { useState } from "react";
import { Users, Mail, Crown, UserPlus, Settings } from "lucide-react";

interface ProjectTeamSectionProps {
  project: Project;
}

export function ProjectTeamSection({ project }: ProjectTeamSectionProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Mock current user data
  // TODO: this would come from auth context
  const currentUser = {
    id: project.owner_id,
    full_name: "You",
    email: "you@example.com",
    role: "owner",
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsInviting(false);
    setInviteEmail("");

    // TODO: this would call an API to send invite
    console.log(`Inviting ${inviteEmail} to project ${project.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <Text
              as="h3"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              Team Members
            </Text>
          </div>
          <Badge variant="primary" size="sm">
            {project.members_count || 1} member
            {(project.members_count || 1) > 1 ? "s" : ""}
          </Badge>
        </div>

        <Text as="p" className="mb-6 font-pixel text-black dark:text-white">
          Collaborate with team members on this project.
        </Text>

        {/* Current Members */}
        <div className="space-y-4 mb-6">
          <Text
            as="h4"
            className="text-lg font-bold font-pixel text-black dark:text-white"
          >
            Current Members
          </Text>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar variant="primary" className="w-10 h-10">
                  <Avatar.Fallback className="bg-pink-200 text-pink-800">
                    {currentUser.full_name.charAt(0)}
                  </Avatar.Fallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Text
                      as="span"
                      className="font-bold font-pixel text-black dark:text-white"
                    >
                      {currentUser.full_name}
                    </Text>
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </div>
                  <Text
                    as="span"
                    className="text-sm text-gray-600 dark:text-gray-300"
                  >
                    {currentUser.email}
                  </Text>
                </div>
              </div>
              <Badge variant="warning" size="sm">
                Owner
              </Badge>
            </div>
          </div>
        </div>

        {/* Invite New Members */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
          <Text
            as="h4"
            className="text-lg font-bold font-pixel text-black dark:text-white mb-4"
          >
            Invite Team Members
          </Text>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleInviteUser}
              disabled={!inviteEmail.trim() || isInviting}
              className="flex items-center gap-2"
            >
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Invite
                </>
              )}
            </Button>
          </div>

          <Text
            as="p"
            className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-pixel"
          >
            Team members will receive an email invitation to join this project.
          </Text>
        </div>
      </Card>

      {/* Team Settings */}
      <Card className="p-6 border-3 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-gray-500" />
          <Text
            as="h3"
            className="text-xl font-bold font-pixel text-black dark:text-white"
          >
            Team Settings
          </Text>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-yellow-600" />
              <Text
                as="h4"
                className="font-bold font-pixel text-yellow-800 dark:text-yellow-200"
              >
                Coming Soon
              </Text>
            </div>
            <Text
              as="p"
              className="text-sm font-pixel text-yellow-700 dark:text-yellow-300"
            >
              Advanced team management features including role-based
              permissions, team activity tracking, and collaboration tools are
              coming in a future update.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <Text
                as="h4"
                className="font-bold font-pixel text-black dark:text-white mb-2"
              >
                Project Visibility
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-gray-600 dark:text-gray-300"
              >
                Private - Only invited members can access
              </Text>
            </div>

            <div className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
              <Text
                as="h4"
                className="font-bold font-pixel text-black dark:text-white mb-2"
              >
                Default Role
              </Text>
              <Text
                as="p"
                className="text-sm font-pixel text-gray-600 dark:text-gray-300"
              >
                Member - Can view and comment
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
