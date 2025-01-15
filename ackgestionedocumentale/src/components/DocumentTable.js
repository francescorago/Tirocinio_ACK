import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faPencil,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { useTranslation } from "react-i18next";


const DocumentTable = ({ documents = [], onDocumentClick }) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 8; // Numero di documenti per pagina
  const navigate = useNavigate();

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const versionMap = useMemo(() => {
    return documents.reduce((acc, doc) => {
      const docId = doc.id_document;
      const version = parseFloat(doc.version);
      if (!acc[docId] || version > acc[docId]) {
        acc[docId] = version;
      }
      return acc;
    }, {});
  }, [documents]);

  // Filtrare i documenti
  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;

    return documents.filter((doc) => {
      const idLast8 = doc.id_document?.slice(-8);
      return idLast8?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [documents, searchTerm]);

  const sortedDocuments = useMemo(() => {
    if (!Array.isArray(filteredDocuments)) return [];

    const sorted = [...filteredDocuments].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        const dateA = a.uploadDate?.toDate();
        const dateB = b.uploadDate?.toDate();
        comparison = dateA > dateB ? 1 : -1;
      } else if (sortBy === "version") {
        comparison = parseFloat(a.version) > parseFloat(b.version) ? 1 : -1;
      } else if (sortBy === "valid") {
        const isValidA = versionMap[a.id_document] === parseFloat(a.version);
        const isValidB = versionMap[b.id_document] === parseFloat(b.version);
        comparison = isValidA === isValidB ? 0 : isValidA ? 1 : -1;
      } else if (sortBy === "id_document") {
        comparison = a.id_document.localeCompare(b.id_document);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [filteredDocuments, sortOrder, sortBy, versionMap]);

  // Pagina i documenti
  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = sortedDocuments.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const totalPages = Math.ceil(sortedDocuments.length / documentsPerPage);

  const handleCreation = () => {
    navigate("/create-document");
  };

  const handlePDF = async (docId) => {
    try {
      const docRef = doc(db, "signedPDF", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fileURL = docSnap.data().fileURL;
        if (fileURL) {
          window.open(fileURL, "_blank");
        }
      } else {
        console.log("Nessun documento trovato per questo ID!");
      }
    } catch (error) {
      console.error("Errore nell'aprire il PDF:", error);
    }
  };

  return (
    <div className="w-9/10 mr-10 ml-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <label className="text-gray-700 mb-1">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
            Cerca un documento
          </label>
          <input
            type="text"
            placeholder="Cerca per numero di serie "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="ml-4 mt-6 border border-blue-300 rounded-lg p-4">
          <button
            onClick={handleCreation}
            className="flex items-center text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            <span className="text-xl">Crea un nuovo documento</span>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <table className="min-w-full bg-white border border-gray-200 mb-8">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th
                className="py-3 px-4 text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("id_document")}
              >
                Numero di Serie{" "}
                {sortBy === "id_document"
                  ? sortOrder === "asc"
                    ? "↓"
                    : "↑"
                  : ""}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Data{" "}
                {sortBy === "date" ? (sortOrder === "asc" ? "↓" : "↑") : ""}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("version")}
              >
                Versione{" "}
                {sortBy === "version" ? (sortOrder === "asc" ? "↓" : "↑") : ""}
              </th>
              <th
                className="py-3 px-4 text-left text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("valid")}
              >
                Valido{" "}
                {sortBy === "valid" ? (sortOrder === "asc" ? "↓" : "↑") : ""}
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody>
            {currentDocuments.length > 0 ? (
              currentDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-200"
                  onClick={() => onDocumentClick(doc)}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {doc.id_document?.toUpperCase() || "Senza Numero"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {(doc.uploadDate &&
                      doc.uploadDate.toDate().toLocaleString("it-IT", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })) ||
                      "Senza Data"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {doc.version?.toUpperCase() || "Senza Versione"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 flex items-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        !doc.id_document
                          ? "bg-yellow-500"
                          : versionMap[doc.id_document] ===
                            parseFloat(doc.version)
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex space-x-4">
                      <Link to={`/edit-signed-document/${doc.id}`}>
                        <button
                          className="text-green-600 hover:text-green-700 focus:outline-none"
                          aria-label="Edit Document"
                        >
                          <FontAwesomeIcon icon={faPencil} size="2xl" />
                        </button>
                      </Link>
                      <button
                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        aria-label="Create PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePDF(doc.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faFilePdf} size="2xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Nessun documento firmato esistente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Controlli di Paginazione */}
      <div className="flex justify-between items-center mb-8">
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

export default DocumentTable;
