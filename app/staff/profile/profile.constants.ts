/*
Admin and Staff profile page constants

Extracted from inline constant arrays in:
app/admin/profile/page.tsx (L31-32)

Currently used by:
app/admin/profile/page.tsx (sex-at-birth select, pronouns select) and app/staff/profile/page.tsx
*/

// Options for "Sex at Birth" dropdown.
// Used in: app/admin/profile/page.tsx (identity tab select options) and app/staff/profile/page.tsx
export const SEX_OPTIONS = ["Male", "Female", "Intersex", "Prefer not to say"];

// Options for "Pronouns" dropdown.
// Used in: app/admin/profile/page.tsx (personal tab select options) and app/staff/profile/page.tsx
export const PRONOUNS = ["he/him", "she/her", "they/them", "he/they", "she/they", "any/all", "Prefer not to say"];

// Options for "Gender" dropdown.
// Used in: app/admin/profile/page.tsx (personal tab select options) and app/staff/profile/page.tsx
export const GENDER_OPTIONS = ["Man", "Woman", "Genderqueer", "Genderfluid", "Agender", "Self-describe", "Non-binary", "Prefer not to say"];
