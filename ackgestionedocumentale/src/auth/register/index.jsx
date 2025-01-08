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
    tipoUtente:"",
    sede1:"",
    sede2:"",
    responsabileVendite1:"",
    responsabileVendite2:"",
    firma:"",
    fatturazioneElettronica:"",
  });

  const handleNazioneChange = (e) => {
    const inputValue = e.target.value;
  
    // Permetti solo lettere (sia maiuscole che minuscole)
    const onlyLetters = inputValue.replace(/[^a-zA-Z]/g, "");
  
    // Capitalizza la prima lettera e rende minuscole le altre
    const formattedValue = onlyLetters.charAt(0).toUpperCase() + onlyLetters.slice(1).toLowerCase();
  
    setRegisterData((prevState) => ({
      ...prevState,
      nazione: formattedValue,
    }));
  };
  
  
  // Per mostrare/nascondere il campo Codice Fiscale
  const showCodiceFiscale = ["Italia", "Italy"].includes(registerData.nazione);
  

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
  const handleFatturazioneChange = (e) => {
    const value = e.target.value === "true"; // Converte il valore stringa in booleano
    setRegisterData((prevState) => ({
      ...prevState,
      fatturazione: value,
    }));
  };
  
  const handleFirmaChange =(e)=>{
    const value= e.target.value === "true";
    setRegisterData((prevState)=>({
      ...prevState,
      firma: value,
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

          {/* Campo Nazione */}
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
    onChange={handleNazioneChange}
    className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
  />
</div>

{/* Campo Codice Fiscale - Mostrato solo se Nazione è Italia */}
{showCodiceFiscale && (
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
      onChange={(e) =>
        setRegisterData((prevState) => ({
          ...prevState,
          codiceFiscale: e.target.value,
        }))
      }
      className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
    />
  </div>
)}


          <div>
  <label className="block text-sm text-gray-600 font-bold mb-1">
    Firma<strong className="text-red-500">*</strong>
  </label>
  <div className="flex space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="firma"
        value="true"
        checked={registerData.firma === true}
        onChange={handleFirmaChange}
        className="form-radio text-blue-600"
      />
      <span>Digitale</span>
    </label>
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name="firma"
        value="false"
        checked={registerData.firma === false}
        onChange={handleFirmaChange}
        className="form-radio text-blue-600"
      />
      <span>Olografica</span>
    </label>
  </div>
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
          
         {/* Tipo di Utente */}
         <div>
            <label className="block text-sm text-gray-600 font-bold mb-1">Tipo di Utente<strong className="text-red-500">*</strong></label>
            <select
              name="tipoUtente"
              required
              value={registerData.tipoUtente}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
            >
              <option value="">Seleziona un tipo di utente</option>
              <option value="Artista">Artista</option>
              <option value="Proprietario Opere">Proprietario Opere</option>
              <option value="Galleria">Galleria</option>
              <option value="Esperto">Esperto</option>
              <option value="Mercante">Mercante</option>
              <option value="Musei">Musei</option>
            </select>
          </div>

          {/* Campi aggiuntivi per Artista */}
          {registerData.tipoUtente === "Artista" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Partita IVA<strong className="text-red-500">*</strong></label>
                <input
                  type="text"
                  name="partitaIVA"
                  placeholder="Inserisci la tua partita IVA"
                  required
                  value={registerData.partitaIVA}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">PEC<strong className="text-red-500">*</strong></label>
                <input
                  type="email"
                  name="pec"
                  placeholder="Inserisci la tua PEC"
                  required
                  value={registerData.pec}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Nickname 1</label>
                <input
                  type="text"
                  name="nickname1"
                  placeholder="Inserisci il tuo primo nickname"
                  value={registerData.nickname1}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Nickname 2</label>
                <input
                  type="text"
                  name="nickname2"
                  placeholder="Inserisci il tuo secondo nickname"
                  value={registerData.nickname2}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Nickname 3</label>
                <input
                  type="text"
                  name="nickname3"
                  placeholder="Inserisci il tuo terzo nickname"
                  value={registerData.nickname3}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Indirizzo Laboratorio</label>
                <input
                  type="text"
                  name="indirizzoLaboratorio"
                  placeholder="Inserisci l'indirizzo del laboratorio"
                  value={registerData.indirizzoLaboratorio}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Indirizzo Laboratorio 2</label>
                <input
                  type="text"
                  name="indirizzoLaboratorio2"
                  placeholder="Inserisci un secondo indirizzo del laboratorio"
                  value={registerData.indirizzoLaboratorio2}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Depositi</label>
                <input
                  type="text"
                  name="depositi"
                  placeholder="Inserisci i depositi"
                  value={registerData.depositi}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Sito Web</label>
                <input
                  type="url"
                  name="sitoWeb"
                  placeholder="Inserisci il tuo sito web"
                  value={registerData.sitoWeb}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>


              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Fatturazione Elettronica</label>
                <select
                  name="fatturazioneElettronica"
                  required
                  value={registerData.fatturazioneElettronica}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                >
                  <option value="si">Sì</option>
                  <option value="no">No</option>
                </select>
              </div>
            </>
          )}

          {/* Campi aggiuntivi per Galleria */}
          {registerData.tipoUtente === "Galleria" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Sede 1</label>
                <input
                  type="text"
                  name="sede1"
                  placeholder="Inserisci la prima sede"
                  value={registerData.sede1}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Sede 2</label>
                <input
                  type="text"
                  name="sede2"
                  placeholder="Inserisci la seconda sede"
                  value={registerData.sede2}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Responsabile Vendite 1</label>
                <input
                  type="text"
                  name="responsabileVendite1"
                  placeholder="Inserisci il primo responsabile vendite"
                  value={registerData.responsabileVendite1}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Responsabile Vendite 2</label>
                <input
                  type="text"
                  name="responsabileVendite2"
                  placeholder="Inserisci il secondo responsabile vendite"
                  value={registerData.responsabileVendite2}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-bold mb-1">Sito Web</label>
                <input
                  type="url"
                  name="sitoWeb"
                  placeholder="Inserisci il sito web della galleria"
                  value={registerData.sitoWeb}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 text-gray-700 bg-white border rounded-lg focus:border-blue-600 shadow-sm transition duration-300"
                />
              </div>
            </>
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
