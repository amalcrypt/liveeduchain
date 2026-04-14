'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Shield, Fingerprint, Power, ChevronDown, Wallet, Menu, X } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = () => {
    disconnect();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const getLinkClassName = (href, isMobile = false) => {
    const isActive = pathname === href;
    const baseClasses = isMobile 
      ? 'px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 transition-colors duration-200'
      : 'px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200';
    
    if (isActive) {
      return `${baseClasses} text-blue-600 bg-blue-50 font-semibold`;
    }
    return `${baseClasses} text-slate-600 hover:text-blue-600 hover:bg-slate-50`;
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/admin', label: 'Admin', icon: Shield },
    { href: '/verify', label: 'Verify', icon: Fingerprint },
  ];

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-slate-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-shrink-0">
              <Link href="/">
                <img className="h-10 sm:h-12" src="/assets/logo.png" alt="EduChain" />
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={getLinkClassName(link.href)}>
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {isConnected ? address?.slice(0, 2).toUpperCase() : '?'}
              </div>
              <ChevronDown size={16} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {isConnected ? (
                  <>
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <p className="text-xs text-slate-500 mb-1.5 font-semibold">Connected Address</p>
                      <p className="text-xs font-mono text-slate-700 break-all bg-white p-2 rounded border border-slate-200">{address}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-3 transition-colors font-medium border-t border-slate-200"
                    >
                      <Power size={18} className="text-slate-600" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      open();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3 transition-colors font-medium"
                  >
                    <Wallet size={18} />
                    Connect Wallet
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 transition-all duration-300 ease-in-out">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getLinkClassName(link.href, true)}
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
