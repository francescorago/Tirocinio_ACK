import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword, doSendEmailVerification } from '../../firebase/auth'; // Importa anche la funzione di verifica email
import { setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    nome: "",
    cognome: "",
    codiceFiscale: "",
    partitaIVA: "",
    indirizzo:"",
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateCodiceFiscale(registerData.codiceFiscale)) {
      setErrorMessage("Il codice fiscale inserito non è valido.");
      return;
    }  

    if (password !== confirmPassword) {
      setErrorMessage("Le password non corrispondono");
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        // Crea un nuovo utente
        await doCreateUserWithEmailAndPassword(email, password);
        const user = auth.currentUser;
        if (user) {
          // Salva i dati dell'utente nel database
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            informazioniUtente: registerData,
          });

          // Invia l'email di verifica
          await doSendEmailVerification(); // Chiama la funzione per inviare l'email di verifica

          alert("Email di verifica inviata. Controlla la tua inbox."); // Messaggio di conferma
          navigate('/home'); // Naviga alla homepage o ad un'altra pagina
        }
      } catch (error) {
        setErrorMessage(error.message);
        setIsRegistering(false);
      }
    }
  };

  const validateCodiceFiscale = (codiceFiscale) => {
    const codiceFiscaleRegex = /^[A-Z]{6}[0-9]{2}[A-Z]{1}[0-9]{2}[A-Z]{1}[0-9]{3}[A-Z]{1}$/;
    return codiceFiscaleRegex.test(codiceFiscale);
  };

  const handleChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    if (e.target.name === 'codiceFiscale') {
      if (!validateCodiceFiscale(e.target.value)) {
        setErrorMessage("Il codice fiscale non è valido.");
      } else {
        setErrorMessage("");
      }
    }
  };

  return (
    <div className="flex items-start justify-center bg-gray-100 p-4">
      <div className="w-full sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12 text-gray-600 space-y-5 p-6 sm:p-8 md:p-10 pb-10 shadow-xl border rounded-xl bg-white">
        <div className="text-center mb-6">
          <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">
            Informazioni Personali
          </h3>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Campo Nome */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Nome<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Inserisci il tuo nome"
              required
              value={registerData.nome}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Cognome */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Cognome<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="cognome"
              placeholder="Inserisci il tuo cognome"
              required
              value={registerData.cognome}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Codice Fiscale */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Codice Fiscale<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="codiceFiscale"
              placeholder="Inserisci il tuo codice fiscale"
              required
              value={registerData.codiceFiscale}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Indirizzo<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="indirizzo"
              required
              placeholder="Inserisci il tuo indirizzo"
              value={registerData.indirizzo}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Partita IVA */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Partita IVA
            </label>
            <input
              type="text"
              name="partitaIVA"
              placeholder="Inserisci la tua partita IVA"
              value={registerData.partitaIVA}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Email */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Email<strong className="text-red-500">*</strong>
            </label>
            <input
              type="email"
              placeholder="Inserisci la tua email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Password */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Password<strong className="text-red-500">*</strong>
            </label>
            <input
              type="password"
              placeholder="Inserisci la tua password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Campo Conferma Password */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Conferma Password<strong className="text-red-500">*</strong>
            </label>
            <input
              type="password"
              placeholder="Conferma la tua password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          
          {/* Messaggio di Errore */}
          {errorMessage && (
            <div className="text-red-600 font-bold text-sm">
              {errorMessage}
            </div>
          )}
          
          {/* Bottone Submit */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 hover:shadow-xl transition duration-300"
          >
            Avanti
          </button>
        </form>
        
        {/* Link al Login */}
        <div className="text-sm text-center">
          Hai già un account?{" "}
          <Link
            to={"/login"}
            className="text-blue-600 hover:underline font-bold"
          >
            Continua
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
