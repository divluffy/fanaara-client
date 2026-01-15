import React from "react";

const UserProfile = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  // throw new Error("Function not implemented.");
  return <div>UserProfile: {username}</div>;
};

export default UserProfile;
