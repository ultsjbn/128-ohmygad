// We're putting all of the constants here so we don't have to put them in individual files
export const UPB_PROGRAMS: Record<string, { value: string; label: string }[]> = {
  CS: [
    { value: "BS Biology", label: "BS Biology" },
    { value: "BS Computer Science", label: "BS Computer Science" },
    { value: "BS Mathematics", label: "BS Mathematics" },
    { value: "BS Physics", label: "BS Physics" },
    { value: "MS Conservation and Restoration Ecology", label: "MS Conservation and Restoration Ecology" },
    { value: "MS Mathematics", label: "MS Mathematics" },
    { value: "Doctor of Philosophy in Mathematics", label: "Doctor of Philosophy in Mathematics" },
  ],
  CAC: [
    { value: "BA Communication", label: "BA Communication" },
    { value: "BA Fine Arts", label: "BA Fine Arts" },
    { value: "BA Language and Literature", label: "BA Language and Literature" },
    { value: "Certificate in Fine Arts", label: "Certificate in Fine Arts" },
    { value: "MA Language and Literature", label: "MA Language and Literature" },
  ],
  CSS: [
    { value: "BA Social Sciences (History)", label: "BA Social Sciences (History)" },
    { value: "BA Social Sciences (Economics)", label: "BA Social Sciences (Economics)" },
    { value: "BA Social Sciences (Anthropology)", label: "BA Social Sciences (Anthropology)" },
    { value: "BS Management Economics", label: "BS Management Economics" },
    { value: "MA History (Ethnohistory and Local History)", label: "MA History (Ethnohistory and Local History)" },
    { value: "MA Social and Development Studies", label: "MA Social and Development Studies" },
    { value: "Master of Management", label: "Master of Management" },
    { value: "Doctor of Philosophy in Indigenous Studies", label: "Doctor of Philosophy in Indigenous Studies" },
  ],
};

export const PRONOUNS = [
  { value: "he/him", label: "he/him" },
  { value: "she/her", label: "she/her" },
  { value: "they/them", label: "they/them" },
  { value: "he/they", label: "he/they" },
  { value: "she/they", label: "she/they" },
  { value: "any/all", label: "any/all" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export const SEX_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Intersex", label: "Intersex" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export const GENDER_OPTIONS = [
  { value: "Man", label: "Man" },
  { value: "Woman", label: "Woman" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Genderqueer", label: "Genderqueer" },
  { value: "Genderfluid", label: "Genderfluid" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export const COLLEGE_OPTIONS = [
  { value: "CS", label: "College of Science (CS)" },
  { value: "CAC", label: "College of Arts and Communications (CAC)" },
  { value: "CSS", label: "College of Social Sciences (CSS)" },
];

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "faculty", label: "Faculty" },
  { value: "student", label: "Student" },
];

export const YEAR_OPTIONS = [
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
  { value: "Extendee", label: "Extendee" },
];
