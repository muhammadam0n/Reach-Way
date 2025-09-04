import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../../Components/Container";
import api from "../../api/AxiosInterceptor";
import ENDPOINTS from "../../Utils/Endpoints";

const AIImageStudio = () => {
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [generatedImages, setGeneratedImages] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");

	const [isChatOpen, setIsChatOpen] = useState(false);
	const [ideaText, setIdeaText] = useState("");
	const [isSuggesting, setIsSuggesting] = useState(false);
	const [suggestedPrompts, setSuggestedPrompts] = useState([]);
	const [referenceFile, setReferenceFile] = useState(null);
	const [chatError, setChatError] = useState("");

	const canvaApiKey = import.meta.env.VITE_CANVA_API_KEY;
	const navigate = useNavigate();

	useEffect(() => {
		const existing = document.querySelector('script[data-canva-sdk]');
		if (existing) return;
		const script = document.createElement("script");
		script.src = "https://sdk.canva.com/v1/canva.js";
		script.async = true;
		script.defer = true;
		script.setAttribute("data-canva-sdk", "true");
		document.body.appendChild(script);
		return () => {
			if (script && script.parentNode) {
				script.parentNode.removeChild(script);
			}
		};
	}, []);

	const handleGenerateImage = async () => {
		setErrorMessage("");
		if (!prompt.trim()) {
			setErrorMessage("Please enter a prompt.");
			return;
		}
		setIsGenerating(true);
		try {
			const res = await api.post({ url: ENDPOINTS.AI.GENERATE_IMAGE, data: { prompt } });
			if (res?.imageBase64) {
				setGeneratedImages([res.imageBase64, ...generatedImages]);
			}
		} catch (err) {
			setErrorMessage(err?.message || "Failed to generate image.");
		} finally {
			setIsGenerating(false);
		}
	};

	const openCanva = () => {
		try {
			if (window.Canva && canvaApiKey) {
				window.open("https://www.canva.com/design/", "_blank");
			} else {
				window.open("https://www.canva.com/", "_blank");
			}
		} catch (_) {
			window.open("https://www.canva.com/", "_blank");
		}
	};

	const handleGeneratePrompts = async () => {
		setSuggestedPrompts([]);
		setChatError("");
		if (!ideaText.trim() && !referenceFile) return;
		setIsSuggesting(true);
		try {
			if (referenceFile) {
				const form = new FormData();
				if (ideaText) form.append("idea", ideaText);
				form.append("image", referenceFile);
				const res = await api.post({ url: "ai/generate-prompts-from-image", data: form });
				if (Array.isArray(res?.prompts)) setSuggestedPrompts(res.prompts);
			} else {
				const res = await api.post({ url: ENDPOINTS.AI.GENERATE_PROMPTS, data: { idea: ideaText } });
				if (Array.isArray(res?.prompts)) setSuggestedPrompts(res.prompts);
			}
		} catch (err) {
			setChatError(err?.message || "Failed to generate prompts.");
		} finally {
			setIsSuggesting(false);
		}
	};

	const usePrompt = (p) => {
		setPrompt(p);
		setIsChatOpen(false);
	};

	const useInContentLibrary = (src) => {
		try {
			localStorage.setItem("draft_ai_image", src);
			navigate("/content-library");
		} catch (_) {
			navigate("/content-library");
		}
	};

	return (
		<Container>
			<div className="flex flex-col gap-6">
				<h1 className="text-whiteColor text-xl font-semibold">AI Image Studio</h1>

				<div className="grid md:grid-cols-2 grid-cols-1 gap-6">
					{/* Prompt to Image */}
					<div className="bg-whiteColor dark:bg-backgroundDark rounded-md p-4 shadow-custom">
						<h2 className="text-black dark:text-whiteColor font-semibold mb-3">Generate from Prompt</h2>
						<textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Describe the image you want..."
							className="w-full h-32 p-3 rounded-md border border-gray outline-none bg-InputFieldColor text-gray-700 placeholder:text-PlaceholderColor"
						/>
						{errorMessage ? (
							<p className="text-red-600 text-sm mt-2">{errorMessage}</p>
						) : null}
						<div className="mt-3 flex items-center gap-3">
							<button
								onClick={handleGenerateImage}
								disabled={isGenerating}
								className={`px-4 py-2 rounded-md text-white ${isGenerating ? "bg-gray" : "bg-primaryColor"}`}
							>
								{isGenerating ? "Generating..." : "Generate Image"}
							</button>
						</div>
					</div>

					{/* Generated images section (replaces Canva card) */}
					<div className="bg-whiteColor dark:bg-backgroundDark rounded-md p-4 shadow-custom">
						<h3 className="text-black dark:text-whiteColor font-semibold mb-3">Generated Images</h3>
						{generatedImages.length === 0 ? (
							<p className="text-sm text-gray-600 dark:text-gray-300">No images yet. Generate one to see results here.</p>
						) : (
							<div className={`grid gap-4 ${generatedImages.length === 1 ? "grid-cols-1 place-items-center" : generatedImages.length === 2 ? "grid-cols-2" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
								{generatedImages.map((src, idx) => (
									<div key={idx} className="rounded-md overflow-hidden border border-gray bg-InputFieldColor">
										<img src={src} alt={`ai-${idx}`} className="w-full h-48 object-cover cursor-pointer" onClick={() => useInContentLibrary(src)} title="Click to draft in Content Library" />
										<div className="p-2 flex justify-between items-center">
											<a href={src} download={`ai-image-${idx}.png`} className="text-primaryColor text-sm">Download</a>
											<button onClick={() => navigator.clipboard.writeText(prompt)} className="text-sm text-gray-700">Copy prompt</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Floating Canva and Chatbot Buttons */}
				<button
					onClick={openCanva}
					className="fixed bottom-20 right-6 bg-primaryColor text-white px-4 py-3 rounded-full shadow-lg"
				>
					Open Canva
				</button>
				<button
					onClick={() => setIsChatOpen(true)}
					className="fixed bottom-6 right-6 bg-primaryColor text-white px-4 py-3 rounded-full shadow-lg"
				>
					Need prompt ideas?
				</button>

				{isChatOpen && (
					<div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
						<div className="bg-whiteColor dark:bg-backgroundDark w-full md:w-[520px] rounded-t-lg md:rounded-lg p-4">
							<div className="flex items-center justify-between">
								<h4 className="text-black dark:text-whiteColor font-semibold">Prompt Assistant</h4>
								<button onClick={() => setIsChatOpen(false)} className="text-gray-600">Close</button>
							</div>
							<div className="mt-3 space-y-3">
								<textarea
									value={ideaText}
									onChange={(e) => setIdeaText(e.target.value)}
									placeholder="Describe your idea... (optional)"
									className="w-full h-24 p-3 rounded-md border border-gray outline-none bg-InputFieldColor text-gray-700 placeholder:text-PlaceholderColor"
								/>
								<input type="file" accept="image/*" onChange={(e) => setReferenceFile(e.target.files?.[0] || null)} />
								<div className="mt-3 flex items-center justify-between">
									<button onClick={handleGeneratePrompts} disabled={isSuggesting} className={`px-4 py-2 rounded-md text-white ${isSuggesting ? "bg-gray" : "bg-primaryColor"}`}>
										{isSuggesting ? "Thinking..." : "Generate prompts"}
									</button>
								</div>
								{chatError ? <p className="text-red-600 text-sm">{chatError}</p> : null}
								{suggestedPrompts.length > 0 && (
									<div className="mt-2 space-y-2 max-h-64 overflow-auto custom-scrollbar">
										{suggestedPrompts.map((p, i) => (
											<div key={i} className="p-3 rounded-md border border-gray bg-InputFieldColor flex items-start justify-between gap-3">
												<p className="text-sm text-gray-800 flex-1">{p}</p>
												<button onClick={() => usePrompt(p)} className="text-primaryColor text-sm whitespace-nowrap">Use prompt</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</Container>
	);
};

export default AIImageStudio; 