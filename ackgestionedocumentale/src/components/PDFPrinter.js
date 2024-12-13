import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase'; // Assicurati di importare Firestore
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage'; // Importa da firebase/storage
import { useUser } from '../userContext/UserContext';
import { FaEye, FaTrash } from "react-icons/fa"; // Importa l'icona del cestino

function PDFPrinter() {
  const [userFiles, setUserFiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filesPerPage] = useState(5); // Numero di file per pagina
  const [sortField, setSortField] = useState('fileName'); // Campo per ordinare
  const [sortOrder, setSortOrder] = useState('asc'); // Ordine di ordinamento
  const user = useUser();

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const q = query(collection(db, 'signedPDF'), where('userId', '==', user.id)); // Query per ottenere i file dell'utente
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setUserFiles(files);
      } catch (error) {
        console.error("Errore nel recupero dei file:", error);
      }
    };

    fetchUserFiles();
  }, [user.id]);

  // Funzione per ordinare i file
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
    setCurrentPage(1); // Reset pagina corrente
  };

  // Funzione per rimuovere un file dalla collezione e dallo storage
  const deleteFile = async (fileId, fileURL) => {
    const storage = getStorage();
    const fileRef = ref(storage, fileURL); // Crea un riferimento allo Storage usando l'URL del file

    try {
      // Elimina il file dallo Storage
      await deleteObject(fileRef);
      
      // Elimina il documento da Firestore
      await deleteDoc(doc(db, 'signedPDF', fileId));
      
      // Aggiorna lo stato locale rimuovendo il file eliminato
      setUserFiles(userFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Errore durante l'eliminazione del file:", error);
    }
  };

  // Calcola l'indice dei file da visualizzare nella pagina corrente
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = userFiles.slice(indexOfFirstFile, indexOfLastFile);

  // Funzione per cambiare pagina
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Stili Inline
  const styles = {
    container: {
      margin: '20px auto',
      width: '80%',
      maxWidth: '800px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      overflow: 'hidden',
      padding: '20px',
      backgroundColor: '#f9f9f9',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    thead: {
      backgroundColor: '#3B82F6',
      color: 'white',
    },
    th: {
      padding: '15px',
      textAlign: 'left',
      fontWeight: 'bold',
    },
    tbody: {},
    tr: {
      transition: 'background-color 0.2s ease',
    },
    trHover: {
      backgroundColor: '#f1f1f1',
    },
    td: {
      padding: '15px',
      textAlign: 'left',
      borderBottom: '1px solid #ddd',
    },
    link: {
      color: '#2196F3',
      textDecoration: 'none',
    },
    linkHover: {
      textDecoration: 'underline',
    },
    noFiles: {
      textAlign: 'center',
      fontSize: '1.2em',
      color: '#777',
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333',
    },
    sortButtons: {
      marginBottom: '10px',
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
    },
    sortButton: {
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      listStyle: 'none',
      padding: 0,
      marginTop: '20px',
    },
    pageItem: {
      margin: '0 5px',
      cursor: 'pointer',
    },
    pageLink: {
      padding: '8px 12px',
      borderRadius: '4px',
      backgroundColor: '#3B82F6',
      color: 'white',
      textDecoration: 'none',
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    pageLinkDisabled: {
      backgroundColor: '#ccc',
      cursor: 'default',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>File Caricati</h2>

      {/* Bottoni di ordinamento */}
      <div className='flex justify-between mb-2'>
        <button
          
          onClick={() => sortFiles('fileName')}
        >
          Ordina per Nome {sortField === 'fileName' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
  
          onClick={() => sortFiles('uploadDate')}
        >
          Ordina per Data {sortField === 'uploadDate' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {userFiles.length > 0 ? (
        <>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Nome File</th>
                <th style={styles.th}>Data di Caricamento</th>
                <th style={styles.th}>Azioni</th> {/* Cambiato da "Visualizza" a "Azioni" */}
              </tr>
            </thead>
            <tbody>
              {currentFiles.map((file) => (
                <tr
                  key={file.id}
                  style={{
                    ...styles.tr,
                    ...(file.hover && styles.trHover),
                  }}
                >
                  <td style={styles.td}>{file.fileName}</td>

                  <td style={styles.td}>
                    {new Date(file.uploadDate.toDate()).toLocaleString()}
                  </td>
                  <td style={styles.td} > {/* Aggiunta classe flex per layout inline */}
                    <div className='flex justify-center gap-6'>
                    <a
                      href={file.fileURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      <FaEye />
                    </a>
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginazione */}
          <ul style={styles.pagination}>
            <li
              style={{
                ...styles.pageItem,
                ...(currentPage === 1 ? styles.pageLinkDisabled : {}),
              }}
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            >
              <a style={styles.pageLink}>Precedente</a>
            </li>
            {Array.from({ length: Math.ceil(userFiles.length / filesPerPage) }, (_, i) => (
              <li
                key={i + 1}
                style={{
                  ...styles.pageItem,
                  ...(currentPage === i + 1 ? styles.pageLinkDisabled : {}),
                }}
                onClick={() => paginate(i + 1)}
              >
                <a style={styles.pageLink}>{i + 1}</a>
              </li>
            ))}
            <li
              style={{
                ...styles.pageItem,
                ...(currentPage === Math.ceil(userFiles.length / filesPerPage)
                  ? styles.pageLinkDisabled
                  : {}),
              }}
              onClick={() =>
                currentPage < Math.ceil(userFiles.length / filesPerPage) &&
                paginate(currentPage + 1)
              }
            >
              <a style={styles.pageLink}>Successivo</a>
            </li>
          </ul>
        </>
      ) : (
        <p style={styles.noFiles}>Nessun file caricato.</p>
      )}
    </div>
  );
}

export default PDFPrinter;
