import instance from "@apis/axios";

import { User, UserProfile } from "@templates/user";

export const fetchUser = async (): Promise<User | null> => {
  const { data, status } = await instance.get(`/v2/user/profile`);

  if (status === 200) return data;

  return null;
};

export const fetchProfileImages = async (): Promise<UserProfile[]> => {
  const { data } = await instance.get(`/v2/user/profile/list`);

  return data;
};

export const setProfileImage = async (
  profile: UserProfile
): Promise<boolean> => {
  const { status } = await instance.patch(`/v2/user/profile`, {
    type: profile.type,
  });

  return status === 201;
};

export const setUsername = async (name: string): Promise<boolean> => {
  const { status } = await instance.patch(`/v2/user/name`, {
    name,
  });

  return status === 201;
};

export const removeUser = async (): Promise<boolean> => {
  const { status } = await instance.delete(`/v2/user/remove`);

  return status === 200;
};
