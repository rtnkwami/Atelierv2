<script lang="ts">
  import LoginForm from "$lib/components/auth-components/LoginForm.svelte";
  import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup
  } from 'firebase/auth';
  import { loginFormType } from "$lib/stores/auth.store";
  import { auth, provider } from "$lib/firebase.auth";
  import { currentUser } from "$lib/stores/auth.store";
  import { goto } from "$app/navigation";

  // Async/await is needed here because it's an external API call.
  // The response must be returned before we can determine whether or not to route to the home page
  // If no async/await, redirect will never happen

  async function signIn (email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
    if ($currentUser) {
      goto('/');
    }
  }

  async function signUp (email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, password);
    if ($currentUser) {
      goto('/');
    }
  }

  async function googleOAuth(): Promise<void> {
    provider.addScope('profile');
    provider.addScope('email');
    const user = await signInWithPopup(auth, provider);
    currentUser.set(user.user);

    if ($currentUser) {
      goto('/');
    }
  }

</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href="##" class="flex items-center gap-2 self-center font-medium">
      <div
        class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
      >
        <GalleryVerticalEndIcon class="size-4" />
      </div>
      Atelier
    </a>
    {#if $loginFormType == "Log in"}
        <LoginForm login={signIn} oAuth={googleOAuth} />
    {:else}
        <LoginForm login={signUp} oAuth={googleOAuth} />
    {/if}

  </div>
</div>