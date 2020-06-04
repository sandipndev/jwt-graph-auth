export interface tokenPayload {
  userId: string;
  isForgotPasswordToken?: boolean;
  isEmailVerificationToken?: boolean;
  allowChangePasswordWithoutOld?: boolean;
}
