// The company's cover/logo pictures and the post pending deletion. Shared by the company profile, its
// edit screen and the account avatar in the navigation, exactly like the legacy 'company-profile' bag.
export const COMPANY_PROFILE_KEY = 'company-profile';

export interface CompanyProfileUI {
  capa: string | null;
  logo: string | null;
  deleteId: string | null;
}

export const COMPANY_PROFILE_DEFAULTS: CompanyProfileUI = { capa: null, logo: null, deleteId: null };
