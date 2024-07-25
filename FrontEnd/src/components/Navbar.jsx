// eslint-disable-next-line no-unused-vars
import React from 'react';

function Navbar() {
  return (
    <nav className="bg-custom-blue p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <a href="/"  className="inline w-52 mr-2">
          <img src="src/assets/logo_text.svg"/>
          </a>
        </div>
        <a href="/login">
        <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300 ease-in-out">
            Login
          </button>
        </a>

      </div>
    </nav>
  );
}

export default Navbar;
