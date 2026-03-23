export const metadata = {
    title: '404',
};

import ErrorCode from '@/components/ui/Errorcode'

export default function Custom404() {
    return (
        <div className='h-screen w-full bg-cover bg-center'>

            <ErrorCode>404</ErrorCode>

        </div>
    );
}