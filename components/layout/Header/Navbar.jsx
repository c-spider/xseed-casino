import NavItem from "./NavItem"

export default function Navbar({className}) {
    return (
        <div className={className}>
            <NavItem link='/' target='_self' label='HOME'/>
            <NavItem link='/about' target='_self' label='CREATE'/>
            <NavItem link='/faq' target='_self' label='SERVICE'/>
            <NavItem link='/tokenomics' target='_self' label='ABOUT'/>
            <NavItem link='/contact' target='_self' label='CONTACT'/>
        </div>
    )
}