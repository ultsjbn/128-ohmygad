'use server'

import { redirect } from "next/navigation";
import { Provider } from "@supabase/supabase-js";
import { createClientForServer } from "@/lib/supabase/server";

const signInWith = (provider: Provider) => async () => {
    const supabase = await createClientForServer();
    const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    });

    if (error) {
        console.error(error);
        return;
    }

    if (data.url) {
        redirect(data.url);
    }
}

const signUpWithGoogle = async () => {
    const supabase = await createClientForServer();
    const auth_callback_url = `${process.env.SITE_URL}/auth/callback?next=onboarding`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: auth_callback_url,
        },
    });

    if (error) {
        console.error(error);
        return;
    }

    if (data.url) {
        redirect(data.url);
    }
}

const signInWithGoogle = signInWith('google');

export { signInWithGoogle, signUpWithGoogle }