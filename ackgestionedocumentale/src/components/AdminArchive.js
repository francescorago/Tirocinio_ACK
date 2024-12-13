import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { FaEye, FaTrash } from "react-icons/fa";
import Lottie from "lottie-react";
import successAnimation from "../assets/animationDocument.json";

function AdminArchive() {
  const [userFiles, setUserFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(10);
  const [sortField, setSortField] = useState('fileName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true); // Stato per il caricamento
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    const fetchFilesWithUserDetails = async () => {
      
      try {
        const fileQuery = query(collection(db, 'documents'));
        const fileSnapshot = await getDocs(fileQuery);

        const filesWithUserDetails = [];

        for (const fileDoc of fileSnapshot.docs) {
          const fileData = fileDoc.data();
          const userRef = doc(db, 'users', fileData.userId);
          const userDoc = await getDoc(userRef);

          const userEmail = userDoc.exists() ? userDoc.data().email : 'Email non trovata';

          filesWithUserDetails.push({
            id: fileDoc.id,
            ...fileData,
            userEmail: userEmail,
          });
        }

        setUserFiles(filesWithUserDetails);
      } catch (error) {
        console.error("Errore nel recupero dei file:", error);
      } finally {
        setLoading(false); // Imposta loading a false dopo che i dati sono stati caricati
      }
    };

    fetchFilesWithUserDetails();
  }, []);

  const sortFiles = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);

    const sortedFiles = [...userFiles].sort((a, b) => {
      if (field === 'uploadDate') {
        return newSortOrder === 'asc'
          ? new Date(a[field].toDate()) - new Date(b[field].toDate())
          : new Date(b[field].toDate()) - new Date(a[field].toDate());
      } else {
        return newSortOrder === 'asc'
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      }
    });

    setUserFiles(sortedFiles);
    setCurrentPage(1);
  };

  const deleteFile = async (fileId, fileURL) => {
    const storage = getStorage();
    const fileRef = ref(storage, fileURL);

    try {
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'documents', fileId));
      setUserFiles(userFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Errore durante l'eliminazione del file:", error);
    }
  };

  // Logica per la paginazione
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = userFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalPages = Math.ceil(userFiles.length / filesPerPage);

  return (
    <div className="ml-64 p-4">
      <h2 className="text-center text-3xl font-bold mb-4">Archivio Admin</h2>
      <p className="text-center mb-6">Di seguito trovi il tuo archivio, dove vengono salvati i documenti di tutti gli utenti della piattaforma</p>

      <div className="bg-gray-100 p-4 rounded shadow-md">
        {/* Mostra l'animazione di caricamento */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-80 pl-60">
            <Lottie
              animationData={successAnimation}
              loop={true}
              onComplete={() => setAnimationFinished(true)}
              className="w-64 h-64"
            />
          </div>
        )}
        {!loading ? (
          <>
            <div className='flex justify-between mb-4'>
              <button onClick={() => sortFiles('fileName')} className="text-blue-600 hover:text-blue-800">
                Ordina per Nome {sortField === 'fileName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => sortFiles('uploadDate')} className="text-blue-600 hover:text-blue-800">
                Ordina per Data {sortField === 'uploadDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>

            {userFiles.length > 0 ? (
              <>
                <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold">Nome File</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold">Data di Caricamento</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold">Caricato da</th>
                      <th className="py-4 px-6 text-left text-sm font-semibold">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFiles.map((file) => (
                      <tr key={file.id} className="transition hover:bg-gray-100">
                        <td className="py-3 px-6 border-b border-gray-300">{file.fileName}</td>
                        <td className="py-3 px-6 border-b border-gray-300">{new Date(file.uploadDate.toDate()).toLocaleString()}</td>
                        <td className="py-3 px-6 border-b border-gray-300">{file.userEmail}</td>
                        <td className="py-3 px-6 border-b border-gray-300">
                          <div className='flex justify-center space-x-4'>
                            <a href={file.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                              <FaEye />
                            </a>
                            <button onClick={() => deleteFile(file.id, file.fileURL)} className="text-red-600 hover:text-red-800">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Controlli di Paginazione */}
                <div className="flex justify-between items-center mt-4 mb-4">
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
              </>
            ) : (
              <p className="text-center text-lg text-gray-500">Nessun file caricato.</p>
            )}
          </>
        ) : (
          <p className="text-center">Caricamento in corso...</p>
        )}
      </div>
    </div>
  );
}

export default AdminArchive;
