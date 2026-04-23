import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType | string
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])

  // Sync activeTeam when teams prop updates (e.g., after church data loads from /auth/me)
  React.useEffect(() => {
    if (teams[0]) {
      setActiveTeam(teams[0])
    }
  }, [teams[0]?.logo, teams[0]?.name])

  if (!activeTeam) {
    return null
  }

  const renderLogo = (logo: React.ElementType | string, name: string, size: 'sm' | 'lg') => {
    const avatarSize = size === 'lg' ? 'size-8' : 'size-6'

    if (typeof logo === 'string') {
      return (
        <Avatar className={`${avatarSize} rounded-lg`}>
          <AvatarImage src={logo} alt={name} className="object-cover" />
          <AvatarFallback className="rounded-lg text-xs font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      )
    }

    // No image URL at all — show initials fallback
    if (!logo) {
      return (
        <Avatar className={`${avatarSize} rounded-lg`}>
          <AvatarFallback className="rounded-lg text-xs font-medium">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      )
    }

    // It's a React component (icon)
    const LogoComponent = logo as React.ElementType
    return (
      <div className={`bg-sidebar-primary text-sidebar-primary-foreground flex ${avatarSize} items-center justify-center rounded-lg`}>
        <LogoComponent className={size === 'lg' ? 'size-4' : 'size-3.5 shrink-0'} />
      </div>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {renderLogo(activeTeam.logo, activeTeam.name, 'lg')}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs">{activeTeam.plan}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                {renderLogo(team.logo, team.name, 'sm')}
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
