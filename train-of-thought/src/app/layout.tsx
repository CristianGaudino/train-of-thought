import { Metadata } from 'next';
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { montserrat, spectral } from '../components/ui/fonts';
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: {
        template: '%s | Train of Thought',
        default: 'Train of Thought',
    },
    description: "Capture, explore, and create ideas with AI.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${montserrat.variable} ${spectral.variable} font-primary antialiased bg-zinc-50 text-zinc-900`}>
                <ClerkProvider>
                    <header className="flex justify-end items-center p-4 gap-4 h-16">
                        <Show when="signed-out">
                            <SignInButton />
                            <SignUpButton>
                                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </header>
                    {children}
                </ClerkProvider>
            </body>
        </html>
    );
}
