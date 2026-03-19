import { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { montserrat, spectral } from '../components/ui/fonts';
import "@/styles/globals.css";
import Providers from '@/components/Providers';

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
        <ClerkProvider>
            <html lang="en">
                <body className={`${montserrat.variable} ${spectral.variable} font-primary antialiased bg-zinc-50 text-zinc-900`}>
                    <Providers>
                        {children}
                    </Providers>
                </body>
            </html>
        </ClerkProvider>
    );
}
