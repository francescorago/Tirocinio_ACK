import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; // Per recuperare dati da Firestore
import { db } from "../firebase/firebase"; // Assicurati che il percorso sia corretto
import "../style.css";

const Galleria = () => {
  const [photos, setPhotos] = useState([]); // Stato per memorizzare le foto recuperate

  // Funzione per recuperare le foto da Firestore
  const fetchPhotos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "documentiAssociati")); // Collezione da cui recuperare le foto
      const photoData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.photoURLs && data.id_documento) {
          // Assumi che "photoURLs" sia un array di URL e "id_documento" sia l'ID associato
          data.photoURLs.forEach((url) => {
            photoData.push({ url, id: data.id_documento });
          });
        }
      });

      setPhotos(photoData); // Aggiorna lo stato con i dati delle foto
    } catch (error) {
      console.error("Errore nel recupero delle foto:", error);
    }
  };

  // Effetto per recuperare le foto al caricamento della pagina
  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6">Galleria</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.length > 0 ? (
          photos.map((photo, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <img
                src={photo.url}
                alt={`Photo ${photo.id}`}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-center text-sm text-gray-700">
                ID: <span className="font-semibold">{photo.id}</span>
              </p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Nessuna foto caricata.
          </p>
        )}
      </div>
    </div>
  );
};

export default Galleria;
