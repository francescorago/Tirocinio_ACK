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
                      <p>{user ? user.informazioniUtente.indirizzo : "Indirizzo"}</p>
                      </div>
                    <div>
                      <p className="text-gray-500">Firma:</p>
                      <p>{user ? user.informazioniUtente.tipoFirma : "Firma"}</p>
                      </div>

                    <div>
                      <p className="text-gray-500">Tipo Utente:</p>
                      <p>{user ? user.informazioniUtente.tipoUtente : "Tipo Utente"}</p>

                      </div>

                    {/* Campi visibili solo per Artista */}
                    {user && user.informazioniUtente.tipoUtente === "Artista" && (
                        <>
                        <div>
                      <p className="text-gray-500">Partita IVA:</p>
                      <p>{user ? user.informazioniUtente.partitaIVA : "Partita IVA"}</p>
                      </div>
                      
                            <div>
                              <p className="text-gray-500">PEC:</p>
                              <p>{user.informazioniUtente.pec || "PEC"}</p>
                              </div>
                            <div>
                              <p className="text-gray-500">Nickname 1:</p>
                              <p>{user.informazioniUtente.nickname1 || "Nickname 1"}</p>
                              
                              </div>
                            <div>
                      <p className="text-gray-500">Indirizzo Laboratorio:</p>
                      <p>{user.informazioniUtente.indirizzoLaboratorio || "Indirizzo Laboratorio"}</p>
                      </div>
                            <div>
                              <p className="text-gray-500">Depositi:</p>
                              <p>{user.informazioniUtente.depositi || "Depositi"}</p>
                              </div>
                            <div>
                              <p className="text-gray-500">Sito Web:</p>
                              <p>{user.informazioniUtente.sitoWeb || "Sito Web"}</p>
                              </div>
                            
                        </>
                    )}

                    {/* Campi visibili solo per Galleria */}
                    {user && user.informazioniUtente.tipoUtente === "Galleria" && (
                        <>
                            <div>
                              <p className="text-gray-500">Sede 1:</p>
                              <p>{user.informazioniUtente.sede1 || "Sede 1"}</p>
                              </div>
                            <div>
                              <p className="text-gray-500">Responsabile Vendite 1:</p>
                              <p>{user.informazioniUtente.responsabileVendite1 || "Responsabile Vendite 1"}</p>
                              </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;