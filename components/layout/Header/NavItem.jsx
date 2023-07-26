import Link from "next/link";

export default function NavItem({link, target, label}) {
    return(
        <Link href={link}>
            <a target={target}
                className="mr-[26px] text-[14px] leading-[1.143em] font-medium font-ibm text-white">
                { label }
            </a>
        </Link>
    );
};