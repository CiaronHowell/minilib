<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as Form from '$lib/components/ui/form';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { emailSchema, passwordSchema, type EmailSchema, type PasswordSchema } from './schema.js';
	import type { User } from '$lib/server/auth/user.js';

	let {
		data
	}: {
		data: {
			emailForm: SuperValidated<Infer<EmailSchema>>;
			passwordForm: SuperValidated<Infer<PasswordSchema>>;
			user: User;
			recoveryCode: string[] | null;
		};
	} = $props();

	const emailForm = superForm(data.emailForm, {
		validators: zod4Client(emailSchema)
	});
	const { form: emailFormData, message: emailMessage, enhance: emailEnhance } = emailForm;

	const passwordForm = superForm(data.passwordForm, {
		validators: zod4Client(passwordSchema)
	});
	const {
		form: passwordFormData,
		message: passwordMessage,
		enhance: passwordEnhance
	} = passwordForm;
</script>

<div class="flex grow justify-center">
	<div class="flex w-2/3 flex-col gap-5 p-5">
		<h1 class="text-2xl font-bold">Settings</h1>
		<div class="grid grid-cols-2 grid-cols-[30%_auto] gap-5">
			<Separator class="col-span-2" />
			<h2 class="font-semibold">Update email</h2>
			<div class="flex flex-col gap-2">
				<form method="post" use:emailEnhance action="?/email">
					<Form.Field form={emailForm} name="email">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Description class="-text-muted text-base font-light">
									Your email: <span class="font-semibold">{data.user.email}</span>
								</Form.Description>
								<div class="flex gap-2">
									<Form.Label class="text-base font-light">New email:</Form.Label>
									<Input {...props} class="w-fit" bind:value={$emailFormData.email} />
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					{#if $emailMessage}
						<Form.Description
							class={$emailMessage.type == 'success' ? 'text-green-500' : 'text-red-500'}
						>
							{$emailMessage.text}
						</Form.Description>
					{/if}
					<Form.Button>Update</Form.Button>
				</form>
			</div>
			<Separator class="col-span-2" />
			<h2 class="font-semibold">Update password</h2>
			<form method="post" use:passwordEnhance action="?/password">
				<Form.Field form={passwordForm} name="currPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-base font-light">Current password</Form.Label>
							<Input {...props} type="password" bind:value={$passwordFormData.currPassword} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={passwordForm} name="newPassword">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-base font-light">New password</Form.Label>
							<Input {...props} type="password" bind:value={$passwordFormData.newPassword} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
					{#if $passwordMessage}
						<Form.Description
							class={$passwordMessage.type == 'success' ? 'text-green-500' : 'text-red-500'}
						>
							{$passwordMessage.text}
						</Form.Description>
					{/if}
				</Form.Field>
				<Form.Button>Update</Form.Button>
			</form>
			{#if data.user.registered2FA}
				<Separator class="col-span-2" />
				<h2 class="font-semibold">Update two-factor authentication</h2>
				<div class="flex items-center">
					<Button href="/2fa/setup">Change authentication application</Button>
				</div>
			{/if}
			{#if data.recoveryCode !== null}
				<Separator class="col-span-2" />
				<h1 class="font-semibold">Recovery code</h1>
				<div class="flex items-center gap-4">
					<p class="font-light">
						Your recovery code is: <span class="font-bold">{data.recoveryCode}</span>
					</p>
					<Button>Generate new code</Button>
				</div>
			{/if}
		</div>
	</div>
</div>
