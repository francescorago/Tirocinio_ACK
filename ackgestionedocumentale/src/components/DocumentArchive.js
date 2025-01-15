import React, { useState, useEffect, useMemo } from "react";
import { FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faEdit } from "@fortawesome/free-solid-svg-icons"; 
import {
  doc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  documentId,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import Swal from "sweetalert2";
import { useUser } from "../userContext/UserContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DocumentArchive = () => {
  const [documents, setDocuments] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 20; // Numero di documenti per pagina
  const user = useUser();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user || !user.id) {
        return;
      }

      try {
        const docRef = collection(db, "documentiAssociati");
        const q = query(docRef, where("id_utente", "==", user.id));
        const docSnap = await getDocs(q);
        const docs = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDocuments(docs);
      } catch (error) {
        console.error("Errore durante il caricamento dei documenti:", error);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Sei sicuro di voler eliminare questo documento?",
      showDenyButton: true,
      confirmButtonText: "Elimina",
      denyButtonText: "Annulla",
      confirmButtonColor: "red",
      denyButtonColor: "green",
    });

    if (result.isConfirmed) {
      try {
        const userDocRef = doc(db, "documentiAssociati", id);
        const docSnap = await getDocs(
          query(
            collection(db, "documentiAssociati"),
            where("id_utente", "==", user.id),
            where(documentId(), "==", id)
          )
        );

        if (!docSnap.empty) {
          await deleteDoc(userDocRef);
          Swal.fire({
            title: "Eliminazione avvenuta con successo!",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "green",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire("Errore", "Questo documento non ti appartiene o non esiste.", "error");
        }
      } catch (error) {
        Swal.fire("Errore durante l'eliminazione", "", "error");
      }
    } else if (result.isDenied) {
      Swal.fire("Operazione annullata", "", "info");
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  const sortedDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return [...documents].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.id_documento.localeCompare(b.id_documento);
      } else {
        return b.id_documento.localeCompare(a.id_documento);
      }
    });
  }, [documents, sortOrder]);

  // Paginazione
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = sortedDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const totalPages = Math.ceil(sortedDocuments.length / documentsPerPage);

  return (
    <div className="ml-64 p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 flex justify-center">
          Archivio Documenti Salvati
        </h1>
        <p className="text-center">
          In questa pagina sono presenti tutti i documenti che sono stati salvati, in attesa di completamento o di firma.
        </p>
      </div>

      <button
        onClick={toggleSortOrder}
        className="text-blue-500 hover:text-blue-700 mb-4"
      >
        Ordina per ID Documento {sortOrder === "asc" ? "↓" : "↑"}
      </button>

      <div className="overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 mb-8">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">
                ID Documento
              </th>
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">
                Data Creazione
              </th>
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">
                Stato
              </th>
              <th className="py-3 px-4 text-left text-sm font-bold text-gray-700">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.length > 0 ? (
              currentDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {doc.id_documento || "Senza ID"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {(doc.Data_creazione &&
                      doc.Data_creazione.toDate().toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })) ||
                      "Senza Data"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {doc.signed ? "Firmato" : "In completamento"}
                  </td>
                  <td>
                    <div className="flex space-x-4">
                      <Link to={`/edit-document/${doc.id}`}>
                        <button
                          className="text-green-600 hover:text-green-700 focus:outline-none"
                          aria-label="Edit Document"
                        >
                          <FontAwesomeIcon icon={faEdit} size="xl" />
                        </button>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        aria-label="Delete Document"
                      >
                        <FaTrash size={28} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Nessun documento trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controlli di Paginazione */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          Precedente
        </button>
        <span>
          Pagina {currentPage} di {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          Successivo
        </button>
      </div>
    </div>
  );
};

export default DocumentArchive;
