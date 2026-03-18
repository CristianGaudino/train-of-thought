import Logo from '@/components/ui/svg';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-zinc-50 flex">

            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-white border-r border-zinc-100 px-14 py-16">
                <div className="flex items-center gap-3">
                    <Logo size={36} />
                    <div>
                        <div className="text-[16px] font-secondary text-zinc-900 tracking-tight leading-none">
                            Train of Thought
                        </div>
                        <div className="text-[11px] text-zinc-400 font-primary mt-0.5">
                            a thinking space
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-[24px] font-secondary text-zinc-900 tracking-tight leading-snug">
                        Everything you need to manage projects — personal or professional.
                    </h2>
                    <div className="flex flex-col gap-4 mt-8">
                        {[
                            {
                                icon:  '⬡',
                                label: 'Project Space',
                                desc:  'Organise work into projects with sections and tasks',
                            },
                            {
                                icon:  '◈',
                                label: 'My Tasks',
                                desc:  'See everything assigned to you across all projects',
                            },
                            {
                                icon:  '🔔',
                                label: 'Notifications',
                                desc:  'Stay on top of activity without checking every tab',
                            },
                        ].map(f => (
                            <div key={f.label} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                    {f.icon}
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-zinc-800 font-primary">
                                        {f.label}
                                    </div>
                                    <div className="text-[12px] text-zinc-400 font-primary mt-0.5 leading-relaxed">
                                        {f.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-[12px] text-zinc-300 font-primary">
                    Free to get started. No credit card required.
                </p>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <Logo size={48} />
                        <div className="text-[18px] font-secondary text-zinc-900 tracking-tight mt-3">
                            Train of Thought
                        </div>
                        <div className="text-[12px] text-zinc-400 font-primary mt-1">a thinking space</div>
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h1 className="text-[26px] font-secondary text-zinc-900 tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-[14px] text-zinc-400 font-primary mt-1">
                            Start organising your work today
                        </p>
                    </div>

                    <SignUp
                        appearance={{
                            elements: {
                                rootBox:          'w-full',
                                card:             'shadow-none p-0 bg-transparent',
                                headerTitle:      'hidden',
                                headerSubtitle:   'hidden',
                                socialButtonsBlockButton: `
                                    border border-zinc-200 rounded-xl font-primary text-[13px]
                                    text-zinc-700 hover:bg-zinc-50 transition-colors h-11
                                `,
                                socialButtonsBlockButtonText: 'font-primary font-medium',
                                dividerLine:      'bg-zinc-200',
                                dividerText:      'text-zinc-400 font-primary text-[12px]',
                                formFieldLabel:   'font-primary text-[12px] font-semibold text-zinc-600',
                                formFieldInput:   `
                                    border border-zinc-200 rounded-xl font-primary text-[14px]
                                    text-zinc-800 bg-zinc-50 focus:border-zinc-400
                                    focus:ring-0 h-11 px-3.5
                                `,
                                formButtonPrimary: `
                                    bg-zinc-900 hover:bg-zinc-700 rounded-xl font-primary
                                    font-semibold text-[13px] h-11 transition-colors
                                `,
                                footerActionLink:  'text-zinc-900 font-semibold font-primary hover:text-zinc-600',
                                footerActionText:  'text-zinc-400 font-primary text-[13px]',
                                identityPreviewText: 'font-primary text-[13px]',
                                identityPreviewEditButtonIcon: 'text-zinc-500',
                                formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-zinc-600',
                                alertText:        'font-primary text-[13px]',
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
