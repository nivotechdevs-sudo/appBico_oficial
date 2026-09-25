// Sign-in, sign-up and password flows. There is no auth backend yet: like the legacy app, every flow is
// simulated, with the same delays and outcomes. Screens only call these functions, so a real provider
// (Supabase Auth — see docs/SUPABASE.md) replaces their bodies, not the screens.
import type { Role } from '../types/models';
import { mockLatency } from './mockLatency';
import { setRole } from './store';

/** Demo: e-mail/password, Google and phone sign-in all log straight into the chosen side. */
export async function signIn(role: Role): Promise<void> {
  await mockLatency(500);
  setRole(role);
}

export interface SignUpData {
  role: Role;
  /** Full name (worker) or razão social (recruiter). */
  name: string;
  /** CPF (worker) or CNPJ (recruiter), masked as typed. */
  doc: string;
  email: string;
  password: string;
}

export type SignUpResult = { ok: true } | { ok: false; reason: 'doc-taken' };

// Demo: these CPF/CNPJ are "already registered" — they reproduce the "documento já cadastrado" error.
const TAKEN_DOCS = ['111.111.111-11', '11.111.111/1111-11'];

/** Creates the account. The e-mail confirmation and the profile come next (see finishSignUp). */
export async function signUp(data: SignUpData): Promise<SignUpResult> {
  await mockLatency(700);
  return TAKEN_DOCS.includes(data.doc) ? { ok: false, reason: 'doc-taken' } : { ok: true };
}

/** Last step of sign-up: the profile is filled in and the user enters the app. Demo: the answers aren't stored, as in the legacy app. */
export function finishSignUp(role: Role): void {
  setRole(role);
}

/** Sends the "reset your password" link. Demo: nothing is sent. */
export async function requestPasswordReset(_email: string): Promise<void> {
  await mockLatency(600);
}

/** Sets the new password chosen from the reset link. Demo: nothing is stored. */
export async function resetPassword(_newPassword: string): Promise<void> {
  await mockLatency(600);
}
