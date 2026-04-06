import Logo from '@/components/ui/svg';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex">

            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-white border-r border-zinc-100 px-14 py-16">
                <div className="flex items-center gap-3">
                    <Logo size={36} />
                    <div>
                        <div className="font-secondary text-zinc-900 tracking-tight leading-none">
                            Train of Thought
                        </div>
                        <div className="text-xs text-zinc-400 font-primary mt-0.5">
                            a thinking space
                        </div>
                    </div>
                </div>

                <div>
                    <blockquote className="text-xl font-secondary text-zinc-800 leading-snug tracking-tight">
                        "The best projects start with a single clear thought."
                    </blockquote>
                    <p className="text-sm text-zinc-400 font-primary mt-4">
                        Capture it. Break it down. Ship it.
                    </p>
                </div>

                {/* Decorative project cards */}
                <div className="flex flex-col gap-3">
                    {[
                        { title: 'Brand Redesign',    accent: '#2D7A5F', color: '#E8F4F0', pct: 58 },
                        { title: 'Q2 Product Launch', accent: '#3A5FA0', color: '#EEF2F8', pct: 24 },
                        { title: 'Learn Ceramics',    accent: '#A0714F', color: '#F5F0EA', pct: 40 },
                    ].map(card => (
                        <div
                            key={card.title}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-100"
                            style={{ background: card.color }}
                        >
                            <div
                                className="w-1 h-8 rounded-full flex-shrink-0"
                                style={{ background: card.accent }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-zinc-800 font-primary truncate">
                                    {card.title}
                                </div>
                                <div className="h-1 rounded-full bg-zinc-200 mt-1.5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${card.pct}%`, background: card.accent }}
                                    />
                                </div>
                            </div>
                            <div
                                className="text-xs font-semibold font-primary flex-shrink-0"
                                style={{ color: card.accent }}
                            >
                                {card.pct}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md mx-auto">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <Logo size={48} />
                        <div className="text-lg font-secondary text-zinc-900 tracking-tight mt-3">
                            Train of Thought
                        </div>
                        <div className="text-xs text-zinc-400 font-primary">a thinking space</div>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-2xl font-secondary text-zinc-900 tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-zinc-400 font-primary mt-1">
                            Sign in to your workspace
                        </p>
                    </div>

                    <SignIn
                        appearance={{
                            elements: {
                                rootBox:          'w-full',
                                card:             'shadow-none p-0 bg-transparent',
                                headerTitle:      'hidden',
                                headerSubtitle:   'hidden',
                                socialButtonsBlockButton: `
                                    border border-zinc-200 rounded-xl font-primary text-sm
                                    text-zinc-700 hover:bg-zinc-50 transition-colors h-11
                                `,
                                socialButtonsBlockButtonText: 'font-primary font-medium',
                                dividerLine:      'bg-zinc-200',
                                dividerText:      'text-zinc-400 font-primary text-xs',
                                formFieldLabel:   'font-primary text-xs font-semibold text-zinc-600',
                                formFieldInput:   `
                                    border border-zinc-200 rounded-xl font-primary text-sm
                                    text-zinc-800 bg-zinc-50 focus:border-zinc-400
                                    focus:ring-0 h-11 px-3.5
                                `,
                                formButtonPrimary: `
                                    bg-zinc-900 hover:bg-zinc-700 rounded-xl font-primary
                                    font-semibold text-sm h-11 transition-colors
                                `,
                                footer:            'bg-transparent',
                                footerActionLink:  'text-zinc-900 font-semibold font-primary hover:text-zinc-600',
                                footerActionText:  'text-zinc-500 font-primary text-sm',
                                identityPreviewText: 'font-primary text-sm',
                                identityPreviewEditButtonIcon: 'text-zinc-500',
                                formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-zinc-600',
                                alertText:        'font-primary text-sm',
                                formResendCodeLink: 'text-zinc-900 font-primary font-semibold',
                            },
                            variables: {
                                colorPrimary:         '#18181B',
                                colorText:            '#18181B',
                                colorTextSecondary:   '#71717A',
                                colorBackground:      'transparent',
                                colorInputBackground: '#FAFAFA',
                                colorInputText:       '#18181B',
                                borderRadius:         '12px',
                                fontFamily:           'var(--font-montserrat), sans-serif',
                                fontSize:             '14px',
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
