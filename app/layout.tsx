import type { Metadata } from 'next';
export const metadata:Metadata={title:'Lavender Language Center',description:'Free learning and shared knowledge.',icons:{icon:{url:'/assets/llc-logo.jpeg?v=llc-logo-1',type:'image/jpeg'}}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
