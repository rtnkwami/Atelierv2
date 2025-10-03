import { writable } from "svelte/store";
import { auth } from "$lib/firebase.auth";
import { onAuthStateChanged } from "firebase/auth";

export const loginFormType = writable("Log in");
export const accountVerb = writable("Don't");
export const loginFormAction = writable("Sign Up");

export let currentUser = writable();

onAuthStateChanged(auth, (user) => {
    currentUser.set(user);
})