import React, { useState } from "react";
import { FaHome, FaFileAlt, FaUser, FaPlus, FaBars, FaImage, FaWarehouse } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../userContext/UserContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Hook per ottenere il percorso corrente
  const user = useUser();

  const handleLogout = async () => {
    try {
      await doSignOut(); // Chiama la funzione di logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Funzione per verificare se il link è attivo
  const isActive = (path) => location.pathname === path;

  return (
    <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:block w-64 h-screen border border-gray-600 bg-white flex flex-col fixed top-0 left-0 overflow-y-auto`}
      >
        <div className="flex justify-between p-4 bg-gray-900">
          <h2 className="text-xl text-white">Menu</h2>
        </div>

        <nav className="flex-grow">
          <ul>
            <li
              className={`px-4 py-2 flex items-center ${
                isActive("/home") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
              }`}
            >
              <FaHome className="mr-2" />
              <Link to="/home" className="flex-1 py-3">
                Home
              </Link>
            </li>
            <li
              className={`px-4 py-2 flex items-center ${
                isActive("/document-archive") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
              }`}
            >
              <FaFileAlt className="mr-2" />
              <Link to="/document-archive" className="flex-1 py-3">
                Documenti salvati
              </Link>
            </li>
            <li
              className={`px-4 py-2 flex items-center ${
                isActive("/load-signed-document") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
              }`}
            >
              <FaPlus className="mr-2" />
              <Link to="/load-signed-document" className="flex-1 py-3">
                Carica documenti firmati
              </Link>
            </li>
            

            <li
            className={`px-4 py-2 flex items-center ${
              isActive("/gallery") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
            }`}
            >
               <FaImage className="mr-2" />
               <Link to="/gallery" className="flex-1 py-3">
               Galleria
               </Link>
            </li>

            <li
              className={`px-4 py-2 flex items-center ${
                isActive("/profile") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
              }`}
            >
              <FaUser className="mr-2" />
              <Link to="/profile" className="flex-1 py-3">
                Profilo
              </Link>
            </li>

            {/* Mostra il link "Archivio" solo se l'email è utente@1.it */}
            {user?.email === "utente@1.it" && (
              <li
                className={`px-4 py-2 flex items-center ${
                  isActive("/archive") ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                }`}
              >
                <FaFileAlt className="mr-2" />
                <Link to="/archive" className="flex-1 py-3">
                  Archivio
                </Link>
              </li>
            )}

            <li
              className="px-4 py-2 hover:bg-gray-700 flex items-center cursor-pointer"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
              <span className="flex-1 py-3">LogOut</span>
            </li>
          </ul>
        </nav>

        <p className="flex text-xs text-gray-700 inline-block mt-0 ml-4 mb-2">
          <FaUser className="mr-1" /> {user?.email || "Non disponibile..."}
        </p>
      </div>
  );
};

export default Sidebar;
