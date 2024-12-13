import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const auth = getAuth();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email per il reset della password inviata. Controlla la tua casella di posta.");
    } catch (error) {
      console.error("Errore reset password:", error);
      setErrorMessage("Errore durante il reset della password. Riprova.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border border-blue-600 rounded-xl">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="text-sm font-bold">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-between"> 
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Invia mail di reset
          </button>
          <Link to="/login">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Torna Indietro
          </button>
          </Link>
          </div>
        </form>
        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {errorMessage && <p className="text-red-600 text-center mt-4">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
