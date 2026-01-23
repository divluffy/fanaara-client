// types/index.ts

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";
export type Gender = "male" | "female" | "na";

export type UserProfileDTO = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  rank?: string;
  dob: Date | string | null;
  country: string | null;
  gender: Gender | null;
  status: string;
  avatar: any;
  bg: any;
};

export type SignupStep1Props = {
  onSuccess: () => void;
};
