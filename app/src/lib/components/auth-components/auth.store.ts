import { writable } from "svelte/store";

export const loginFormType = writable("Log in");
export const accountVerb = writable("Don't");
export const loginFormAction = writable("Sign Up")