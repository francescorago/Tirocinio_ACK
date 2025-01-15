import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Usa useParams per ottenere l'ID del documento
import { useUser } from "../userContext/UserContext"; // Importa useUser
import Swal from "sweetalert2"; // Importa SweetAlert2
import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "../style.css";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { deleteDoc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

const DocumentEdit = () => {
  const { id } = useParams(); // Ottieni l'ID del documento dai parametri URL
  const user = useUser();
  const navigate = useNavigate();


  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    titolo: "",
    altezza: "",
    larghezza: "",
    materiale: "",
    peso: "",
    colore: "",
    stile: "",
    profondità: "",
    data: "",
    codice: "",
    version:""
  });

  const [text, setText] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(true); // Stato di caricamento
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user || !user.id || !id) {
        console.log("Utente non autenticato o ID documento mancante");
        return;
      }

      try {
        const docRef = doc(db, "documentiAssociati", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(data.infoDocumento);
          setText(data.description);
          setSelectedOption(data.type);
          setPreviews(data.photoURLs);
        } else {
          Swal.fire("Errore", "Documento non trovato", "error");
        }
      } catch (error) {
        console.error("Errore durante il caricamento del documento:", error);
      } finally {
        setLoading(false); // Rimuovi lo stato di caricamento
      }
    };

    fetchDocument();
  }, [user, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.altezza || !formData.larghezza || !selectedOption || !text) {
      Swal.fire("Errore", "Compila tutti i campi obbligatori", "error");
      return;
    }

    try {
      const newPhotoURLs = await uploadPhotosToStorage(photos);
    
    // Unisci le nuove foto con quelle esistenti
    const updatedPhotoURLs = [...previews, ...newPhotoURLs];

    const docRef = doc(db, "documentiAssociati", id);
    await updateDoc(docRef, {
      infoDocumento: formData,
      description: text,
      last_modify: new Date(),
      photoURLs: previews, // Aggiorna gli URL delle foto
    });
      Swal.fire("Successo", "Documento aggiornato con successo", "success");
      navigate("/document-archive");
    } catch (error) {
      console.error("Errore durante l'aggiornamento del documento:", error);
      Swal.fire("Errore", "Errore durante l'aggiornamento", "error");
    }
  };

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

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleBack = async (e) => {
    e.preventDefault(); // Previeni il refresh della pagina

    const result = await Swal.fire({
      title: "Sei sicuro di voler tornare alla pagina documenti salvati?",
      text: "Tutte le modifiche andranno perse",
      showCancelButton: true,
      confirmButtonText: "Sì",
      cancelButtonText: "No",
      confirmButtonColor: "green",
      cancelButtonColor: "red",
    });

    if (result.isConfirmed) {
      navigate("/document-archive");
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
      return; 
    }
  
    if (!isChecked) {
      Swal.fire(
        "Errore",
        "Per poter firmare devi flaggare il campo dichiarazione di firma",
        "error"
      );
      return;
    }
  
    try {
      // Cambia il nome della variabile per evitare il conflitto
      const pdfDoc = new jsPDF();
      const pageWidth = pdfDoc.internal.pageSize.width; 
      const margin = 10;
      
      let codiceProgressivo = localStorage.getItem("codiceProgressivo") || 1;
      const anno = new Date().getFullYear();
      const codiceUtente = formData.codice;
      
      const codiceCompleto = `${String(
        codiceProgressivo
      ).padStart(6, "0")} / ${anno} / ${codiceUtente}`;
      
      pdfDoc.setFontSize(12);
      const textWidth = pdfDoc.getTextWidth(codiceCompleto);
      pdfDoc.text(codiceCompleto, pageWidth - textWidth - margin, margin + 10);
      
      let yPosition = 30;
      pdfDoc.text("Io sottoscritto:", 10, yPosition);
      yPosition += 10;
  
      const loadImages = photos.map((photo) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(photo);
        });
      });
  
      const base64Images = await Promise.all(loadImages);
      
      let lastImgYPosition = yPosition;
      const imgWidth = 60;
      const imgHeight = 40;
  
      for (let i = 0; i < base64Images.length; i++) {
        const base64data = base64Images[i];
        const xPosition = 10 + (i % 3) * (imgWidth + 10);
        const yPositionImg =
          lastImgYPosition + Math.floor(i / 3) * (imgHeight + 10);
  
        pdfDoc.addImage(
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
  
      pdfDoc.text(
        `Nome : ${user ? user.informazioniUtente.nome : "Nome"}`,
        10,
        yPosition
      );
      yPosition += 10;
      pdfDoc.text(
        `Cognome : ${user ? user.informazioniUtente.cognome : "Cognome"}`,
        10,
        yPosition
      );
      yPosition += 10;
  
      const descriptionLines = pdfDoc.splitTextToSize(`Descrizione: ${text}`, 180);
      pdfDoc.text(descriptionLines, 10, yPosition);
      yPosition += descriptionLines.length * 10;
  
      pdfDoc.text(`Altezza: ${formData.altezza} cm`, 10, yPosition);
      yPosition += 10;
      pdfDoc.text(`Larghezza: ${formData.larghezza} cm`, 10, yPosition);
      yPosition += 10;
  
      if (selectedOption === "option2") {
        pdfDoc.text(`Profondità: ${formData.profondità} cm`, 10, yPosition);
        yPosition += 10;
        pdfDoc.text(`Materiale: ${formData.materiale}`, 10, yPosition);
        yPosition += 10;
        pdfDoc.text(`Peso: ${formData.peso} kg`, 10, yPosition);
        yPosition += 10;
      }
  
      if (selectedOption === "option1") {
        pdfDoc.text(`Colore/i: ${formData.colore}`, 10, yPosition);
        yPosition += 10;
        pdfDoc.text(`Tecnica: ${formData.tecnica}`, 10, yPosition);
        yPosition += 10;
      }
  
      pdfDoc.text(`Movimento artistico: ${formData.stile}`, 10, yPosition);
      yPosition += 10;
      pdfDoc.text(`Data di creazione: ${formData.data}`, 10, yPosition);
      yPosition += 10;
  
      const accettazioneLines = pdfDoc.splitTextToSize(
        `Dichiaro che il presente documento è stato da me (o da persona da me delegata) compilato e ne assumo la proprietà.`,
        180
      );
      pdfDoc.text(accettazioneLines, 10, yPosition);
      yPosition += accettazioneLines.length * 10;
  
      pdfDoc.text("Dichiarazione finale: ____________", 10, yPosition);
      yPosition += 10;
  
      const pageHeight = pdfDoc.internal.pageSize.height;
      const signatureY = pageHeight - margin;
      const signatureX = pdfDoc.internal.pageSize.width - 50;
  
      pdfDoc.text("Firma Digitale: __________________", signatureX, signatureY, {
        align: "right",
      });
  
      pdfDoc.save("documento_da_firmare.pdf");
  
      // Incrementa il codice progressivo
      codiceProgressivo++;
      localStorage.setItem("codiceProgressivo", codiceProgressivo);
  
      // Dopo aver generato il PDF, elimina il documento dalla collezione "documentiAssociati"
      await deleteDoc(doc(db, "documentiAssociati", id));
  
      // Aggiungi o aggiorna il documento nella collezione "documentiScaricatiFromCreation"
      await setDoc(doc(db, "documentiScaricatiFromCreation", id), {
        infoDocumento: formData,
        description: text,
        type: selectedOption,
        photoURLs: previews, // Supponendo che `previews` contenga gli URL delle immagini
        id_document: formData.codice // Inserisci il codice progressivo o ID
      });
  
      Swal.fire(
        "Successo",
        "Documento firmato, generato e trasferito con successo!",
        "success"
      ).then(() => {
        navigate("/Home");
      });
    } catch (error) {
      console.error("Errore durante la firma o l'eliminazione del documento:", error);
      Swal.fire("Errore", "Si è verificato un errore durante l'operazione.", "error");
    }
  };
  

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const [errorMessage, setErrorMessage] = useState("");

  const correctComp = (e) => {
    const { name, value } = e.target;

    if (name === "codice") {
      // Verifica se il valore corrisponde al formato AA000
      const regex = /^[A-Za-z]{2}\d{6}$/; // Due lettere seguite da tre numeri

      if (value.length <= 8) {
        // Limita la lunghezza a 8 caratteri
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));

        // Controlla se il valore è valido
        if (regex.test(value) || value === "") {
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

  const uploadPhotosToStorage = async (photos) => {
    const photoURLs = [];
    const storage = getStorage();
  
    for (const photo of photos) {
      const storageRef = ref(storage, `images/${photo.name}`);
      const snapshot = await uploadBytes(storageRef, photo);
      const url = await getDownloadURL(snapshot.ref);
      photoURLs.push(url);
    }
  
    return photoURLs;
  };
  

  const handleRemovePhoto = async (indexToRemove) => {
    const photoToRemove = photos[indexToRemove];
    const storage = getStorage();
  
    // Rimuovi l'immagine dall'array delle foto
    const updatedPhotos = photos.filter((_, index) => index !== indexToRemove);
    setPhotos(updatedPhotos);
  
    // Rimuovi solo l'anteprima specifica
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
  
    // Rimuovi la foto anche dal database (Firebase Storage)
    try {
      const fileRef = ref(storage, photoToRemove); // Assicurati che questo sia il percorso corretto
      await deleteObject(fileRef);
      console.log(`Foto rimossa con successo: ${photoToRemove}`);
    } catch (error) {
      console.error(`Errore durante la rimozione della foto: ${photoToRemove}`, error);
    }
  };
  
  
  
  return loading ? (
    <div>Caricamento...</div>
  ) : (
    <div className="flex items-center justify-center h-screen ml-64 p-4">
      <div className="w-full max-w-lg h-[80vh] p-6 bg-white rounded-lg border border-blue-400 shadow-md relative overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Modifica Documento
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
                accept="image/*"
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
              <textarea
                id="textarea-input"
                value={text}
                onChange={handleChange}
                rows="4"
                className="block w-full max-w-md mx-auto p-2 border border-gray-300 rounded"
                placeholder="Inserire Descrizione..."
                style={{ resize: "none" }} 
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="options"
                className="block text-sm font-medium text-gray-700"
              >
                Seleziona un'opzione:
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
                htmlFor="codice"
                className="block text-sm font-medium text-gray-700"
              >
                Codice:
              </label>
              <input
                readOnly
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
                htmlFor="altezza"
                className="block text-sm font-medium text-gray-700"
              >
                Altezza:
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
                Larghezza:
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
                Data di creazione:
              </label>
              <input
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
              <p className="mb-0">
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
                  Salva Modifica
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleBack}
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

export default DocumentEdit;
