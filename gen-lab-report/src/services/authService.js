// src/services/authService.js
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export const signup = async (firstName, lastName, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up:', user);
        // Optionally save additional user information to your database here
    } catch (error) {
        throw new Error(error.message);
    }
};

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User logged in:', user);
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
