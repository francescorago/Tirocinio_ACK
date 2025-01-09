import React, { useState, version } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../userContext/UserContext"; // Importa useUser
import Swal from "sweetalert2"; // Importa SweetAlert2
import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "../style.css";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDocs, query, where } from "firebase/firestore";

const DocumentCreation = () => {
  const user = useUser();

  const generateDocumentId = () => {
    const currentYear = new Date().getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Genera 4 cifre casuali
    const currentDay = new Date().getDate();
    return `${currentYear}/${randomNumber}/${currentDay}`;
  };

  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [text, setText] = useState("");
  const [formData, setFormData] = useState({
    titolo: "",
    altezza: "",
    larghezza: "",
    materiale: "",
    peso: "",
    colore: "",
    stile: "",
    profondità: "",
    version: "1.0",
    data: "",
    codice: "",
  });

  const [selectedOption, setSelectedOption] = useState("");

const [selectedTipoDocumento, setSelectedTipoDocumento] = useState('');
const renderSpecificFields = () => {
  switch (selectedTipoDocumento) {
    case "contrattoCessione":
      return (
        <>
          <div className="mb-4">
            <label htmlFor="nomeCessionario" className="block text-sm font-medium text-gray-700">
              Nome Cessionario:
            </label>
            <input
              type="text"
              name="nomeCessionario"
              id="nomeCessionario"
              value={formData.nomeCessionario || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cognomeCessionario" className="block text-sm font-medium text-gray-700">
              Cognome Cessionario:
            </label>
            <input
              type="text"
              name="cognomeCessionario"
              id="cognomeCessionario"
              value={formData.cognomeCessionario || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dataCessione" className="block text-sm font-medium text-gray-700">
              Data di Cessione:
            </label>
            <input
              type="date"
              name="dataCessione"
              id="dataCessione"
              value={formData.dataCessione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="importoCessione" className="block text-sm font-medium text-gray-700">
              Importo Cessione:
            </label>
            <input
              type="number"
              name="importoCessione"
              id="importoCessione"
              value={formData.importoCessione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </>
      );
    case "contrattoAcquisto":
      return (
        <>
          <div className="mb-4">
            <label htmlFor="nomeAcquirente" className="block text-sm font-medium text-gray-700">
              Nome Acquirente:
            </label>
            <input
              type="text"
              name="nomeAcquirente"
              id="nomeAcquirente"
              value={formData.nomeAcquirente || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cognomeAcquirente" className="block text-sm font-medium text-gray-700">
              Cognome Acquirente:
            </label>
            <input
              type="text"
              name="cognomeAcquirente"
              id="cognomeAcquirente"
              value={formData.cognomeAcquirente || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dataAcquisto" className="block text-sm font-medium text-gray-700">
              Data di Acquisto:
            </label>
            <input
              type="date"
              name="dataAcquisto"
              id="dataAcquisto"
              value={formData.dataAcquisto || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="prezzoAcquisto" className="block text-sm font-medium text-gray-700">
              Prezzo Acquisto:
            </label>
            <input
              type="number"
              name="prezzoAcquisto"
              id="prezzoAcquisto"
              value={formData.prezzoAcquisto || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </>
      );
      case "contrattoDeposito":
      return (
        <>
          <div className="mb-4">
            <label htmlFor="nomeDepositatario" className="block text-sm font-medium text-gray-700">
              Nome Depositatario:
            </label>
            <input
              type="text"
              name="nomeDepositatario"
              id="nomeDepositatario"
              value={formData.nomeDepositatario || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cognomeDepositatario" className="block text-sm font-medium text-gray-700">
              Cognome Depositatario:
            </label>
            <input
              type="text"
              name="cognomeDepositatario"
              id="cognomeDepositatario"
              value={formData.cognomeDepositatario || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="durataDeposito" className="block text-sm font-medium text-gray-700">
              Durata Deposito:
            </label>
            <input
              type="text"
              name="durataDeposito"
              id="durataDeposito"
              value={formData.durataDeposito || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </>
      );
    case "contrattoEspositivo":
      return (
        <>
          <div className="mb-4">
            <label htmlFor="nomeResponsabileEsposizione" className="block text-sm font-medium text-gray-700">
              Nome Responsabile Esposizione:
            </label>
            <input
              type="text"
              name="nomeResponsabileEsposizione"
              id="nomeResponsabileEsposizione"
              value={formData.nomeResponsabileEsposizione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cognomeResponsabileEsposizione" className="block text-sm font-medium text-gray-700">
              Cognome Responsabile Esposizione:
            </label>
            <input
              type="text"
              name="cognomeResponsabileEsposizione"
              id="cognomeResponsabileEsposizione"
              value={formData.cognomeResponsabileEsposizione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="luogoEsposizione" className="block text-sm font-medium text-gray-700">
              Luogo Esposizione:
            </label>
            <input
              type="text"
              name="luogoEsposizione"
              id="luogoEsposizione"
              value={formData.luogoEsposizione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="durataEsposizione" className="block text-sm font-medium text-gray-700">
              Durata Esposizione:
            </label>
            <input
              type="text"
              name="durataEsposizione"
              id="durataEsposizione"
              value={formData.durataEsposizione || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </>
      );
    default:
      return null;
  }
};



  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const selectedPhotos = Array.from(e.target.files);

    // Verifica se l'utente sta cercando di aggiungere più file rispetto al massimo consentito
    if (photos.length + selectedPhotos.length > 5) {
      Swal.fire("Errore", "Puoi caricare un massimo di 5 foto/video.", "error");
      return; // Impedisce di aggiungere più di 5 file in totale
    }

    const updatedPhotos = [...photos, ...selectedPhotos];
    setPhotos(updatedPhotos);

    const previewURLs = updatedPhotos.map((photo) =>
      URL.createObjectURL(photo)
    );
    setPreviews(previewURLs);
  };

  const handlePhotoUpload = async (photos) => {
    const storage = getStorage();
    const photoURLs = [];

    for (const photo of photos) {
      const storageRef = ref(storage, `uploads/${user.id}/${photo.name}`);
      await uploadBytes(storageRef, photo);
      const url = await getDownloadURL(storageRef);
      photoURLs.push(url); // Aggiungi l'URL scaricabile
    }

    return photoURLs; // Restituisci un array di URL delle foto
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value); // Set the selected value
  };
  const handleTipoDocumentoChange = (event) => {
    setSelectedTipoDocumento(event.target.value);
  };
  const handleHome = async (e) => {
    e.preventDefault(); // Previeni il refresh della pagina

    const result = await Swal.fire({
      title: "Sei sicuro di voler tornare alla home?",
      text: "Tutte le modifiche andranno perse",
      showCancelButton: true,
      confirmButtonText: "Sì",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });

    if (result.isConfirmed) {
      navigate("/Home");
    }
  };
  // Funzione per gestire il salvataggio
  const handleSaveDownloadPDF = async (e) => {
    // Validazione: controlla se tutti i campi obbligatori sono compilati
    if (!formData.altezza || !formData.larghezza || !selectedOption || !text) {
      Swal.fire(
        "Errore",
        "Per favore compila tutti i campi obbligatori prima di salvare.",
        "error"
      );
      return; // Blocca il salvataggio se i campi obbligatori non sono compilati
    }

    const docData = {
      id_utente: user.id, // uid dell'utente
      id_documento: formData.codice, // ID generato
      Data_creazione: new Date(), // Data corrente come timestamp
      version: version,
      infoDocumento: formData,
      description: text,
      type: selectedOption,
      last_modify: new Date(),
    };

    try {
      // Salva il documento nella collezione "documentiAssociati"
      await addDoc(collection(db, "documentiScaricatiFromCreation"), docData);
    } catch (error) {
      // Mostra errore in caso di fallimento
      Swal.fire("Errore", "Errore durante il salvataggio", "error");
      console.error("Errore durante il salvataggio:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validazione: controlla se tutti i campi obbligatori sono compilati
    if (!formData.altezza || !formData.larghezza || !selectedOption || !text) {
      Swal.fire(
        "Errore",
        "Per favore compila tutti i campi obbligatori prima di salvare.",
        "error"
      );
      return; // Blocca il salvataggio se i campi obbligatori non sono compilati
    }

    const regex = /^[A-Z]{2}\d{6}$/;
    if (!regex.test(formData.codice)) {
      Swal.fire("Errore", "Formato del codice non valido.", "error");
      return; // Blocca il salvataggio se la sintassi del codice è errata
    }

    const codeExists = await checkIfCodeExists(formData.codice);
    if (codeExists) {
      Swal.fire(
        "Errore",
        "Il codice inserito è già stato utilizzato.",
        "error"
      );
      return; // Blocca il salvataggio se il codice esiste già
    }

    const result = await Swal.fire({
      title: "Sei sicuro di voler salvare il documento?",
      text: "Salvando il documento non potrai cambiare in futuro il codice associato a questo documento",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sì",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });

    // Se l'utente conferma il salvataggio
    if (result.isConfirmed) {
      if (!user) {
        Swal.fire("Errore", "Nessun utente autenticato", "error");
        return;
      }

      const photoURLs = await handlePhotoUpload(photos);

      const docData = {
        id_utente: user.id, // uid dell'utente
        id_documento: formData.codice, // ID generato
        Data_creazione: new Date(), // Data corrente come timestamp
        version: version,
        infoDocumento: formData,
        description: text,
        type: selectedOption,
        last_modify: new Date(),
        photoURLs: photoURLs,
      };

      const result = await Swal.fire({
        title: "Conferma Salvataggio",
        text: "Sei sicuro di voler salvare il documento?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sì, salva",
        cancelButtonText: "No, annulla",
        confirmButtonColor: "green",
        cancelButtonColor: "red",
      });

      if (result.isConfirmed) {
        try {
          // Salva il documento nella collezione "documentiAssociati"
          await addDoc(collection(db, "documentiAssociati"), docData);
          // Mostra messaggio di successo
          Swal.fire("Successo", "Documento salvato con successo!", "success");
          navigate("/Home"); // Torna alla home se il salvataggio ha successo
        } catch (error) {
          // Mostra errore in caso di fallimento
          Swal.fire(
            "Errore",
            "Errore durante il download del documento",
            "error"
          );
          console.error("Errore durante il download:", error);
        }
      }
    } else {
      // Se l'utente clicca su "No"
      Swal.fire("Annullato", "Il salvataggio è stato annullato", "info");
    }
  };

  const handleSign = async (e) => {
    e.preventDefault();

    if (
      !formData.altezza ||
      !formData.larghezza ||
      !selectedOption ||
      !text ||
      !formData.codice
    ) {
      Swal.fire(
        "Errore",
        "Per favore compila tutti i campi obbligatori prima di salvare.",
        "error"
      );
      return; // Blocca il salvataggio se i campi obbligatori non sono compilati
    }

    const regex = /^[A-Z]{2}\d{6}$/;
    if (!regex.test(formData.codice)) {
      Swal.fire("Errore", "Formato del codice non valido.", "error");
      return; // Blocca il salvataggio se la sintassi del codice è errata
    }

    const codeExists = await checkIfCodeExists(formData.codice);
    if (codeExists) {
      Swal.fire(
        "Errore",
        "Il codice inserito è già stato utilizzato.",
        "error"
      );
      return; // Blocca il salvataggio se il codice esiste già
    }

    if (!isChecked) {
      Swal.fire(
        "Errore",
        "Per poter firmare devi flaggare il campo dichiarazione di firma",
        "error"
      );
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width; // Ottieni la larghezza della pagina
    const margin = 10;

    // Ottieni il codice progressivo
    let codiceProgressivo = localStorage.getItem("codiceProgressivo") || 1;
    const anno = new Date().getFullYear();
    const codiceUtente = formData.codice;
    const version = formData.version;
    // Formatta il codice completo
    const codiceCompleto = `${String(codiceProgressivo).padStart(
      6,
      "0"
    )} / ${anno} / ${codiceUtente}`;

    // Aggiungi il codice in alto a destra (utilizzando la larghezza della pagina per posizionarlo correttamente)
    doc.setFontSize(12); // Imposta la dimensione del font
    const textWidth = doc.getTextWidth(codiceCompleto); // Ottieni la larghezza del testo
    doc.text(codiceCompleto, pageWidth - textWidth - margin, margin + 10);

    let yPosition = 30; // Iniziamo il testo successivo un po' più in basso per evitare sovrapposizioni

    
    // Funzione per caricare le immagini
    const loadImages = photos.map((photo) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          const base64data = event.target.result;
          resolve(base64data);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(photo);
      });
    });

    // Aspetta che tutte le immagini siano caricate
    const base64Images = await Promise.all(loadImages);

    // Aggiungi le immagini al PDF
    let lastImgYPosition = yPosition;
    const imgWidth = 60;
    const imgHeight = 40;

    for (let i = 0; i < base64Images.length; i++) {
      const base64data = base64Images[i];
      const xPosition = 10 + (i % 3) * (imgWidth + 10);
      const yPositionImg =
        lastImgYPosition + Math.floor(i / 3) * (imgHeight + 10);

      doc.addImage(
        base64data,
        "JPEG",
        xPosition,
        yPositionImg,
        imgWidth,
        imgHeight
      );
    }

    lastImgYPosition += Math.ceil(base64Images.length / 3) * (imgHeight + 10);
    yPosition = lastImgYPosition;
    
    // Aggiungi frase iniziale
    doc.text("Io sottoscritto:", 10, yPosition);
    yPosition += 10;


    // Aggiungi i dati dell'artista e della descrizione
    doc.text(
      `Nome : ${user ? user.informazioniUtente.nome : "Nome"}`,
      10,
      yPosition
    );
    yPosition += 10;
    doc.text(
      `Cognome : ${user ? user.informazioniUtente.cognome : "Cognome"}`,
      10,
      yPosition
    );
    yPosition += 10;

    const descriptionLines = doc.splitTextToSize(`Descrizione: ${text}`, 180);
    doc.text(descriptionLines, 10, yPosition);
    yPosition += descriptionLines.length * 10;

    // Aggiungi i dettagli dell'opera
    doc.text(`Altezza: ${formData.altezza} cm`, 10, yPosition);
    yPosition += 10;
    doc.text(`Larghezza: ${formData.larghezza} cm`, 10, yPosition);
    yPosition += 10;


     // Campi dinamici basati sulla tipologia di documento
  if (selectedTipoDocumento === "contrattoCessione") {
    doc.text(`Nome Cessionario: ${formData.nomeCessionario || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Cognome Cessionario: ${formData.cognomeCessionario || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Data di Cessione: ${formData.dataCessione || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Importo Cessione: ${formData.importoCessione || ""}`, 10, yPosition);
    yPosition += 10;
  } else if (selectedTipoDocumento === "contrattoAcquisto") {
    doc.text(`Nome Acquirente: ${formData.nomeAcquirente || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Cognome Acquirente: ${formData.cognomeAcquirente || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Data di Acquisto: ${formData.dataAcquisto || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Prezzo Acquisto: ${formData.prezzoAcquisto || ""}`, 10, yPosition);
    yPosition += 10;
  }
  else if (selectedTipoDocumento === "contrattoEspositivo") {
    doc.text(`Nome Responsabile Esposizione: ${formData.nomeResponsabileEsposizione || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Cognome Responsabile Esposizione: ${formData.cognomeResponsabileEsposizione || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Durata Esposizione: ${formData.durataEsposizione || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Luogo Esposizione: ${formData.luogoEsposizione || ""}`, 10, yPosition);
    yPosition += 10;
  }
  else if (selectedTipoDocumento === "contrattoDeposito") {
    doc.text(`Nome Depositario: ${formData.nomeDepositatario || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Cognome Depositario: ${formData.cognomeDepositatario || ""}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Durata Deposito : ${formData.durataDeposito || ""}`, 10, yPosition);
    yPosition += 10;
    
  }

 // Modalità di formazione
 let formazioneText = "Modalità di Formazione: ";
 switch (selectedOption) {
   case "option1":
     formazioneText += "Creazione diretta";
     break;
   case "option2":
     formazioneText += "Acquisizione analogica";
     break;
   case "option3":
     formazioneText += "Memorizzazione digitale";
     break;
   case "option4":
     formazioneText += "Generazione Automatica";
     break;
   default:
     formazioneText += "Non specificata";
 }
 doc.text(formazioneText, 10, yPosition);
 yPosition += 10;
    if (selectedOption === "option2") {
      doc.text(`Profondità: ${formData.profondità} cm`, 10, yPosition);
      yPosition += 10;
      doc.text(`Materiale: ${formData.materiale}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Peso: ${formData.peso} kg`, 10, yPosition);
      yPosition += 10;
    }

    if (selectedOption === "option1") {
      doc.text(`Colore/i: ${formData.colore}`, 10, yPosition);
      yPosition += 10;
      doc.text(`Tecnica: ${formData.tecnica}`, 10, yPosition);
      yPosition += 10;
    }

    doc.text(`Movimento artistico: ${formData.stile}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Data di creazione: ${formData.data}`, 10, yPosition);
    yPosition += 10;

    const accettazioneLines = doc.splitTextToSize(
      `Dichiaro che il presente documento è stato da me (o da persona da me delegata) compilato e ne assumo la proprietà.`,
      180
    );
    doc.text(accettazioneLines, 10, yPosition);
    yPosition += accettazioneLines.length * 10;

    doc.text("Dichiarazione finale: ____________", 10, yPosition);
    yPosition += 10;

    const pageHeight = doc.internal.pageSize.height;
    const signatureY = pageHeight - margin;
    const signatureX = doc.internal.pageSize.width - 50;

    doc.text("Firma Digitale: __________________", signatureX, signatureY, {
      align: "right",
    });

    // Aggiorna il codice progressivo
    codiceProgressivo++;
    localStorage.setItem("codiceProgressivo", codiceProgressivo);

    const result = await Swal.fire({
      title: "Sei sicuro di voler scaricare il PDF?",
      text: "Scaricando il PDF non potrai cambiare in futuro il codice associato a questo documento",
      showCancelButton: true,
      confirmButtonText: "Sì",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });

    if (result.isConfirmed) {
      doc.save("documento_da_firmare.pdf");
      Swal.fire(
        "Successo",
        "Documento scaricato e generato con successo!",
        "success"
      ).then(() => {
        handleSaveDownloadPDF();
        navigate("/Home");
      });
    }
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const [errorMessage, setErrorMessage] = useState("");

  const checkIfCodeExists = async (codice) => {
    const docRef1 = collection(db, "documentiScaricatiFromCreation");
    const docRef2 = collection(db, "documentiAssociati");

    // Query per verificare se l'id_documento esiste in documentiScaricatiFromCreation
    const q1 = query(docRef1, where("id_documento", "==", codice));
    const querySnapshot1 = await getDocs(q1);

    // Query per verificare se l'id_documento esiste in documentiAssociati
    const q2 = query(docRef2, where("id_documento", "==", codice));
    const querySnapshot2 = await getDocs(q2);

    // Controllo se esiste in una delle due collezioni
    if (!querySnapshot1.empty || !querySnapshot2.empty) {
      return true; // Codice già esistente
    } else {
      return false; // Codice non esistente
    }
  };

  const correctComp = (e) => {
    const { name, value } = e.target;

    if (name === "codice") {
      // Verifica se il valore corrisponde al formato AA000
      const regex = /^[A-Z]{2}\d{6}$/; // 2 lettere seguite da 6 numeri

      if (value.length <= 8) {
        // Limita la lunghezza a 5 caratteri
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));

        // Controlla se il valore è valido
        if (regex.test(value) || value === "") {
          const codeExists = checkIfCodeExists(value);
          if (codeExists) {
            setErrorMessage(
              "Questo codice esiste già. Inserisci un codice univoco."
            );
          }
          setErrorMessage(""); // Resetta il messaggio di errore se valido
        } else {
          
          setErrorMessage(
            "Formato non valido. Deve essere due lettere seguite da sei numeri (es: AB123456)."
          );
        }
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    // Rimuovi l'immagine dall'array photos usando il suo indice
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);

    // Aggiorna le anteprime delle immagini rimanenti
    const updatedPreviews = updatedPhotos.map((photo) =>
      URL.createObjectURL(photo)
    );
    setPreviews(updatedPreviews);
  };

  return (
    <div className="flex items-center justify-center h-screen ml-64 p-4">
      <div className="w-full max-w-lg h-[80vh] p-6 bg-white rounded-lg border border-blue-400 shadow-md relative overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Crea un nuovo documento
        </h1>
        <div className="custom-scroll overflow-auto h-[70vh] mb-4">
          <form>
            <div className="mb-4">
              <p className="mb-2">
                {" "}
                Io sottoscritto{" "}
                <strong>
                  {user ? user.informazioniUtente.nome : "Nome"}
                </strong>{" "}
                <strong>
                  {user ? user.informazioniUtente.cognome : "Cognome"}
                </strong>{" "}
                ...
              </p>

              <input
                type="file"
                accept="image/*, video/*"
                multiple
                onChange={handlePhotoChange}
                id="photo-upload"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="mt-2 grid grid-cols-5 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                      onClick={() => handleRemovePhoto(index)} // Aggiungi questa funzione per rimuovere l'immagine
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="options"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Inserisci
                descrizione:
              </label>
              <textarea
                id="textarea-input"
                value={text}
                onChange={handleChange}
                rows="4"
                className="block w-full max-w-md mx-auto p-2 border border-gray-300 rounded"
                placeholder="Inserire Descrizione...(Obbligatoria)"
                style={{ resize: "none" }} // Prevents textarea from being resizable
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="options"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Seleziona un'opzione:
              </label>
              <select
                id="options"
                name="options"
                value={selectedOption}
                onChange={handleDropdownChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Modalità di formazione DOC --</option>
                <option value="option1">Creazione diretta</option>
                <option value="option2">Acquisizione analogica</option>
                <option value="option3">Memorizzazione digitale</option>
                <option value="option4">Generazione Automatica</option>
              </select>
            </div>

            <div className="mb-4">
  <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700">
    <strong className="text-red-500">*</strong> Seleziona Tipologia di Documento:
  </label>
  <select
    id="tipoDocumento"
    name="tipoDocumento"
    value={selectedTipoDocumento}
    onChange={handleTipoDocumentoChange}
    className="mt-1 block w-full p-2 border border-gray-300 rounded"
  >
    <option value="">-- Seleziona --</option>
    {user && user.informazioniUtente.tipoUtente === "Proprietario Opere" && (
      <>
        <option value="contrattoCessione">Contratto di Cessione</option>
        <option value="contrattoAcquisto">Contratto di Acquisto</option>
        <option value="contrattoDeposito">Contratto di Deposito</option>
        <option value="contrattoEspositivo">Contratto Espositivo</option>
      </>
    )}
    {user &&
      (user.informazioniUtente.tipoUtente === "Artista" ||
        user.informazioniUtente.tipoUtente === "Galleria" ||
        user.informazioniUtente.tipoUtente === "Altro") && (
        <option value="certificatoOpera">Certificato Opera</option>
      )}
  </select>
</div>

{/* Render specific fields based on selectedTipoDocumento */}
{renderSpecificFields()}
            
            <div className="mb-4">
              <label
                htmlFor="codice"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Codice:
              </label>
              <input
                type="text"
                name="codice"
                id="codice"
                value={formData.codice}
                onChange={correctComp}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Inserisci codice opera"
                maxLength={8}
              />
              {errorMessage && (
                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="titolo"
                className="block text-sm font-medium text-gray-700"
              >
                Titolo dell'opera:
              </label>
              <input
                type="text"
                name="titolo"
                id="titolo"
                value={formData.titolo}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Inserisci il titolo dell'opera"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="options"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Seleziona un'opzione:
              </label>
              <select
                id="options"
                name="options"
                value={selectedOption}
                onChange={handleDropdownChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              >
                <option value="">-- Seleziona --</option>
                <option value="option1">Dipinto</option>
                <option value="option2">Scultura</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="altezza"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Altezza:
              </label>
              <input
                type="number"
                name="altezza"
                id="altezza"
                value={formData.altezza}
                onChange={handleInputChange}
                min={0}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Inserisci altezza in cm"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="larghezza"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Larghezza:
              </label>
              <input
                type="number"
                name="larghezza"
                id="larghezza"
                value={formData.larghezza}
                onChange={handleInputChange}
                min={0}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Inserisci la larghezza in cm"
                required
              />
            </div>

            {selectedOption === "option2" && (
              <div className="mb-4">
                <label
                  htmlFor="profondità"
                  className="block text-sm font-medium text-gray-700"
                >
                  Profondità:
                </label>
                <input
                  type="number"
                  name="profondità"
                  id="profondità"
                  value={formData.profondità}
                  onChange={handleInputChange}
                  min={0}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="Inserisci la profondità in cm"
                  required={selectedOption === "option2"}
                />
              </div>
            )}

            {selectedOption === "option2" && (
              <div className="mb-4">
                <label
                  htmlFor="materiale"
                  className="block text-sm font-medium text-gray-700"
                >
                  Materiale:
                </label>
                <input
                  type="text"
                  name="materiale"
                  id="materiale"
                  value={formData.materiale}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="Inserisci materiale"
                  required={selectedOption === "option2"}
                />
              </div>
            )}

            {selectedOption === "option2" && (
              <div className="mb-4">
                <label
                  htmlFor="peso"
                  className="block text-sm font-medium text-gray-700"
                >
                  Peso:
                </label>
                <input
                  type="number"
                  name="peso"
                  id="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  min={0}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="Inserisci peso in kg"
                  required={selectedOption === "option2"}
                />
              </div>
            )}

            {selectedOption === "option1" && (
              <div className="mb-4">
                <label
                  htmlFor="colore"
                  className="block text-sm font-medium text-gray-700"
                >
                  Colore/i:
                </label>
                <input
                  type="text"
                  name="colore"
                  id="colore"
                  value={formData.colore}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="Inserisci colore/i"
                  required={selectedOption === "option1"}
                />
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="stile"
                className="block text-sm font-medium text-gray-700"
              >
                Movimento artistico:
              </label>
              <input
                type="text"
                name="stile"
                id="stile"
                value={formData.stile}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Inserisci movimento artistico"
              />
            </div>

            {selectedOption === "option1" && (
              <div className="mb-4">
                <label
                  htmlFor="tecnica"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tecnica:
                </label>
                <input
                  type="text"
                  name="tecnica"
                  id="tecnica"
                  value={formData.tecnica}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  placeholder="Inserisci la tecnica usata"
                />
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="data"
                className="block text-sm font-medium text-gray-700"
              >
                <strong className="text-red-500">*</strong>Data di creazione:
              </label>
              <input
                required
                type="date"
                name="data"
                id="data"
                value={formData.data}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="data"
                className="block text-sm font-medium text-gray-700"
              >
                Version:
              </label>
              <input
                type="text"
                name="version"
                id="version"
                readOnly
                value={formData.version}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-4">
              <p className="mb-2">
                Io sottoscritto{" "}
                <strong>{user ? user.informazioniUtente.nome : "Nome"}</strong>{" "}
                <strong>
                  {user ? user.informazioniUtente.cognome : "Cognome"}
                </strong>{" "}
                ......
              </p>
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="check"
                id="check"
                className="mr-2"
                onChange={handleCheckboxChange}
                required
              />
              <p className="mb-0 italic">
                Dichiaro che il presente documento è stato da me (o da persona
                da me delegata) compilato e ne assumo la proprietà
              </p>
            </div>

            <div className="text-center sticky bottom-0 bg-white z-10 p-4">
              <div className="inline-flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSign}
                >
                  Scarica PDF
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Salva
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleHome}
                >
                  Torna Indietro
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentCreation;
