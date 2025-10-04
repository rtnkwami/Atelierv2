import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import { auth } from "$lib/firebase.auth";
import { onAuthStateChanged, type User } from "firebase/auth";

export const loginFormType = writable("Log in");
export const accountVerb = writable("Don't");
export const loginFormAction = writable("Sign Up");

export let currentUser: Writable<User> = writable();

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser.set(user);
    }
})