import axios from "axios";
import type React from "react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../../style.css";

const Popup = () => {
	const [serverStatus, setServerStatus] = useState<string>("Checking...");
	const [formData, setFormData] = useState({
		name: "",
		emails: "",
		company: "",
		type: "opportunity_saw",
	});
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const checkServer = async () => {
		try {
			const response = await axios.get("http://localhost:3000/");
			setServerStatus(response.data.status);
		} catch (err) {
			setServerStatus("Server Offline");
		}
	};

	useEffect(() => {
		const saved = localStorage.getItem("emailSenderState");
		if (saved) {
			try {
				setFormData(JSON.parse(saved));
			} catch (e) {
				console.error(e);
			}
		}
		checkServer();
	}, []);

	useEffect(() => {
		localStorage.setItem("emailSenderState", JSON.stringify(formData));
	}, [formData]);

	const handleClear = () => {
		setFormData({
			name: "",
			emails: "",
			company: "",
			type: "opportunity_saw",
		});
		setResult(null);
		setError(null);
		localStorage.removeItem("emailSenderState");
	};

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		// Parse emails from textarea (comma or newline separated)
		const emailList = formData.emails
			.split(/[\n,]/)
			.map((email) => email.trim())
			.filter((email) => email.length > 0);

		if (emailList.length === 0) {
			setError("Please enter at least one email address.");
			setLoading(false);
			return;
		}

		try {
			const response = await axios.post("http://localhost:3000/send-email", {
				name: formData.name,
				emails: emailList,
				company: formData.company,
				type: formData.type,
			});
			setResult(response.data);
		} catch (err: any) {
			setError(err.response?.data?.error || err.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 w-96 bg-gray-50 min-h-screen">
			<h1 className="text-2xl font-bold mb-4 text-gray-800">Email Sender</h1>

			<div className="mb-4 flex items-center justify-between bg-white p-2 rounded shadow-sm">
				<span className="text-sm font-medium text-gray-600">
					Server Status:
				</span>
				<span
					className={`text-sm font-bold ${
						serverStatus === "Server is running"
							? "text-green-600"
							: "text-red-600"
					}`}
				>
					{serverStatus}
				</span>
				<button
					onClick={checkServer}
					className="ml-2 text-xs text-blue-500 hover:underline"
					type="button"
				>
					Refresh
				</button>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-3"
			>
				<div>
					<label
						className="block text-sm font-medium text-gray-700"
						htmlFor="name"
					>
						Recipient Name
					</label>
					<input
						type="text"
						name="name"
						value={formData.name}
						onChange={handleChange}
						required
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
						placeholder="John Doe"
					/>
				</div>

				<div>
					<label
						className="block text-sm font-medium text-gray-700"
						htmlFor="company"
					>
						Company
					</label>
					<input
						type="text"
						name="company"
						value={formData.company}
						onChange={handleChange}
						required
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
						placeholder="Acme Corp"
					/>
				</div>

				<div>
					<label
						className="block text-sm font-medium text-gray-700"
						htmlFor="emails"
					>
						Emails (comma or new line separated)
					</label>
					<textarea
						name="emails"
						value={formData.emails}
						onChange={handleChange}
						required
						rows={3}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
						placeholder="john@example.com, jane@example.com"
					/>
				</div>

				<div>
					<label
						className="block text-sm font-medium text-gray-700"
						htmlFor="type"
					>
						Email Type
					</label>
					<select
						name="type"
						value={formData.type}
						onChange={handleChange}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
					>
						<option value="opportunity_saw">Opportunity Saw</option>
						<option value="love_their_work">Love Their Work</option>
						<option value="ways_to_add_to_team">Ways to Add to Team</option>
					</select>
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleClear}
						className="w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						Clear
					</button>
					<button
						type="submit"
						disabled={loading || serverStatus !== "Server is running"}
						className={`w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
							loading || serverStatus !== "Server is running"
								? "bg-gray-400 cursor-not-allowed"
								: "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						}`}
					>
						{loading ? "Sending..." : "Send Emails"}
					</button>
				</div>
			</form>

			{error && (
				<div className="mt-4 p-2 bg-red-100 text-red-700 rounded text-sm">
					{error}
				</div>
			)}

			{result && (
				<div className="mt-4 p-2 bg-green-50 rounded border border-green-200">
					<h3 className="text-sm font-bold text-green-800 mb-2">Results:</h3>
					<ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
						{result.results.map((res: any, idx: number) => (
							<li
								key={idx}
								className={
									res.status === "sent" ? "text-green-600" : "text-red-600"
								}
							>
								{res.email}: {res.status}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(<Popup />);
