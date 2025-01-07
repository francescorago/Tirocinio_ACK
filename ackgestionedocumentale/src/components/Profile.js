import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { db } from "../firebase/firebase";
import { useUser } from "../userContext/UserContext"; 
import usergrey from "../assets/usergrey.png";


const Profile = () => {
    const user = useUser();

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
        <img
            src={usergrey}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
        </div>
      </div>

      
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Informazioni personali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-gray-500">Nome:{" "}</p>
            <p>{user ? user.informazioniUtente.nome : "Nome"}</p>
          </div>
          <div>
            <p className="text-gray-500">Cognome:</p>
            <p>{user ? user.informazioniUtente.cognome : "Cognome"}</p>
          </div>
          <div>
            <p className="text-gray-500">Email:</p>
            <p>{user ? user.email : "Email"}</p>
          </div>
          <div>
            <p className="text-gray-500">Codice Fiscale:</p>
            <p>{user ? user.informazioniUtente.codiceFiscale : "Codice Fiscale"}</p>
          </div>
          <div>
            <p className="text-gray-500">Indirizzo:</p>
            <p>{user ? user.informazioniUtente.indirizzo : ""}</p>
          </div>
          <div>
            <p className="text-gray-500">Partita IVA:</p>
            <p>{user ? user.informazioniUtente.partitaIVA : "PartitaIVA"}</p>
          </div>
          <div>
            <p className="text-gray-500">Tipo Utente:</p>
            <p>{user ? user.informazioniUtente.ruolo : "Ruolo"}</p>
          </div>
          <div>
            <p className="text-gray-500">Nazione:</p>
            <p>{user ? user.informazioniUtente.nazione : "Nazione"}</p>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Profile;