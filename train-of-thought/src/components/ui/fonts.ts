import { Montserrat, Spectral } from 'next/font/google';
 
export const montserrat = Montserrat({ 
    subsets: ['latin'],
    variable: '--font-montserrat',
    weight: ['300', '400', '500', '600', '700']
});
 
export const spectral = Spectral({
    subsets: ['latin'],
    variable: '--font-spectral',
    weight: ['300', '400', '500', '600', '700']
});