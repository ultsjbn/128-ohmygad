import Link from "next/link";
import React, { Suspense } from "react";

import { AuthButton } from "./auth-button";
import { DeployButton } from "./deploy-button";
import { EnvVarWarning } from "./env-var-warning";
import { hasEnvVars } from "@/lib/utils";

const Navbar = () => {
    return (
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}>Next.js Supabase Starter</Link>
                <div className="flex items-center gap-2">
                    <DeployButton />
                </div>
                </div>
                    {!hasEnvVars ? (
                    <EnvVarWarning />
                    ) : (
                    <Suspense>
                        <AuthButton />
                    </Suspense>
                    )}
            </div>
        </nav>
    );
}

export default Navbar;