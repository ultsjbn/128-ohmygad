"use client";

import { cn } from "@/lib/utils";
import { InputText, Button, Select, SelectItem } from "@snowball-tech/fractal";
import { Typography } from "@/components/typography";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter();

    // Account fields
    const [full_name, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    // Profile fields
    const [display_name, setDisplayName] = useState("");
    const [contact_num, setContactNum] = useState("");
    const [address, setAddress] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [sex_at_birth, setSexAtBirth] = useState("");
    const [gender_identity, setGenderIdentity] = useState("");
    const [college, setCollege] = useState("");
    const [program, setProgram] = useState("");
    const [student_num, setStudentNum] = useState("");
    const [year_level, setYearLevel] = useState("");
    const [gso_attended, setGsoAttended] = useState("");
    const [is_onboarded, setIsOnboarded] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleStudentNumChange = (_e: unknown, newValue: string) => {
        // Strip everything except digits
        const digits = newValue.replace(/\D/g, "").slice(0, 9);
        // Auto-insert dash after the 4th digit
        if (digits.length > 4) {
            setStudentNum(`${digits.slice(0, 4)}-${digits.slice(4)}`);
        } else {
            setStudentNum(digits);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email, password, full_name, display_name, role,
                    contact_num, address, pronouns, college, program,
                    student_num, year_level, sex_at_birth, gender_identity,
                    gso_attended, is_onboarded,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create user");

            router.push("/admin/users");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-3 font-sans border-2 border-fractal-border-default rounded-m shadow-brutal-2 p-4 bg-fractal-bg-body-white", className)} {...props}>
            <Typography variant="heading-2" className="font-wide font-bold text-fractal-text-default">
                Add New User
            </Typography>
            <Typography variant="body-2" className="text-fractal-text-placeholder">
                Create a new user account and fill in their profile details.
            </Typography>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3">

                    {/* ── Account Information ── */}
                    <Typography variant="body-1-median" className="text-fractal-text-default pt-2">
                        Account Information
                    </Typography>

                    <InputText
                        id="full_name"
                        label="Full Name *"
                        type="text"
                        placeholder="e.g. Juan Dela Cruz"
                        required
                        fullWidth
                        value={full_name}
                        onChange={(_e, newValue) => setFullName(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="email"
                        label="Email *"
                        type="email"
                        placeholder="e.g. jdelacruz@up.edu.ph"
                        required
                        fullWidth
                        value={email}
                        onChange={(_e, newValue) => setEmail(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="password"
                        label="Password *"
                        type="password"
                        placeholder="Minimum 6 characters"
                        required
                        fullWidth
                        value={password}
                        onChange={(_e, newValue) => setPassword(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <Select
                        id="role"
                        label="Role *"
                        placeholder="Select role"
                        fullWidth
                        required
                        onSelect={(value) => setRole(value)}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="admin" label="Admin" />
                        <SelectItem value="faculty" label="Faculty" />
                        <SelectItem value="student" label="Student" />
                    </Select>

                    {/* ── Profile Details ── */}
                    <Typography variant="body-1-median" className="text-fractal-text-default pt-4">
                        Profile Details
                    </Typography>

                    <InputText
                        id="display_name"
                        label="Display Name (optional)"
                        type="text"
                        placeholder="How they want to be called"
                        fullWidth
                        value={display_name}
                        onChange={(_e, newValue) => setDisplayName(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="student_num"
                        label="Student Number"
                        type="text"
                        placeholder="e.g. 2021-12345"
                        fullWidth
                        maxLength={10}
                        value={student_num}
                        onChange={handleStudentNumChange}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <Select
                        id="year_level"
                        label="Year Level"
                        placeholder="Select year level"
                        fullWidth
                        onSelect={(value) => setYearLevel(value)}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="1st Year" label="1st Year" />
                        <SelectItem value="2nd Year" label="2nd Year" />
                        <SelectItem value="3rd Year" label="3rd Year" />
                        <SelectItem value="4th Year" label="4th Year" />
                        <SelectItem value="5th Year" label="5th Year" />
                    </Select>

                    <Select
                        id="college"
                        label="College"
                        placeholder="Select college"
                        fullWidth
                        onSelect={(value) => setCollege(value)}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="CAS" label="College of Science (CS)" />
                        <SelectItem value="CAC" label="College of Arts and Communications (CAC)" />
                        <SelectItem value="CSSP" label="College of Social Sciences (CSS)" />
                    </Select>

                    <InputText
                        id="program"
                        label="Program (optional)"
                        type="text"
                        placeholder="e.g. BS Computer Science"
                        fullWidth
                        value={program}
                        onChange={(_e, newValue) => setProgram(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="contact_num"
                        label="Contact Number (optional)"
                        type="text"
                        placeholder="09XX XXX XXXX"
                        fullWidth
                        value={contact_num}
                        onChange={(_e, newValue) => setContactNum(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="address"
                        label="Address (optional)"
                        type="text"
                        placeholder="e.g. Baguio City"
                        fullWidth
                        value={address}
                        onChange={(_e, newValue) => setAddress(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <InputText
                        id="pronouns"
                        label="Pronouns (optional)"
                        type="text"
                        placeholder="e.g. she/her, he/him, they/them"
                        fullWidth
                        value={pronouns}
                        onChange={(_e, newValue) => setPronouns(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <Select
                        id="sex_at_birth"
                        label="Sex at Birth"
                        placeholder="Select sex at birth"
                        fullWidth
                        onSelect={(value) => setSexAtBirth(value)}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="Male" label="Male" />
                        <SelectItem value="Female" label="Female" />
                        <SelectItem value="Intersex" label="Intersex" />
                        <SelectItem value="Prefer not to say" label="Prefer not to say" />
                    </Select>

                    <Select
                        id="gender_identity"
                        label="Gender Identity (optional)"
                        placeholder="Select gender identity"
                        fullWidth
                        onSelect={(value) => setGenderIdentity(value)}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="Man" label="Man" />
                        <SelectItem value="Woman" label="Woman" />
                        <SelectItem value="Non-binary" label="Non-binary" />
                        <SelectItem value="Genderqueer" label="Genderqueer" />
                        <SelectItem value="Genderfluid" label="Genderfluid" />
                        <SelectItem value="Agender" label="Agender" />
                        <SelectItem value="Prefer not to say" label="Prefer not to say" />
                        <SelectItem value="Self-describe" label="Prefer to self-describe" />
                    </Select>

                    <InputText
                        id="gso_attended"
                        label="GSO Attended"
                        type="number"
                        placeholder="0"
                        fullWidth
                        value={gso_attended}
                        onChange={(_e, newValue) => setGsoAttended(newValue)}
                        className="[&_input:focus]:!border-fractal-border-primary [&_input:focus]:!shadow-brutal-1-primary"
                    />

                    <Select
                        id="is_onboarded"
                        label="Onboarded?"
                        placeholder="Select"
                        fullWidth
                        value={is_onboarded ? "true" : "false"}
                        onSelect={(value) => setIsOnboarded(value === "true")}
                        dropdown={{ className: "!text-black" }}
                    >
                        <SelectItem value="true" label="Yes" />
                        <SelectItem value="false" label="No" />
                    </Select>

                    {error && (
                        <Typography variant="body-2" className="text-fractal-feedback-error-50">
                            {error}
                        </Typography>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            label="Cancel"
                            variant="secondary"
                            onClick={() => router.push("/admin/users")}
                            className="[&]:border-2 [&]:border-fractal-border-default [&:hover]:bg-fractal-base-grey-90"
                        />
                        <Button
                            type="submit"
                            label={isLoading ? "Creating..." : "Create User"}
                            variant="primary"
                            disabled={isLoading}
                            className="[&]:text-fractal-base-white [&]:border-2 [&]:border-fractal-border-default [&:hover]:text-fractal-base-black [&:hover]:border-2 [&:hover]:border-fractal-border-default"
                        />
                    </div>

                </div>
            </form>
        </div>
    );
}
