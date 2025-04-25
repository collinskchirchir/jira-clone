import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DottedSeparator } from '@/components/dotted-separator';

export const SignInCard = () => {
    return (
        <Card className="size-full border-none shadow-none md:w-[487px]">
            <CardHeader className="flex items-center justify-center p-7 text-center">
                <CardTitle className='text-2xl'>
                    Welcome Back!
                </CardTitle>
            </CardHeader>
            <div className='mb-2 px-7'>
                <DottedSeparator/>
            </div>
          <CardContent className="p-7">
            <form className="space-y-4">
              
            </form>

          </CardContent>
        </Card>
    );
};
