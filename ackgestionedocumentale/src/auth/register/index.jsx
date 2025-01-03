import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doCreateUserWithEmailAndPassword, doSendEmailVerification } from '../../firebase/auth'; // Importa anche la funzione di verifica email
import { setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';

const Register = () => {
  const [registerData, setRegisterData] = useState({
    nome: "",
    cognome: "",
    data: "",
    luogo:"",
    pec: "",
    nickname1: "",
    nickname2: "",
    nickname3: "",
    indirizzoLaboratorio: "",
    indirizzoLaboratorio2: "",
    depositi: "",
    sitoWeb: "",
    nazione:"",
    codiceFiscale: "",
    partitaIVA: "",
    indirizzo:"",
    attività:"",
  });

  const onlyLettersHandleChange = (e) => {
    const value = e.target.value;
    // Consenti solo lettere (inclusi caratteri accentati e spazi)
    const isValid = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]*$/.test(value);
    
    if (isValid) {
      handleChange(e);
    }
  };
  
  const [isFatturazioneEnabled, setIsFatturazioneEnabled] = useState(null);
  const handleInputChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };
  const handleFatturazioneChange = (value) => {
    setRegisterData((prevState) => ({
      ...prevState,
      fatturazione: value,
    }));
  };
  
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("");
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
  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value); // Set the selected value
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
              onChange={onlyLettersHandleChange}
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
              onChange={onlyLettersHandleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>
          

          {/*Campo Data di Nascita*/}
          <div ClassName="mb-4">
            <label htmlFor="data"
            className="block text-sm font-medium text-gray-700"
            >
              Data di Nascita<strong className="text-red-500">*</strong>                
            </label>
            <input
            required
            type="date"
            name="data"
            id="data"
            value={registerData.data}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
            </div>
            <div ClassName="mb-4">
              <label
                htmlFor="data"
                className="block text-sm font-medium text-gray-700"
                ></label>
                </div>

          {/*Campo Luogo Nascita*/}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Luogo di Nascita<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="luogo"
              placeholder="Inserisci dove sei nato"
              required
              value={registerData.luogo}
              onChange={onlyLettersHandleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>

          {/*Campo Luogo Nascita*/}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Nazione<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="nazione"
              placeholder="Inserisci la tua nazione"
              required
              value={registerData.nazione}
              onChange={onlyLettersHandleChange}
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
          
          {/* Campo Utente */}
          <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Utente<strong className="text-red-500">*</strong>
            </label>
            <select
            id="options"
                name="options"
                value={selectedOption}
                onChange={handleDropdownChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- Scegli Utente --</option>
                <option value="Artista">Artista</option>
                <option value="Proprietario">Proprietario Opere</option>
                <option value="Galleria">Galleria </option>
                <option value="Esperto">Esperto</option>
                <option value="Mercante">Mercante</option>
                <option value="Museo">Museo</option>
            </select>
          </div>




          {/*<div>
            <label className="block text-sm text-gray-600 font-bold mb-1">
              Nome<strong className="text-red-500">*</strong>
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Inserisci il tuo nome"
              required
              value={registerData.nome}
              onChange={onlyLettersHandleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            />
          </div>*/}
          {selectedOption === "Artista" && (
  <div className="space-y-4 border-t pt-4 mt-4">
    <h4 className="text-lg font-bold">Dati aggiuntivi - Artista</h4>

    <div>
      <label className="block text-sm text-gray-600 font-bold mb-1">
              Partita IVA<strong className="text-red-500">*</strong>
            </label>
      <input
        type="text"
        name="partitaIVA"
        placeholder="Inserisci Partita IVA"
        value={registerData.partitaIVA}
        onChange={handleInputChange}
        className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
        />
    </div>

    <div>
      <label>PEC*</label>
      <input
        type="email"
        name="pec"
        value={registerData.pec}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Nickname 1</label>
      <input
        type="text"
        name="nickname1"
        value={registerData.nickname1}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Nickname 2</label>
      <input
        type="text"
        name="nickname2"
        value={registerData.nickname2}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Nickname 3</label>
      <input
        type="text"
        name="nickname3"
        value={registerData.nickname3}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Indirizzo Laboratorio</label>
      <input
        type="text"
        name="indirizzoLaboratorio"
        value={registerData.indirizzoLaboratorio}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Indirizzo Laboratorio 2</label>
      <input
        type="text"
        name="indirizzoLaboratorio2"
        value={registerData.indirizzoLaboratorio2}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Depositi</label>
      <input
        type="text"
        name="depositi"
        value={registerData.depositi}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Sito Web</label>
      <input
        type="text"
        name="sitoWeb"
        value={registerData.sitoWeb}
        onChange={handleInputChange}
      />
    </div>

    <div>
      <label>Fatturazione Elettronica (Scegli con una X)</label>
      <div>
        <button onClick={() => handleFatturazioneChange(true)}>Sì</button>
        <button onClick={() => handleFatturazioneChange(false)}>No</button>
      </div>
    </div>
  </div>
)}
{selectedOption === "Proprietario" && (
  <div>
    <h4 className="text-lg font-bold">Dati aggiuntivi - Proprietario</h4>
    <input
      type="text"
      name="proprietàRegistrate"
      placeholder="Proprietà registrate"
      value={registerData.proprietàRegistrate || ""}
      onChange={handleInputChange}
    />
  </div>
)}


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
