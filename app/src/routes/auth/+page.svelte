<script lang="ts">
  import LoginForm from "$lib/components/auth-components/LoginForm.svelte";
  import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";

  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
  import { app } from "$lib/firebase.auth";

  import { loginFormType } from "$lib/components/auth-components/auth.store";

  const auth = getAuth(app);

  function signIn (email: string, password: string): void {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
  }

  function signUp (email: string, password: string): void {
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }

    let mode: "login" | "signup" = $state("login");
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
        <LoginForm login={signIn} />
    {:else}
        <LoginForm login={signUp} />
    {/if}

  </div>
</div>