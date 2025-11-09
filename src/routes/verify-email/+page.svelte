<script lang="ts">
	import * as InputOTP from '$lib/components/ui/input-otp';
	import * as Form from '$lib/components/ui/form';

	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema';

	let { data }: { data: { email: string; form: SuperValidated<Infer<Schema>> } } = $props();
	// TODO: Don't think i've done this correctly

	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});
    const message = form.message;
	const { form: formData, enhance } = form;
</script>

<div class="m-auto flex flex-col rounded-xl border p-7">
	<div class="flex flex-col gap-3">
		<div>
			<h1 class="text-2xl font-medium">Verify your email address</h1>
			<p class="text-sm font-light text-gray-600">
				We sent an 8-digit code to:
				<br />
				<span class="font-medium">{data.email}</span>
			</p>
		</div>
		<form method="post" action="?/verify" use:enhance>
			<Form.Field {form} name="code">
				<Form.Control>
					{#snippet children({ props })}
						<InputOTP.Root {...props} maxlength={8} bind:value={$formData.code}>
							{#snippet children({ cells })}
								<InputOTP.Group>
									{#each cells.slice(0, 3) as cell}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(3, 5) as cell}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
								<InputOTP.Separator />
								<InputOTP.Group>
									{#each cells.slice(5, 8) as cell}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
					{/snippet}
				</Form.Control>
				{#if $message}
					<Form.Description>{$message}</Form.Description>
				{/if}
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Verify</Form.Button>
			<Form.Button variant="secondary" type="submit" formaction="?/resend" formnovalidate
				>Resend code</Form.Button
			>
			<!-- TODO: Move this to nav, under an account button -->
			<Form.Button variant="link" href="/settings">Change your email</Form.Button>
		</form>
	</div>
</div>
