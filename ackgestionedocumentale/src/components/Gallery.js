import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase"; 
import "../style.css";
import { useUser } from "../userContext/UserContext";
import { useTranslation } from "react-i18next";

const Galleria = () => {
  const [photos, setPhotos] = useState([]);
  const [sortCriteria, setSortCriteria] = useState("id"); // Default: ordina per ID
  const user = useUser(); 

  const fetchPhotos = async () => {
    if (!user) {
      console.error("Nessun utente autenticato");
      return;
    }

    try {
      const querySnapshot = await getDocs(
        query(collection(db, "documentiAssociati"), where("id_utente", "==", user.id))
      );

      const photoData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.photoURLs && data.id_documento) {
          data.photoURLs.forEach((url) => {
            photoData.push({ url, id: data.id_documento, date: data.data_importazione });
          });
        }
      });

      setPhotos(photoData);
    } catch (error) {
      console.error("Errore nel recupero delle foto:", error);
    }
  };

  const handleSort = (criteria) => {
    setSortCriteria(criteria);
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  const sortedPhotos = [...photos].sort((a, b) => {
    if (sortCriteria === "id") {
      return a.id.localeCompare(b.id);
    } else if (sortCriteria === "date") {
      return new Date(a.date) - new Date(b.date);
    }
    return 0;
  });

  return (
    <div className="ml-64 p-4">
      <div className="flex justify-center text-3xl mt-4 mb-4 font-bold">Galleria</div>
      <div className="flex justify-center text-xl mt-4 mb-4">
        In questa pagina puoi visualizzare tutte le immagini che hai caricato nei tuoi certificati.
      </div>

      <div className="flex justify-end mb-4">
        <select
          className="p-2 border rounded"
          value={sortCriteria}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="id">Ordina per ID</option>
          <option value="date">Ordina per Data</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedPhotos.length > 0 ? (
          sortedPhotos.map((photo, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <img
                src={photo.url}
                alt={`Photo ${photo.id}`}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2 text-center text-sm text-gray-700">
                ID: <span className="font-semibold">{photo.id}</span>
              </p>
              {photo.date && (
                <p className="text-center text-xs text-gray-500">
                  Data: {new Date(photo.date).toLocaleDateString()}
                </p>
              )}
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
