document.querySelector('.year').textContent = new Date().getFullYear();

const themeToggle = document.getElementById('theme-toggle');
const themeColorMeta = document.getElementById('theme-color-meta');

const themeColors = {
	dark: '#0f0f0f',
	light: '#f5f0e8'
};

const prefersLightScheme = window.matchMedia('(prefers-color-scheme: light)');

const getStoredTheme = () => window.localStorage.getItem('portfolio-theme');

const getPreferredTheme = () => {
	const storedTheme = getStoredTheme();
	if (storedTheme === 'dark' || storedTheme === 'light') {
		return storedTheme;
	}

	return prefersLightScheme.matches ? 'light' : 'dark';
};

const applyTheme = (theme) => {
	const resolvedTheme = theme === 'light' ? 'light' : 'dark';
	document.documentElement.dataset.theme = resolvedTheme;
	if (themeToggle) {
		themeToggle.setAttribute('aria-pressed', String(resolvedTheme === 'light'));
		themeToggle.setAttribute('aria-label', resolvedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
	}
	if (themeColorMeta) {
		themeColorMeta.setAttribute('content', themeColors[resolvedTheme]);
	}
	window.localStorage.setItem('portfolio-theme', resolvedTheme);
};

applyTheme(getPreferredTheme());

if (themeToggle) {
	themeToggle.addEventListener('click', () => {
		const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
		applyTheme(nextTheme);
	});
}

prefersLightScheme.addEventListener?.('change', (event) => {
	if (!getStoredTheme()) {
		applyTheme(event.matches ? 'light' : 'dark');
	}
});

const modal = document.getElementById('project-modal');
const projectCards = document.querySelectorAll('[data-project]');
const closeButtons = modal ? modal.querySelectorAll('[data-close-modal]') : [];

const projectDetails = {
	credit: {
		title: 'Explainable Credit Approval System',
		summary: 'A machine learning workflow for credit decisions with explainability layers so predictions can be interpreted, audited, and improved.',
		vision: 'Create a practical credit-risk model that is not a black box and can provide both performance and transparency for decision support.',
		flow: [
			'Collect and standardize applicant data',
			'Clean outliers and encode categorical fields',
			'Train and evaluate classification models',
			'Generate explainability and feature-importance views',
			'Serve the final decision support result'
		],
		flowCaption: 'Pipeline from raw applicant records to explainable approval insights.',
		stack: ['Python', 'Pandas', 'Scikit-learn', 'Model explainability', 'Data preprocessing'],
		notes: 'Balanced performance with interpretability so model behavior remains visible to users.',
		githubUrl: 'https://github.com/kshavnair/credit-approval'
	},
	audio: {
		title: 'Cocktail Party Problem - Speech Separation',
		summary: 'A source-separation experiment to isolate voices from a mixed audio stream and recover cleaner individual speech signals.',
		vision: 'Make mixed audio interpretable by separating overlapping speakers and preserving intelligibility.',
		flow: [
			'Load mixed waveform input',
			'Convert to frequency-domain representation',
			'Apply separation logic to identify source components',
			'Reconstruct time-domain outputs',
			'Evaluate quality of separated speech'
		],
		flowCaption: 'Flow from mixed recording to reconstructed single-speaker tracks.',
		stack: ['Python', 'NumPy', 'Librosa', 'Signal processing'],
		notes: 'Focused on preserving speech clarity while reducing bleed between separated sources.',
		githubUrl: 'https://github.com/kshavnair/single-input-audio-separation'
	},
	rng: {
		title: 'Secure Seeded Key Generator',
		summary: 'A deterministic-yet-secure key-generation concept that uses seeded randomness with hashing primitives for reproducible secure outputs.',
		vision: 'Blend reproducibility with cryptographic strength for key material generation in controlled scenarios.',
		flow: [
			'Initialize entropy and seed components',
			'Apply seed mixing and random transformation',
			'Hash and derive final key bytes',
			'Validate output consistency and strength',
			'Export generated key artifacts'
		],
		flowCaption: 'From seed material to derived secure key output.',
		stack: ['Python', 'SHA-256', 'hashlib', 'Randomness analysis'],
		notes: 'The key idea is controlled seed usage with strong hashing to avoid weak deterministic output patterns.',
		githubUrl: 'https://github.com/kshavnair/RNG-Generator'
	},
	telemetry: {
		title: 'Telemetry Anomaly Detection',
		summary: 'A telemetry-monitoring ML workflow to detect unusual system behavior and surface anomalies early for operational response.',
		vision: 'Reduce risk in monitored systems by identifying subtle drift and anomalies before critical failure.',
		flow: [
			'Ingest satellite telemetry channels',
			'Normalize and construct temporal features',
			'Train anomaly detection model',
			'Score incoming sequences in near real time',
			'Flag and visualize anomaly events'
		],
		flowCaption: 'Operational flow for anomaly identification in telemetry streams.',
		stack: ['Python', 'TensorFlow', 'PyTorch', 'Time-series features'],
		notes: 'Designed to detect unusual patterns while minimizing false alerts across noisy telemetry inputs.',
		githubUrl: 'https://github.com/kshavnair/Satellite-telemetry-anomaly'
	},
	resume: {
		title: 'AI Resume Intelligence Web App',
		summary: 'A resume analysis tool that evaluates ATS compatibility, highlights improvement areas, and supports AI-assisted rewrite suggestions.',
		vision: 'Help users move from raw resumes to job-ready documents with transparent scoring and guided improvements.',
		flow: [
			'Upload resume document',
			'Parse structure and extract content',
			'Run ATS and quality scoring modules',
			'Generate AI-assisted rewrite suggestions',
			'Return actionable improvement report'
		],
		flowCaption: 'From uploaded resume to structured scoring and rewrite guidance.',
		stack: ['FastAPI', 'JavaScript', 'ATS scoring', 'LLM rewriter'],
		notes: 'Kept the interface practical: immediate feedback, clear score explanation, and simple iteration loop.',
		githubUrl: 'https://github.com/kshavnair/resume-analyse'
	},
	marine: {
		title: 'Marine Species eDNA Novelty Detection',
		summary: 'A full-stack novelty detection concept for marine eDNA sequences, designed to inspect unknown biological samples and present interpretable outputs.',
		vision: 'Build a workflow that turns raw marine DNA evidence into reasoned, reviewable results instead of opaque labels.',
		flow: [
			'Ingest sample sequence data',
			'Clean and preprocess the input',
			'Encode features for model consumption',
			'Run novelty and anomaly scoring',
			'Return a structured result to the UI'
		],
		flowCaption: 'Flow from biological sequence to explanation-friendly output.',
		stack: ['Python', 'FastAPI', 'React', 'PyTorch', 'Streamlit', 'Data preprocessing'],
		notes: 'Focused on model explainability and demo-ready storytelling so each result can be interpreted in context.',
		githubUrl: 'https://github.com/kshavnair/marine-novelty'
	}
};

const modalTitle = document.getElementById('project-modal-title');
const modalSummary = document.getElementById('project-modal-summary');
const modalVision = document.getElementById('project-modal-vision');
const modalFlow = document.getElementById('project-modal-flow');
const modalFlowCaption = document.getElementById('project-modal-flow-caption');
const modalStack = document.getElementById('project-modal-stack');
const modalNotes = document.getElementById('project-modal-notes');
const modalLink = document.getElementById('project-modal-link');

const renderProject = (projectKey) => {
	const project = projectDetails[projectKey];
	if (!project || !modalTitle || !modalSummary || !modalVision || !modalFlow || !modalFlowCaption || !modalStack || !modalNotes || !modalLink) {
		return false;
	}

	modalTitle.textContent = project.title;
	modalSummary.textContent = project.summary;
	modalVision.textContent = project.vision;
	modalFlowCaption.textContent = project.flowCaption;
	modalNotes.textContent = project.notes;
	modalLink.href = project.githubUrl;

	modalFlow.innerHTML = '';
	project.flow.forEach((step) => {
		const li = document.createElement('li');
		li.textContent = step;
		modalFlow.appendChild(li);
	});

	modalStack.innerHTML = '';
	project.stack.forEach((item) => {
		const pill = document.createElement('span');
		pill.textContent = item;
		modalStack.appendChild(pill);
	});

	return true;
};

const openModal = () => {
	if (!modal) {
		return;
	}

	modal.hidden = false;
	requestAnimationFrame(() => {
		modal.classList.add('is-open');
		document.body.classList.add('modal-open');
	});
};

const closeModal = () => {
	if (!modal) {
		return;
	}

	modal.classList.remove('is-open');
	document.body.classList.remove('modal-open');
	window.setTimeout(() => {
		if (!modal.classList.contains('is-open')) {
			modal.hidden = true;
		}
	}, 220);
};

if (projectCards.length > 0 && modal) {
	projectCards.forEach((card) => {
		card.addEventListener('click', () => {
			const key = card.dataset.project;
			if (key && renderProject(key)) {
				openModal();
			}
		});

		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				const key = card.dataset.project;
				if (key && renderProject(key)) {
					openModal();
				}
			}
		});
	});

	closeButtons.forEach((button) => {
		button.addEventListener('click', closeModal);
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !modal.hidden) {
			closeModal();
		}
	});
}
