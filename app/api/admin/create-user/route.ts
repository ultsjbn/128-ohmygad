import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            email, password, full_name, display_name, role,
            contact_num, address, pronouns, college, program,
            student_num, year_level, sex_at_birth, gender_identity,
            gso_attended, is_onboarded,
        } = body;

        if (!email || !password || !full_name || !role) {
            return NextResponse.json(
                { error: "Email, password, full name, and role are required." },
                { status: 400 },
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Please provide a valid email address." },
                { status: 400 },
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long." },
                { status: 400 },
            );
        }

        const fullnameRegex = /^[a-zA-Z\s.'-]+$/;
        if (!fullnameRegex.test(full_name)) {
            return NextResponse.json(
                { error: "Full name can only contain letters, spaces, and basic punctuation." },
                { status: 400 },
            );
        }

        if (contact_num) {
            const contactRegex = /^[0-9]{10,15}$/;
            if (!contactRegex.test(contact_num)) {
                return NextResponse.json(
                    { error: "Contact number must be 10-15 digits." },
                    { status: 400 },
                );
            }
        }

        if (student_num) {
            const cleanStudentNum = String(student_num).replace(/\D/g, "");
            if (cleanStudentNum.length !== 9) {
                return NextResponse.json(
                    { error: "Student number must be exactly 9 digits." },
                    { status: 400 },
                );
            }
        }

        // 1. Create the auth user with email auto-confirmed
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const userId = authData.user.id;

        // 2. Update the profile row with all provided fields
        const { error: profileError } = await supabaseAdmin
            .from("profile")
            .update({
                full_name,
                display_name: display_name || null,
                role,
                contact_num: contact_num || null,
                address: address || null,
                pronouns: pronouns || null,
                college: college || null,
                program: program || null,
                student_num: student_num ? Number(student_num) : null,
                year_level: year_level || null,
                sex_at_birth: sex_at_birth || null,
                gender_identity: gender_identity || null,
                gso_attended: gso_attended ? Number(gso_attended) : 0,
                is_onboarded: is_onboarded ?? true,
            })
            .eq("id", userId);

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ id: userId }, { status: 201 });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "An unexpected error occurred." },
            { status: 500 },
        );
    }
}
