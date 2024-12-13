import React, { useEffect, useState } from "react";
import DocumentTable from "./DocumentTable";
import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "../userContext/UserContext";

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true); // Stato per caricamento
  const user = useUser();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user || !user.id) {
        setLoading(false); // Se non c'è un utente disponibile
        return;
      }

      try {
        const querySnapshot = collection(db, "signedPDF");
        const q = query(querySnapshot, where("userId", "==", user.id));
        const docSnap = await getDocs(q);

        const docs = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Documenti caricati:", docs); // Log per verificare i documenti caricati
        setDocuments(docs);
      } catch (error) {
        console.error("Errore nel recupero dei documenti:", error);
      } finally {
        setLoading(false); // Terminare il caricamento
      }
    };

    fetchDocuments();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Caricamento in corso...</div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-4">
      <div className="flex justify-center text-3xl mt-4 mb-4 font-bold">
        Benvenuto {user ? user.informazioniUtente.nome : "Utente"}
      </div>
      <div className="flex justify-center text-xl mt-4 mb-4 ">
        Ecco la tua lista di documenti firmatii
        
      </div>
    
      <DocumentTable
        documents={documents}
        onDocumentClick={(doc) => console.log(doc)}
      />
    </div>
  );
};

export default Home;
