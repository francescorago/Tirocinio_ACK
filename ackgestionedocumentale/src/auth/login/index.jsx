import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../../assets/animationDocument.json";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from "../../firebase/auth";
import { useAuth } from "../../context/authContext";
import logo from "../../assets/logo.png";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  AuthErrorCodes,
} from "firebase/auth";

const errorMessages = {
  [AuthErrorCodes.INVALID_EMAIL]:
    "L'email fornita non è valida o la password inserita è errata.",
  [AuthErrorCodes.USER_DELETED]: "Nessun utente trovato con questa email.",
  [AuthErrorCodes.INVALID_PASSWORD]: "La password inserita è errata.",
  [AuthErrorCodes.NETWORK_REQUEST_FAILED]:
    "Errore di rete. Per favore, riprova.",
  // Aggiungi altri codici di errore qui se necessario
};

const Login = () => {
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isEmailRegistered, setIsEmailRegistered] = useState(true);
  
  const [failedAttempts, setFailedAttempts] = useState(0); // Track failed attempts
  const [blockUntil, setBlockUntil] = useState(null); // Track when to unblock the user

  const db = getFirestore();
  const auth = getAuth();

  const checkIfEmailRegistered = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email registration:", error);
      return false;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // If blocked, don't proceed
    if (blockUntil && Date.now() < blockUntil) {
      setErrorMessage("Hai raggiunto il limite di tentativi. Riprova tra 10 minuti.");
      return;
    }

    if (!isSigningIn) {
      setIsSigningIn(true);
      setShowAnimation(false);

      try {
        await doSignInWithEmailAndPassword(email, password);
        setShowAnimation(true);
        setTimeout(() => {
          setAnimationFinished(true);
        }, 3000);
      } catch (error) {
        console.error("Errore:", error);
        setFailedAttempts(prev => prev + 1); // Increment failed attempts

        if (failedAttempts + 1 >= 3) {
          setBlockUntil(Date.now() + 10 * 60 * 1000); // Block for 10 minutes
          setErrorMessage("Hai raggiunto il limite di tentativi. Riprova tra 10 minuti.");
        } else {
          setErrorMessage(
            errorMessages[AuthErrorCodes.INVALID_EMAIL] ||
            "Errore sconosciuto. Per favore, riprova."
          );
        }
        setIsSigningIn(false);
      }
    }
  };

  const onGoogleSignIn = async (e) => {
    e.preventDefault();

    // If blocked, don't proceed
    if (blockUntil && Date.now() < blockUntil) {
      setErrorMessage("Hai raggiunto il limite di tentativi. Riprova tra 10 minuti.");
      return;
    }

    if (!isSigningIn) {
      setIsSigningIn(true);
      setShowAnimation(false);

      const provider = new GoogleAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const email = user.email;

        const emailRegistered = await checkIfEmailRegistered(email);
        if (emailRegistered) {
          setShowAnimation(true);
          setTimeout(() => {
            setAnimationFinished(true);
          }, 3000);
        } else {
          setIsEmailRegistered(false);
          setIsSigningIn(false);
        }
      } catch (error) {
        console.error("Errore:", error);
        setErrorMessage(
          errorMessages[AuthErrorCodes.INVALID_EMAIL] ||
          "Errore sconosciuto. Per favore, riprova."
        );
        setIsSigningIn(false);
      }
    }
  };

  useEffect(() => {
    // Reset failed attempts if more than 10 minutes have passed
    if (blockUntil && Date.now() > blockUntil) {
      setFailedAttempts(0);
      setBlockUntil(null);
    }
  }, [blockUntil]);

  if (animationFinished) {
    return <Navigate to={"/home"} replace={true} />;
  }

  return (
    <div className="relative">
      <main className="w-full h-screen flex items-center justify-center">
        {showAnimation && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-80">
            <Lottie
              animationData={successAnimation}
              loop={false}
              onComplete={() => setAnimationFinished(true)}
              className="w-64 h-64"
            />
          </div>
        )}
        <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border border-blue-600 rounded-xl">
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="w-60 h-15  rounded-full flex items-center justify-center border border-blue-600 mb-4">
              <img src={logo} alt="Logo" className="w-60 h-15 rounded-full " />
            </div>
            <div>
              <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">
                Benvenuto
              </h3>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 font-bold">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
              />
            </div>
            {errorMessage && (
              <span className="text-red-600 font-bold">{errorMessage}</span>
            )}
            <button
              type="submit"
              disabled={isSigningIn || (blockUntil && Date.now() < blockUntil)}
              className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                isSigningIn
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl transition duration-300"
              }`}
            >
              {isSigningIn ? "Sto accedendo..." : "Accedi"}
            </button>
          </form>
          <p className="text-center text-sm">
            Non hai un account?{" "}
            <Link to={"/register"} className="hover:underline font-bold">
              Registrati
            </Link>
          </p>
          <p className="text-center text-sm">
            Hai dimenticato la password?{" "}
            <Link to={"/reset"} className="hover:underline font-bold">
              Reset password
            </Link>
          </p>
          <div className="flex flex-row text-center w-full">
            <div className="border-b-2 mb-2.5 mr-2 w-full"></div>
            <div className="text-sm font-bold w-fit">OPPURE</div>
            <div className="border-b-2 mb-2.5 ml-2 w-full"></div>
          </div>
          <button
            disabled={isSigningIn}
            onClick={onGoogleSignIn}
            className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium ${
              isSigningIn
                ? "cursor-not-allowed"
                : "hover:bg-gray-100 transition duration-300 active:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
                <path
                  d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                  fill="#4285F4"
                />
                <path
                  d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                  fill="#34A853"
                />
                <path
                  d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                  fill="#FBBC04"
                />
                <path
                  d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_17_40">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            {isSigningIn ? "Signing In..." : "Continue with Google"}
          </button>
          {!isEmailRegistered && (
            <p className="text-red-600 text-center mt-4">
              L'email associata al tuo account Google non è registrata.{" "}
              <Link to="/register" className="font-bold hover:underline">
                Registrati
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
