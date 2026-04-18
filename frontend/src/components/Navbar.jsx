import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [token, setToken] = useState(() => !!localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  useEffect(() => {
    const storedToken = !!localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole') || '';
    const storedName = localStorage.getItem('userName') || '';
    setToken(storedToken);
    setUserRole(storedRole);
    setUserName(storedName);

    const handleAuthChange = () => {
      setToken(!!localStorage.getItem('authToken'));
      setUserRole(localStorage.getItem('userRole') || '');
      setUserName(localStorage.getItem('userName') || '');
    };
    window.addEventListener('authchange', handleAuthChange);
    return () => window.removeEventListener('authchange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('doctorId');
    setToken(false);
    setUserRole('');
    setUserName('');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const commonLinks = (
    <>
      <NavLink onClick={() => setShowMenu(false)} to="/"><p className="px-4 py-2 rounded inline-block">Home</p></NavLink>
      <NavLink onClick={() => setShowMenu(false)} to="/doctors"><p className="px-4 py-2 rounded inline-block">All Doctors</p></NavLink>
      <NavLink onClick={() => setShowMenu(false)} to="/about"><p className="px-4 py-2 rounded inline-block">About</p></NavLink>
      <NavLink onClick={() => setShowMenu(false)} to="/contact"><p className="px-4 py-2 rounded inline-block">Contact</p></NavLink>
    </>
  );

  const getRoleMenu = () => {
    if (userRole === 'admin') {
      return (
        <>
          {commonLinks}
          <NavLink onClick={() => setShowMenu(false)} to="/admin-dashboard"><p className="px-4 py-2 rounded inline-block font-medium">Dashboard</p></NavLink>
        </>
      );
    }
    if (userRole === 'doctor') {
      return (
        <>
          {commonLinks}
          <NavLink onClick={() => setShowMenu(false)} to="/doctor-dashboard"><p className="px-4 py-2 rounded inline-block font-medium">Dashboard</p></NavLink>
        </>
      );
    }
    // Regular user
    return (
      <>
        {commonLinks}
        {!token && (
          <button
            onClick={() => { setShowMenu(false); navigate("/login"); }}
            className="bg-primary text-white px-8 py-3 rounded-full font-light mt-2"
          >
            Create Account
          </button>
        )}
      </>
    );
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img onClick={() => navigate('/')} className="w-44 cursor-pointer" src={assets.logo} alt="" />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to={"/"}><li className="py-1">Home</li><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink>
        <NavLink to={"/doctors"}><li className="py-1">All Doctors</li><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink>
        <NavLink to={"/about"}><li className="py-1">About</li><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink>
        <NavLink to={"/contact"}><li className="py-1">Contact</li><hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" /></NavLink>
      </ul>
      <div className="flex item-center gap-4">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={assets.profile_pic} alt="" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                {userRole === 'admin' && (
                  <p onClick={() => navigate('/admin-dashboard')} className="hover:text-black cursor-pointer">Admin Dashboard</p>
                )}
                {userRole === 'doctor' && (
                  <p onClick={() => navigate('/doctor-dashboard')} className="hover:text-black cursor-pointer">Doctor Dashboard</p>
                )}
                {userRole === 'user' && (
                  <>
                    <p onClick={() => navigate('/myprofile')} className="hover:text-black cursor-pointer">My Profile</p>
                    <p onClick={() => navigate('/myappointments')} className="hover:text-black cursor-pointer">My Appointments</p>
                  </>
                )}
                <p onClick={handleLogout} className="hover:text-black cursor-pointer">Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create Account
          </button>
        )}
        <img onClick={() => setShowMenu(true)} className="w-6 md:hidden" src={assets.menu_icon} alt="" />
        {/* Mobile Menu */}
        <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img className="w-7" onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="" />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            {getRoleMenu()}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
