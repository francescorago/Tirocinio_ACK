import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useUser } from "../userContext/UserContext";
import PdfUploader from "./PdfUploader";
import PDFPrinter from "./PDFPrinter";

const LoadDocument = () => {
  const [documents, setDocuments] = useState([]); // State for documents
  const [loading, setLoading] = useState(true); // State for loading
  const user = useUser();

  const fetchDocuments = () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "SignedPDF"), where("user", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const updatePDFPrinter = () => {
    fetchDocuments(); // Richiama la funzione per aggiornare i documenti
  };

  useEffect(() => {
    if (user && user.id) {
      fetchDocuments();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (!user || !user.id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="font-bold text-xl">Utente non autenticato.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center ml-64 p-4">
      <h2 className="font-bold text-3xl">Carica un documento firmato</h2>
      <label className="font-bold text-md mt-6">
        In questa pagina puoi caricare i documenti firmati e visualizzare i
        documenti che hai caricato in passato
      </label>
      <PdfUploader onUploadSuccess={updatePDFPrinter} /> {/* Passa la funzione */}
      <PDFPrinter documents={documents} /> {/* Passa i documenti aggiornati */}
    </div>
  );
};

export default LoadDocument;
