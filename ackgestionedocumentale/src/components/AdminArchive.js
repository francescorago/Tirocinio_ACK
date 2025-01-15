import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { useUser } from '../userContext/UserContext';
import { FaEye, FaTrash } from "react-icons/fa";

function UserArchive() {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useUser(); // Contesto utente per ottenere l'ID dell'utente autenticato

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user) {
        console.error("Nessun utente autenticato.");
        return;
      }

      try {
        // Recupera solo i documenti associati all'utente autenticato
        const fileQuery = query(
          collection(db, 'documents'),
          where('userId', '==', user.id) // Filtra per ID utente
        );
        const fileSnapshot = await getDocs(fileQuery);

        const files = fileSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserFiles(files);
      } catch (error) {
        console.error("Errore nel recupero dei file:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [user]);

  const deleteFile = async (fileId, fileURL) => {
    const storage = getStorage();
    const fileRef = ref(storage, fileURL);

    try {
      // Elimina il file dal database e dallo storage
      await deleteObject(fileRef);
      await deleteDoc(doc(db, 'documents', fileId));
      setUserFiles(userFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Errore durante l'eliminazione del file:", error);
    }
  };

  return (
    <div className="ml-64 p-4">
      <h2 className="text-center text-3xl font-bold mb-4">Archivio Personale</h2>
      <p className="text-center mb-6">Visualizza e gestisci i tuoi documenti caricati.</p>

      <div className="bg-gray-100 p-4 rounded shadow-md">
        {loading ? (
          <p className="text-center">Caricamento in corso...</p>
        ) : userFiles.length > 0 ? (
          <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold">Nome File</th>
                <th className="py-4 px-6 text-left text-sm font-semibold">Data di Caricamento</th>
                <th className="py-4 px-6 text-left text-sm font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {userFiles.map((file) => (
                <tr key={file.id} className="transition hover:bg-gray-100">
                  <td className="py-3 px-6 border-b border-gray-300">{file.fileName}</td>
                  <td className="py-3 px-6 border-b border-gray-300">
                    {file.uploadDate ? new Date(file.uploadDate.toDate()).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3 px-6 border-b border-gray-300">
                    <div className="flex justify-center space-x-4">
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
        ) : (
          <p className="text-center text-lg text-gray-500">Nessun file trovato.</p>
        )}
      </div>
    </div>
  );
}

export default UserArchive;
