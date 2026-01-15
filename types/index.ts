// types/index.ts

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

export type UserProps = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  rank?: string;
};
export type SignupStep1Props = {
  onSuccess: () => void;
};
