import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { AuthProvider } from "./context/authContext";

import Login from "./auth/login/index";
import ResetPassword from "./auth/login/resetPsswd";
import Register from "./auth/register/index";
import Home from "../src/components/home";
import DocumentCreation from "./components/DocumentCreation";
import DocumentArchive from "./components/DocumentArchive";
import Sidebar from "./components/SideBar"; // Importa il componente Sidebar
import NotFound from "./components/notFound/NotFound";
import Profile from "./components/Profile";
import "../src/App.css";
import DocumentEdit from "./components/DocumentEdit";
import SignedDocumentEdit from "./components/SignedDocumentEdit";
import LoadDocument from "./components/LoadDocument";
import { useUser } from "../src/userContext/UserContext";
import { FaUser } from "react-icons/fa";
import AdminArchive from "./components/AdminArchive";
import Gallery from "./components/Gallery";


function App() {
  const location = useLocation(); // Usa useLocation per ottenere il percorso corrente
  const user = useUser();

  const routesArray = [
    {
      path: "/",
      element: <Navigate to="/login" />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/home",
      element: <Home />, // Assicurati che Home sia configurato correttamente
    },
    {
      path: "/create-document",
      element: <DocumentCreation />,
    },
    {
      path: "/document-archive",
      element: <DocumentArchive />,
    },
    {
      path: "/warehouse",
      elemente: <warehouse/>,
    },
    {
      path: "/edit-document/:id",
      element: <DocumentEdit />,
    },
    {
      path: "/edit-signed-document/:id",
      element: <SignedDocumentEdit />
    },
    {
      path: "/load-signed-document",
      element: <LoadDocument />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/reset",
      element: <ResetPassword />,
    },
    { path: "/gallery",
      element: <Gallery/>
    },
    {
      path: "/archive",
      element: <AdminArchive />,
    },
   
    /*
    {
      path: "*",
      element: <NotFound />,
    },
    */
  ];

  let routesElement = useRoutes(routesArray);

  const shouldHideHeader =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/reset" ||
    routesElement.type === NotFound; // Controlla se routesElement è di tipo NotFound

  return (
    <AuthProvider>
      <div className="flex w-full h-screen">
        {!shouldHideHeader && <Sidebar />}{" "}
        {/* Mostra la sidebar solo se non siamo in login/register */}
        <div className="w-full h-full">

          {/* Contenuto principale */}
          {routesElement}
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;