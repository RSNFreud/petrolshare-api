import { FastifyReply } from "fastify";

export type UserDataType = {
  userID: string;
  groupID: string;
  authenticationKey?: string;
  fullName: string;
  emailAddress: string;
  tempEmail?: string;
  password: string;
  verificationCode?: string;
  verified: boolean;
  notificationKey?: string;
  active: boolean;
  tempPassword: boolean;
};

export type GroupDataType = { groupID: string; distance: string; petrol: string; currency: string; premium: boolean };

export type APIResultType = { reply: FastifyReply; data: UserDataType };
