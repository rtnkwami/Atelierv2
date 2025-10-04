<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";
    import { goto } from "$app/navigation";
    import { currentUser, authLoading } from "$lib/stores/auth.store";

    let data: JSON | undefined = $state();

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
    Login
</Button>

{#if $authLoading}
  <p>Loading...</p>
{:else if $currentUser}
  <p>Hello {$currentUser.email}</p>
  <p>{ data?.message }</p>
{:else}
  <p>Please log in</p>
{/if}