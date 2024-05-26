// src/services/authService.js
import { auth, database, ref, set, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from './firebase';

export const signup = async (firstName, lastName, email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(database, 'users/' + userCredential.user.uid), {
            firstName,
            lastName,
            email,
            apiKey: ''
        });
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};
