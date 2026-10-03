export interface GoogleSignInButtonProps {
  label?: string;
  callbackUrl?: string;
  onError?: (msg: string) => void;
}

export interface LoginFormProps {
  callbackUrl?: string;
}

export type SignInFormProps = LoginFormProps;

export interface SignUpFormProps {
  callbackUrl?: string;
}
