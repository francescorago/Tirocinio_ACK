import React, { useState, useRef } from 'react';
import { storage, db } from '../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from "firebase/storage";
import { v4 } from 'uuid';
import { addDoc, collection } from 'firebase/firestore';
import { useUser } from '../userContext/UserContext';
import { PDFDocument, rgb } from 'pdf-lib';  // Aggiunto rgb per il colore della scritta
import { FaPlus, FaTimes } from 'react-icons/fa'; 
import Swal from 'sweetalert2';
import pdfToText from 'react-pdftotext';
import { query, where, getDocs } from 'firebase/firestore';  // Aggiungi queste importazioni
import { useTranslation } from "react-i18next";

function PdfUploader() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [downloadURL, setDownloadURL] = useState('');
  const [isSigned, setIsSigned] = useState(false);
  const [extractedCode, setExtractedCode] = useState("");  
  const [extractedVersion, setExtractedVersion] = useState("");  

  const [uploadProgress, setUploadProgress] = useState(0);  // Stato per la barra di caricamento

  const user = useUser();
  const fileInputRef = useRef(null);

  const modifyPDF = async (pdfBytes, text, version) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();
  
      // Definisci le coordinate e la dimensione del rettangolo bianco
      const rectX = 10;
      const rectY = height - 50;
      const rectWidth = 300;
      const rectHeight = 150;
  
      // Aggiungi il rettangolo bianco sopra la vecchia versione
      firstPage.drawRectangle({
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
        color: rgb(1, 1, 1),  // Bianco
      });
  
      // Aggiungi la versione al testo che verrà scritto sul PDF
      const fullText = `${text} - Versione ${version}`;
  
      // Scrivi il testo sopra il rettangolo bianco
      firstPage.drawText(fullText, {
        x: rectX ,  // Spostiamo il testo un po' a destra per non essere sul bordo del rettangolo
        y: rectY , // Spostiamo il testo un po' più in alto all'interno del rettangolo
        size: 20,
        color: rgb(0, 0, 0),  // Colore nero per il testo
      });
  
      const modifiedPdfBytes = await pdfDoc.save();
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Errore nella modifica del PDF:', error);
      throw new Error('La modifica del PDF non è riuscita.');
    }
  };
  
  
  
  const extractText = (event) => {
    const file = event.target.files[0];
    setFile(file);     
    setFileName(file.name); 

    pdfToText(file)
      .then(text => {
        console.log(text); 
        const regex = /\d{6} \/ \d{4} \/ [A-Za-z]{2}\d{6}/;
        const versionRegex = /\d+\.\d+/;      
        const foundCode = text.match(regex);
        if (foundCode) {
          console.log("Codice trovato:", foundCode[0]);
          setExtractedCode(foundCode[0]);
        } else {
          console.log("Nessun codice trovato");
          setExtractedCode("");  
        }
        const foundVersion = text.match(versionRegex);
        if (foundVersion) {
          console.log("Versione trovata:", foundVersion[0]);
          setExtractedVersion(foundVersion[0]);
        } else {
          console.log("Nessuna versione trovata");
          setExtractedVersion("");
        }
      })
      .catch(error => console.error("Errore durante l'estrazione del testo dal PDF:", error));
  };


  const handleClick = async () => {
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Attenzione',
        text: 'Seleziona un file prima di caricarlo!',
      });
      return;
    }
  
    const uniqueId = v4(); 
    const fileRef = ref(storage, `file/${uniqueId}.pdf`);
    const fileCopyRef = ref(storage, `file-copy/${uniqueId}.pdf`);
    
    try {
      // Controlla se esiste già un documento con lo stesso codice nel database
      const q = query(collection(db, "signedPDF"), where("id_document", "==", extractedCode));
      const querySnapshot = await getDocs(q);
  
      let newVersion = "1.0";  // Imposta la versione iniziale
  
      // Se esiste già un documento, incrementa la versione
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0].data();
        const lastVersion = lastDoc.version; // Versione corrente esistente nel database
        
        if (lastVersion) {
          const [major, minor] = lastVersion.split('.').map(Number); // Split della versione esistente
          newVersion = `${major + 1}.0`;  // Incrementa la versione principale
        }
      }
    
      const arrayBuffer = await file.arrayBuffer();
  
      // Modifica del PDF in parallelo, passando anche la newVersion
      const [originalModifiedPdfBytes, copyModifiedPdfBytes] = await Promise.all([
        modifyPDF(arrayBuffer, 'Documento Originale', newVersion),   // Passa la versione corretta
        modifyPDF(arrayBuffer, 'Copia Archivio', newVersion)  // Passa la versione corretta
      ]);
  
      const metadata = { contentType: 'application/pdf' };
  
      // Caricamento dei file in parallelo
      const uploadTask = uploadBytesResumable(fileRef, originalModifiedPdfBytes, metadata);
      const copyUploadTask = uploadBytes(fileCopyRef, copyModifiedPdfBytes, metadata);
  
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        }, 
        (error) => {
          console.error("Errore durante il caricamento:", error);
          Swal.fire({
            icon: 'error',
            title: 'Errore',
            text: 'Errore durante il caricamento del file. Riprovare.',
          });
        }, 
        async () => {
          const [url, copyUrl] = await Promise.all([
            getDownloadURL(uploadTask.snapshot.ref),
            copyUploadTask.then(() => getDownloadURL(fileCopyRef))
          ]);
  
          setDownloadURL(url);
  
          // Salva i metadati su Firestore in parallelo
          await Promise.all([
            addDoc(collection(db, "signedPDF"), {
              userId: user.id,
              fileName: file.name,
              fileURL: url,
              uploadDate: new Date(),
              isSigned: isSigned,
              id_document: extractedCode,
              version: newVersion  // Salva la nuova versione
            }),
            addDoc(collection(db, "documents"), {
              userId: user.id,
              fileName: `Copia - ${file.name}`,
              fileURL: copyUrl,
              uploadDate: new Date(),
              isSigned: isSigned,
              id_document: extractedCode,
              version: newVersion  // Salva la nuova versione
            })
          ]);
  
          Swal.fire({
            icon: 'success',
            title: 'Caricamento completato!',
            text: `Il file "${file.name}" è stato caricato con successo.`,
            confirmButtonText: 'OK'
          }).then(() => {
            window.location.reload();
          });
        }
      );
    } catch (error) {
      console.error("Errore nel caricamento del file:", error);
      Swal.fire({
        icon: 'error',
        title: 'Errore',
        text: 'Si è verificato un errore durante il caricamento del file. Per favore riprova.',
      });
    }
  };
  

  
  
  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setIsSigned(false);
    setDownloadURL("");
    setUploadProgress(0);  // Resetta la barra di caricamento

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '30vh',
      width: '55%',
      backgroundColor: '#f0f2f5',
      marginTop: '20px'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
    },
    uploadButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: '#3B82F6',
      color: 'white',
      width: '100px',
      height: '100px',
      cursor: 'pointer',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.3s ease',
      border: 'none',
    },
    fileInput: {
      display: 'none',
    },
    fileNameContainer: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '10px',
      fontSize: '1.1em',
      fontWeight: 'bold',
      color: '#333',
    },
    removeButton: {
      marginLeft: '10px',
      color: '#ff4d4d',
      cursor: 'pointer',
      fontSize: '1.2em',
      transition: 'color 0.3s ease',
    },
    progressBarContainer: {
      width: '100%',
      height: '10px',
      backgroundColor: '#e0e0e0',
      borderRadius: '5px',
      marginTop: '20px',
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: '5px',
      width: `${uploadProgress}%`,
      transition: 'width 0.3s ease',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        <label htmlFor="file-upload" style={styles.uploadButton}>
          <FaPlus size={40} />
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={extractText}
          ref={fileInputRef} 
          style={styles.fileInput}
        />
        <button onClick={handleClick} style={styles.uploadButton}>
          Carica
        </button>
      </div>
      {fileName && (
        <div style={styles.fileNameContainer}>
          File selezionato: {fileName}
          <FaTimes
            onClick={handleRemoveFile}
            style={styles.removeButton}
            title="Rimuovi file"
          />
        </div>
      )}
      {uploadProgress > 0 && (
        <div style={styles.progressBarContainer}>
          <div style={styles.progressBar}></div>
        </div>
      )}
    </div>
  );
}

export default PdfUploader;
