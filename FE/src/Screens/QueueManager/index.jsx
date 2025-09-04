import React, { useEffect, useMemo, useState } from "react";
import Container from "../../Components/Container";
import api from "../../api/AxiosInterceptor";
import ENDPOINTS from "../../Utils/Endpoints";

const DEFAULT_INTERVAL_MIN = 60;

const QueueManager = () => {
	const [strategy, setStrategy] = useState("last"); // "next" | "last"
	const [intervalMin, setIntervalMin] = useState(DEFAULT_INTERVAL_MIN);
	const [startTime, setStartTime] = useState(""); // optional HH:mm
	const [posts, setPosts] = useState([]);
	const [saveMessage, setSaveMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		try {
			const raw = localStorage.getItem("queue_prefs");
			if (raw) {
				const prefs = JSON.parse(raw);
				if (prefs?.strategy) setStrategy(prefs.strategy);
				if (prefs?.intervalMin) setIntervalMin(Number(prefs.intervalMin) || DEFAULT_INTERVAL_MIN);
				if (prefs?.startTime) setStartTime(prefs.startTime);
			}
		} catch (_) {}
	}, []);

	useEffect(() => {
		const fetchPosts = async () => {
			setError("");
			try {
				const data = await api.get({ url: ENDPOINTS.OTHER.GET_POSTS });
				setPosts(Array.isArray(data) ? data : []);
			} catch (e) {
				setError(e?.message || "Failed to load scheduled posts");
			}
		};
		fetchPosts();
	}, []);

	const futurePosts = useMemo(() => {
		const now = new Date();
		return posts
			.filter((p) => p?.scheduledDateTime && new Date(p.scheduledDateTime) > now)
			.sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime));
	}, [posts]);

	const nextBaseline = useMemo(() => {
		const now = new Date();
		if (strategy === "next") {
			// Schedule relatively soon: now + interval
			return new Date(now.getTime() + Math.max(5, intervalMin) * 60000);
		}
		// last: after the latest scheduled post
		const last = futurePosts[futurePosts.length - 1]?.scheduledDateTime;
		const base = last ? new Date(last) : now;
		return new Date(base.getTime() + Math.max(5, intervalMin) * 60000);
	}, [strategy, intervalMin, futurePosts]);

	const previewTimes = useMemo(() => {
		const previews = [];
		let cursor = new Date(nextBaseline);
		for (let i = 0; i < 5; i++) {
			const d = new Date(cursor);
			if (startTime) {
				const [hh, mm] = startTime.split(":").map((n) => Number(n) || 0);
				d.setHours(hh, mm, 0, 0);
				if (d < new Date()) d.setDate(d.getDate() + 1);
			}
			previews.push(d);
			cursor = new Date(cursor.getTime() + Math.max(5, intervalMin) * 60000);
		}
		return previews;
	}, [nextBaseline, intervalMin, startTime]);

	const savePreferences = () => {
		try {
			const prefs = { strategy, intervalMin, startTime };
			localStorage.setItem("queue_prefs", JSON.stringify(prefs));
			setSaveMessage("Preferences saved. Bulk uploads will auto-queue using these settings.");
			setTimeout(() => setSaveMessage(""), 2500);
		} catch (e) {
			setError("Failed to save preferences");
		}
	};

	return (
		<Container>
			<div className="flex flex-col gap-6">
				<h1 className="text-whiteColor text-xl font-semibold">Queue Manager</h1>

				<div className="grid md:grid-cols-3 grid-cols-1 gap-6">
					<div className="md:col-span-2 bg-whiteColor dark:bg-backgroundDark rounded-md p-4 shadow-custom">
						<h2 className="text-black dark:text-whiteColor font-semibold mb-3">Queueing Options for Bulk Upload</h2>
						{error ? <p className="text-red-600 text-sm mb-2">{error}</p> : null}

						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Strategy</p>
								<div className="flex items-center gap-6">
									<label className="flex items-center gap-2 text-sm">
										<input type="radio" name="strategy" checked={strategy === "next"} onChange={() => setStrategy("next")} />
										<span>Auto-queue Next</span>
									</label>
									<label className="flex items-center gap-2 text-sm">
										<input type="radio" name="strategy" checked={strategy === "last"} onChange={() => setStrategy("last")} />
										<span>Auto-queue Last</span>
									</label>
								</div>
							</div>

							<div className="grid sm:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Interval (minutes)</p>
									<input type="number" min={5} value={intervalMin} onChange={(e) => setIntervalMin(Number(e.target.value) || DEFAULT_INTERVAL_MIN)} className="w-full p-2 rounded-md border border-gray bg-InputFieldColor outline-none" />
								</div>
								<div>
									<p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Preferred Posting Time (optional)</p>
									<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 rounded-md border border-gray bg-InputFieldColor outline-none" />
								</div>
							</div>

							<div className="mt-2">
								<button onClick={savePreferences} className="px-4 py-2 rounded-md text-white bg-primaryColor">Save Preferences</button>
								{saveMessage ? <p className="text-green-600 text-sm mt-2">{saveMessage}</p> : null}
							</div>
						</div>
					</div>

					<div className="bg-whiteColor dark:bg-backgroundDark rounded-md p-4 shadow-custom">
						<h3 className="text-black dark:text-whiteColor font-semibold mb-2">Preview</h3>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Based on your settings, upcoming bulk uploads will be scheduled approximately at:</p>
						<ul className="list-disc ml-5 space-y-1 text-sm text-gray-800 dark:text-gray-200">
							{previewTimes.map((d, i) => (
								<li key={i}>{d.toLocaleString()}</li>
							))}
						</ul>
						{futurePosts.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 dark:text-gray-300">Currently scheduled posts: {futurePosts.length}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</Container>
	);
};

export default QueueManager;


