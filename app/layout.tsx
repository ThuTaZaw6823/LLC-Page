import type { Metadata } from 'next';
export const metadata:Metadata={title:'Lavender Language Center',description:'Free learning and shared knowledge.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
