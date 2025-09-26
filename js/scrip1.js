import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBoUrn93y9vHSjd6HtqLaajhpT60BxdsAg",
    authDomain: "mibellezaapp-123abc.firebaseapp.com",
    projectId: "mibellezaapp-123abc",
    storageBucket: "mibellezaapp-123abc.firebasestorage.app",
    messagingSenderId: "204759118032",
    appId: "1:204759118032:web:3df271027bdaf01ac82ed5",
    measurementId: "G-CWFGKWLK5T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');
const submitBtn = document.getElementById('submit-btn');
const errorMessage = document.getElementById('error-message');
const toggleLink = document.getElementById('toggle-link');

let isLogin = false; 

function setFormMode(mode) {
    if (mode === 'login') {
        isLogin = true;
        formTitle.textContent = 'Iniciar Sesión';
        formSubtitle.textContent = 'Bienvenida de nuevo, ¡te extrañamos!';
        submitBtn.textContent = 'Acceder';
        toggleLink.innerHTML = '¿No tienes una cuenta? <a href="#">Regístrate</a>';
    } else {
        isLogin = false;
        formTitle.textContent = 'Regístrate';
        formSubtitle.textContent = 'Descubre tu Rutina Ideal';
        submitBtn.textContent = 'Siguiente';
        toggleLink.innerHTML = '¿Ya tienes una cuenta? <a href="#">Inicia Sesión</a>';
    }
    errorMessage.textContent = '';
}

setFormMode('register');

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    setFormMode(isLogin ? 'register' : 'login');
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email === '' || password === '') {
        errorMessage.textContent = 'Por favor, rellena todos los campos.';
        return;
    }

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Inicio de sesión exitoso. Redirigiendo...');
            window.location.href = 'sobrenosotros.html';
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Registro exitoso. Guardando perfil en Firestore...');

            try {
                const userProfileRef = doc(db, `users/${user.uid}/profile`);
                await setDoc(userProfileRef, { email: user.email, createdAt: new Date() }, { merge: true });
                console.log('Perfil de usuario guardado en Firestore.');
            } catch (firestoreError) {
                console.error('Advertencia: No se pudo guardar el perfil del usuario en Firestore.', firestoreError);
            }
            
            window.location.href = 'sobrenosotros.html';
        }
    } catch (error) {
        let message = '';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Error: la cuenta ya existe. Por favor, inicia sesión.';
                setFormMode('login');
                break;
            case 'auth/invalid-email':
                message = 'El formato del correo electrónico es inválido.';
                break;
            case 'auth/weak-password':
                message = 'La contraseña debe tener al menos 6 caracteres.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Correo o contraseña incorrectos.';
                break;
            default:
                message = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
        }
        console.error('Error de autenticación:', error);
        errorMessage.textContent = message;
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuario autenticado. ID:", user.uid);
    } else {
        console.log("No hay usuario autenticado.");
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error en la autenticación anónima:", error);
        }
    }
});