<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { currentUser } from "$lib/stores/auth.store";
    import { signOut } from "firebase/auth";
    import { auth } from "$lib/firebase.auth";

    let data: JSON | undefined = $state();

    async function logOut() {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error("Error on log out: ", error);
        }
    }

    // react to the change in auth state and use user access token to call API for some data.
    $effect(()=> {
        if (!$currentUser) return;

        (async () => {
            const token = await $currentUser?.getIdToken();
            const response = await fetch('http://localhost:5000/', {
                headers: {
                    Authorization: `Bearer ${ token }`
                }
            })
            data = await response.json();
        })();
    })
</script>

<Button class='cursor-pointer'  onclick={() => { goto('/login') }}>
    Log In
</Button>

<Button class='cursor-pointer'  onclick={() => { 
        logOut();
    }}>
    Log Out
</Button>

{#if $currentUser}
  <p>Hello {$currentUser.email}</p>
  <p>{ data?.message }</p>
{:else}
  <p>Please log in</p>
{/if}