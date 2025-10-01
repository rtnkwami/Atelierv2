<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Card from "$lib/components/ui/card/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { loginFormType, loginFormAction, accountVerb } from "./auth.store";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		login(email: string, password: string): void;
	}

	let { login, class: className, ...restProps }: Props = $props();

	const id = $props.id();

	function toggleFormType(){
		if ($loginFormType === "Log in"){
			loginFormType.set("Sign up");
			accountVerb.set("Already")
			loginFormAction.set("Log in")
		} else {
			loginFormType.set("Log in");
			accountVerb.set("Don't")
			loginFormAction.set("Sign up")
		}

	}

	let email = $state("");
	let password = $state("");
</script>

<div class={cn("flex flex-col gap-6", className)} {...restProps}>
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-xl">Welcome back</Card.Title>
			<Card.Description>{ $loginFormType } with your Google account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={() => { login(email, password) }}>
				<div class="grid gap-6">
					<div class="flex flex-col gap-4">
						<Button variant="outline" class="w-full cursor-pointer">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							{ $loginFormType } with Google
						</Button>
					</div>
					<div
						class="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
					>
						<span class="bg-card text-muted-foreground relative z-10 px-2">
							Or continue with
						</span>
					</div>
					<div class="grid gap-6">
						<div class="grid gap-3">
							<Label for="email-{id}">Email</Label>
							<Input
								id="email-{id}"
								type="email"
								placeholder="m@example.com"
								required
								bind:value={email} 
							/>
							<!-- bind:value is called here to bind the result of email input to the password state
							 variable that was declared at the top -->
						</div>
						<div class="grid gap-3">
							<div class="flex items-center">
								<Label for="password-{id}">Password</Label>
								<a
									href="##"
									class="ml-auto text-sm underline-offset-4 hover:underline"
								>
									Forgot your password?
								</a>
							</div>
							<!-- bind:value is called here to bind the result of password input to the password state
							 variable that was declared at the top -->
							<Input id="password-{id}" type="password" required bind:value={password}/>
						</div>
						<Button type="submit" class="w-full">{ $loginFormType }</Button>
					</div>
					<div class="text-center text-sm">
						{ $accountVerb } have an account?
						<a href="##" onclick={toggleFormType} class="underline underline-offset-4"> { $loginFormAction } </a>
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
	<div
		class="text-muted-foreground *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4 text-balance text-center text-xs"
	>
		By clicking continue, you agree to our <a href="##">Terms of Service</a>
		and <a href="##">Privacy Policy</a>.
	</div>
</div>
