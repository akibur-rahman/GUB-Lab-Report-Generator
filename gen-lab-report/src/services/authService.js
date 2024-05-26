import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, set, ref, database } from './firebase';


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
