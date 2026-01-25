'use client'

import Api from './../../api/api';
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
					pseudo: values.pseudo,
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

	React.useEffect(() => {
		(async () => {
			const me = await api.users.getMe();
			if (me.status === 200) {
				window.location.href = '/';
			}
		})()
	}, []);

	if (submitted && valid) {
		return (
			<div className="form-container h-screen w-screen flex items-center justify-center">
				<h1 className="success-message  text-2xl">
					Registration Successful!
				</h1>
			</div>
		);
	}

	return (
		<div className=" h-screen text-white w-screen text-[10px] flex flex-col relative">
			<div className="h-full w-full backdrop-blur-[150px] z-10 overflow-hidden" />
            <div
                style={{
                    backgroundImage: `url('/cocteauBackground.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(100px)',
                    zIndex: -1,
                }} className="absolute top-0 left-0 h-1/2 w-full"
            />
			<div className="w-full bg-[#0c0c0e] h-full"></div>
			<div className="absolute left-1/2 top-1/2 w-120 bg-[#181819] rounded-lg transform z-20 -translate-1/2 px-16 py-16">
				
				{registerOrLogin === 'register' ? (
					<div className="mb-8">
						<div className=" text-[20px]">Register</div>
						<>
							<span className="ml-1 mt-1 opacity-50">
								Already have an account ?
								<button
									onClick={() => setRegisterOrLogin('login')}
									className="text-blue-400 ml-1">
									Log in
								</button>
							</span> 
						</>
					</div>
				) : (
					<div className="mb-8">
						<div className=" text-[20px]">Log in</div>
						<>
							<span className="mt-1 opacity-50">
								Don't have an account ?
								<button
									onClick={() => setRegisterOrLogin('register')}
									className="ml-1 text-blue-400">
									Register
								</button>
							</span> 
						</>
					</div>
				)}

				<form className="register-form flex gap-10 flex-col " onSubmit={handleSubmit}>
					{registerOrLogin === 'register' &&
						<>
							{submitted && !values.name && (
								<span id="first-name-error">Please enter a name</span>
							)}
							{!valid && (
								<div className="flex flex-col gap-1 text-[8px]">
									Name
									<input
										className="form-field outline-none focus:ring-1 autofill:bg-transparent autofill:text-inherit ring-white/10 px-4 py-3 rounded-md text-[10px] bg-white/5"
										type="text"
										placeholder="John Doe"
										name="name"
										value={values.name}
										onChange={handleInputChange}
									/>
								</div>
							)}

							{submitted && !values.pseudo && (
								<span id="first-name-error">Please enter a pseudo</span>
							)}
							{!valid && (
								<div className="flex flex-col gap-1 text-[8px]">
									Pseudo
									<input
										className="form-field outline-none focus:ring-1 autofill:bg-transparent autofill:text-inherit ring-white/10 px-4 py-3 rounded-md text-[10px] bg-white/5"
										type="text"
										placeholder="Hottaker3000"
										name="pseudo"
										value={values.pseudo}
										onChange={handleInputChange}
									/>
								</div>
							)}
						</>
					}

					{submitted && !values.email && (
						<span id="email-error">Please enter an email address</span>
					)}
					{!valid && (
						<div className="flex flex-col gap-1 text-[8px]">
							Email
							<input
								className="form-field outline-none autofill:bg-transparent autofill:text-inherit focus:ring-1 ring-white/10 px-4 py-3 rounded-md text-[10px] bg-white/5"
								type="email"
								placeholder="example@gmail.com"
								name="email"
								value={values.email}
								onChange={handleInputChange}
							/>
						</div>
					)}


					{!valid && (
						<div className="flex flex-col gap-1 text-[8px]">
							Password
							<input
								className="form-field outline-none focus:ring-1 ring-white/10 px-4 py-3 rounded-md text-[10px] bg-white/5"
								type="password"
								placeholder="Password"
								name="password"
								value={values.password}
								onChange={handleInputChange}
							/>
						</div>
					)}

					{accountAlreadyExists && (
						<span id="email-error" className="text-red-500">An account with this email already exists</span>
					)}

					{!valid && (
						<button className="form-field px-4 py-3 rounded-md mt-4 bg-[#AC2C33] hover:bg-red-500 duration-100 transition-all" type="submit">
							{registerOrLogin === 'register' ? 'Register' : 'Login'}
						</button>
					)}
				</form>
			</div>
		</div>
	);
}
