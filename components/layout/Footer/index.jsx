import Image from 'next/image';
import ChatButton from './ChartButton';
import SocialMedia from './SocialMedia';
export default function Footer() {
    return (
        <div className="bg-[#282454] flex flex-col md:flex-row justify-center md:justify-between px-[120px] py-[30px] items-center">
            <div className='flex flex-col'>
                <div className='w-[320px] h-[70px] flex justify-center items-center p-[8px] hover:p-[0px] transition-all duration-300'>
                    <Image 
                        src='/images/logo.png' 
                        alt='ThinkingMind'
                        width={320}
                        height={70}
                    />
                </div>
            </div>
            <div className='flex'>
                <SocialMedia link='https://www.facebook.com/profile.php?id=100089095531936' iconName='facebook'/>
                <SocialMedia link='https://twitter.com/safeblock_co' iconName='twitter'/>
                <SocialMedia link='https://www.linkedin.com/company/safeblockco/' iconName='linkedin'/>
                <SocialMedia link='https://t.me/+wbflVvJLTs01YTMx' iconName='telegram'/>
            </div>
        </div>
    )
}