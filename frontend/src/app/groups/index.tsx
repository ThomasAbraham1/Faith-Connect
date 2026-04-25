import React from "react";
import { GroupsList } from "./GroupsList";
import { GroupDetail } from "./GroupDetail";
import type { Group } from "./types/groups.types";

import { useParams, useNavigate } from "react-router-dom";

export const GroupsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  if (groupId) {
    return (
      <div className="p-4 md:p-8">
        <GroupDetail 
          groupId={groupId} 
          onBack={() => navigate("/dashboard/Groups")} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <GroupsList 
        onGroupClick={(group) => navigate(`/dashboard/Groups/${group._id}`)} 
      />
    </div>
  );
};
