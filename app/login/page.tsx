'use client'

import Api from './../api/api';
import React from 'react';

export default function LoginPage() {
	const [registerOrLogin, setRegisterOrLogin] = React.useState<string>('register');
	const [accountAlreadyExists, setAccountAlreadyExists] = React.useState<boolean>(false);
	const api = new Api('/api');
	const [values, setValues] = React.useState({
		name: "",
		password: "",
		email: "",
		pseudo: ""
	});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		const { name, value } = event.target;
		setValues((values) => ({
		...values,
		[name]: value
		}));
	};

	const [submitted, setSubmitted] = React.useState(false);
	const [valid, setValid] = React.useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (registerOrLogin === 'login') {
			const response = await api.users.login(values.email, values.password);
			if (response.status === 200) {
				setValid(true);
				window.location.href = '/';
			} else {
				setValid(false);
			}
			return;
		}
		else {
			if (values.name && values.password && values.email) {
				const response = await api.users.register({
					name: values.name,
					password: values.password,
					email: values.email
				});
	
				if (response.status === 201) {
					setValid(true);
				} else if (response.status === 409) {
					setAccountAlreadyExists(true);
				} else {
					setValid(false);
				}	
			}
		}
		setSubmitted(true);
	};


	const pseudoComponent = () => {
		return (
			<>
				<div>
					Add your pseudo
				</div>
				<input
					className="form-field bg-white"
					type="text"
					placeholder="Pseudo"
					name="pseudo"
					value={values.name}
					onChange={handleInputChange}
				/>
			</>
		);
	}

	if (submitted && valid) {
		return (
			<div className="form-container bg-stone-100 h-screen w-screen flex items-center justify-center">
				<h1 className="success-message  text-2xl">
					Registration Successful!
				</h1>
			</div>
		);
	}

	return (
		<div className=" bg-stone-100 h-screen text-black w-screen flex flex-col items-center gap-24 justify-center">
			<h1 className=" text-4xl">HOTTAKE</h1>

			{registerOrLogin === 'register' ? (
				<button
					onClick={() => setRegisterOrLogin('login')}
					className=""
				>
					Login to your account
				</button>
			) : (
				<button
					onClick={() => setRegisterOrLogin('register')}
					className=""
				>
					Create a new account
				</button>
			)}

			<form className="register-form flex gap-12 flex-col " onSubmit={handleSubmit}>
				{registerOrLogin === 'register' &&
					<>
						{submitted && !values.name && (
							<span id="first-name-error">Please enter a name</span>
						)}
						{!valid && (
							<input
							className="form-field bg-white"
							type="text"
							placeholder="First Name"
							name="name"
							value={values.name}
							onChange={handleInputChange}
							/>
						)}
					</>
				}

				{submitted && !values.email && (
					<span id="email-error">Please enter an email address</span>
				)}
				{!valid && (
					<input
						className="form-field bg-white"
						type="email"
						placeholder="Email"
						name="email"
						value={values.email}
						onChange={handleInputChange}
					/>
				)}


				{!valid && (
					<input
						className="form-field bg-white"
						type="password"
						placeholder="Password"
						name="password"
						value={values.password}
						onChange={handleInputChange}
					/>
				)}

				{accountAlreadyExists && (
					<span id="email-error" className="text-red-500">An account with this email already exists</span>
				)}

				{!valid && (
					<button className="form-field bg-white hover:bg-red-200 duration-100 transition-all" type="submit">
						{registerOrLogin === 'register' ? 'Register' : 'Login'}
					</button>
				)}
			</form>
		</div>
	);
}