// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../assets/logo_text.svg';
import logoutIcon from '../assets/logout.svg';

function NavbarAdmin() {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleProfileDropdown = () => {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const toggleNotificationDropdown = () => {
        setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
          if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
            setIsNotificationDropdownOpen(false);
        }
        }
  
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);

    return (
        <nav className="bg-custom-blue p-4">
          <div className="container mx-auto flex justify-between items-center">
            <a href="/" className="inline w-52">
              <img src={logoIcon} alt="Logo" />
            </a>
            <div className="flex items-center gap-6">
              <a href="/Dashboard" className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out">Dashboard</a>
              <a href="/DataKaryawan" className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out">Data Karyawan</a>
              <a href="/Struktur" className="text-white hover:text-gray-300 hover:underline p-2 rounded-md text-md font-medium transition duration-300 ease-in-out">Struktur</a>
              <div className="relative" ref={notificationDropdownRef}>
                        <FaBell
                            className="text-white hover:bg-white hover:text-custom-blue cursor-pointer rounded-full p-1 transition duration-300 ease-in-out"
                            size={34}
                            onClick={toggleNotificationDropdown}
                        />
                        {isNotificationDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-md shadow-lg">
                            <div className="p-4 border-b border-gray-200">
                                <span className="font-bold">Notifications</span>
                            </div>
                            <div className="p-2">
                                <div className="mb-2 p-2 border-b border-gray-200 hover:bg-gray-100">
                                    <span className="font-bold">Title 1</span>
                                    <p className="text-gray-600">Content 1</p>
                                </div>
                                <div className="mb-2 p-2 border-b border-gray-200 hover:bg-gray-100">
                                    <span className="font-bold">Title 2</span>
                                    <p className="text-gray-600">Content 2</p>
                                </div>
                                <div className="mb-2 p-2 border-b border-gray-200 hover:bg-gray-100">
                                    <span className="font-bold">Title 3</span>
                                    <p className="text-gray-600">Content 3</p>
                                </div>
                            </div>
                            <div className="p-2 -mt-2 mb-2 border-gray-200 text-center">
                                <a href="#" className="font-light text-custom-blue hover:underline">See All</a>
                            </div>
                        </div>
                        )}
                    </div>
                    <div className="relative" ref={profileDropdownRef}>
                        <FaUser
                            className="text-white hover:bg-white hover:text-custom-blue cursor-pointer hover:rounded-full rounded-full p-1 transition duration-300 ease-in-out"
                            size={36}
                            onClick={toggleProfileDropdown}
                        />
                        {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                                <a href="#" className="flex items-center justify-between font-medium px-4 py-2 text-sm hover:bg-gray-100">
                                    Profile
                                    <img src={logoutIcon}/>
                                </a>
                                <a href="#" className="flex items-center justify-between font-medium px-4 py-2 text-sm hover:bg-gray-100" onClick={handleLogout}>
                                    Logout
                                    <img src={logoutIcon}/>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
    
    export default NavbarAdmin;