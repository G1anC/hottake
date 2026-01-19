'use client'

import Api from './api/api';
import React from 'react';

export default function App() {
	const api = new Api();
	const [values, setValues] = React.useState({
		name: "",
		password: "",
		email: ""
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (values.name && values.password && values.email) {
			setValid(true);
			api.users.register({
				name: values.name,
				password: values.password,
				email: values.email
			});
		}
		setSubmitted(true);
	};

	if (submitted && valid) {
		return (
			<div className="form-container bg-[#2b2b2b] h-screen w-screen flex items-center justify-center">
				<h1 className="success-message text-white text-2xl">
					Registration Successful!
				</h1>
			</div>
		);
	}

	return (
		<div className="form-container bg-[#2b2b2b] h-screen w-screen flex items-center justify-center">
			<form className="register-form bg-white" onSubmit={handleSubmit}>
				{!valid && (
					<input
						className="form-field"
						type="text"
						placeholder="First Name"
						name="name"
						value={values.name}
						onChange={handleInputChange}
					/>
				)}
				{submitted && !values.name && (
					<span id="first-name-error">Please enter a first name</span>
				)}

				{!valid && (
					<input
						className="form-field"
						type="password"
						placeholder="Password"
						name="password"
						value={values.password}
						onChange={handleInputChange}
					/>
				)}

				{submitted && !values.password && (
					<span id="last-name-error">Please enter a last name</span>
				)}

				{!valid && (
					<input
						className="form-field"
						type="email"
						placeholder="Email"
						name="email"
						value={values.email}
						onChange={handleInputChange}
					/>
				)}

				{submitted && !values.email && (
					<span id="email-error">Please enter an email address</span>
				)}
				{!valid && (
					<button className="form-field" type="submit">
						Register
					</button>
				)}
			</form>
		</div>
	);
}
