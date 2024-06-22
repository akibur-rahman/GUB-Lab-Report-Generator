// authService.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from './firebase';
import { set, ref, database } from './firebase';

export const signup = async (firstName, lastName, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user information to the database
        await set(ref(database, 'users/' + user.uid), {
            firstName,
            lastName,
            email,
            apiKey: ''
        });

        console.log('User signed up:', user);
    } catch (error) {
        throw new Error(error.message);
    }
};

export const login = async (email, password, navigate) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in:', user);
        navigate('/app'); // Redirect to the application page after successful login
    } catch (error) {
        throw new Error(error.message);
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent');
    } catch (error) {
        throw new Error(error.message);
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
        console.log('User logged out');
    } catch (error) {
        throw new Error(error.message);
    }
};
