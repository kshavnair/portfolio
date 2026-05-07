document.querySelector('.year').textContent = new Date().getFullYear();

const splashCanvas = document.getElementById('splash-canvas');
const splashContext = splashCanvas ? splashCanvas.getContext('2d') : null;
const splashParticles = [];
let splashFrame = null;
let splashWidth = 0;
let splashHeight = 0;

const splashPalette = {
	dark: ['#ff4d6d', '#7c5cff', '#00d4ff', '#ffd166', '#4ef0a8'],
	light: ['#d94f70', '#7f61ff', '#1886ff', '#c98b2f', '#2f9e7e']
};

const getThemeMode = () => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';

const resizeSplashCanvas = () => {
	if (!splashCanvas || !splashContext) {
		return;
	}

	const devicePixelRatio = window.devicePixelRatio || 1;
	splashWidth = window.innerWidth;
	splashHeight = window.innerHeight;
	splashCanvas.width = Math.round(splashWidth * devicePixelRatio);
	splashCanvas.height = Math.round(splashHeight * devicePixelRatio);
	splashCanvas.style.width = `${splashWidth}px`;
	splashCanvas.style.height = `${splashHeight}px`;
	splashContext.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
};

const createSplashBurst = (x, y) => {
	if (!splashCanvas || !splashContext) {
		return;
	}

	const palette = splashPalette[getThemeMode()] ?? splashPalette.dark;
	const particleCount = 28 + Math.floor(Math.random() * 14);
	const centerColor = palette[Math.floor(Math.random() * palette.length)];
	splashParticles.push({
		x,
		y,
		vx: 0,
		vy: 0,
		radius: 150 + Math.random() * 70,
		baseRadius: 150,
		color: centerColor,
		life: 0,
		maxLife: 28,
		rotation: 0,
		spin: 0,
		core: true
	});
	for (let index = 0; index < particleCount; index += 1) {
		const angle = Math.random() * Math.PI * 2;
		const speed = 0.8 + Math.random() * 4.4;
		const radius = 36 + Math.random() * 96;
		splashParticles.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			radius,
			baseRadius: radius,
			color: palette[Math.floor(Math.random() * palette.length)],
			life: 0,
			maxLife: 40 + Math.floor(Math.random() * 20),
			rotation: Math.random() * Math.PI * 2,
			spin: (Math.random() - 0.5) * 0.12
		});
	}

	if (splashFrame === null) {
		renderSplashFrame();
	}
};

const renderSplashFrame = () => {
	if (!splashCanvas || !splashContext) {
		return;
	}

	splashFrame = window.requestAnimationFrame(renderSplashFrame);
	splashContext.clearRect(0, 0, splashWidth, splashHeight);
	splashContext.globalCompositeOperation = 'lighter';

	for (let index = splashParticles.length - 1; index >= 0; index -= 1) {
		const particle = splashParticles[index];
		particle.life += 1;
		particle.x += particle.vx;
		particle.y += particle.vy;
		particle.vx *= 0.955;
		particle.vy *= 0.955;
		particle.radius *= particle.core ? 0.965 : 0.972;
		particle.rotation += particle.spin;

		const progress = particle.life / particle.maxLife;
		const alpha = Math.max(1 - progress, 0) * (particle.core ? 0.98 : 0.92);
		const glowRadius = Math.max(particle.radius, particle.core ? 24 : 10);

		if (alpha <= 0 || particle.radius <= 0.7) {
			splashParticles.splice(index, 1);
			continue;
		}

		const gradient = splashContext.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowRadius);
		gradient.addColorStop(0, `${particle.color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
		gradient.addColorStop(0.35, `${particle.color}${Math.round(alpha * 220).toString(16).padStart(2, '0')}`);
		gradient.addColorStop(0.7, `${particle.color}${Math.round(alpha * 120).toString(16).padStart(2, '0')}`);
		gradient.addColorStop(1, 'transparent');

		splashContext.save();
		splashContext.translate(particle.x, particle.y);
		splashContext.rotate(particle.rotation);
		splashContext.fillStyle = gradient;
		splashContext.shadowColor = particle.color;
		splashContext.shadowBlur = particle.core ? 56 : 26;
		splashContext.beginPath();
		splashContext.arc(0, 0, glowRadius, 0, Math.PI * 2);
		splashContext.fill();
		if (!particle.core) {
			splashContext.globalAlpha = Math.max(alpha * 0.7, 0.15);
			splashContext.beginPath();
			splashContext.arc(0, 0, Math.max(glowRadius * 0.32, 8), 0, Math.PI * 2);
			splashContext.fill();
		}
		splashContext.restore();
	}

	if (splashParticles.length === 0) {
		window.cancelAnimationFrame(splashFrame);
		splashFrame = null;
		splashContext.globalCompositeOperation = 'source-over';
		return;
	}

	splashContext.globalCompositeOperation = 'source-over';
};

if (splashCanvas && splashContext && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
	resizeSplashCanvas();
	window.addEventListener('resize', resizeSplashCanvas, { passive: true });
	document.addEventListener('pointerdown', (event) => {
		if (event.isPrimary === false) {
			return;
		}
		createSplashBurst(event.clientX, event.clientY);
	}, { passive: true, capture: true });
}

const decryptCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-=/';
const decryptDuration = 1200;
const activeDecryptions = new WeakMap();

const decryptText = (element, duration = decryptDuration) => {
	if (!element || !element.textContent) {
		return;
	}

	const originalText = element.dataset.originalText ?? element.textContent;
	element.dataset.originalText = originalText;
	element.classList.add('decrypt-target', 'decrypting', 'decrypt-shimmer');

	const characters = originalText.split('');
	const startTime = performance.now();
	let frameId = activeDecryptions.get(element);
	if (frameId) {
		cancelAnimationFrame(frameId);
	}

	const tick = (now) => {
		const progress = Math.min((now - startTime) / duration, 1);
		const revealCount = Math.floor(progress * characters.length);
		const nextText = characters
			.map((character, index) => {
				if (character === ' ') {
					return ' ';
				}
				if (index < revealCount) {
					return character;
				}
				return decryptCharacters[Math.floor(Math.random() * decryptCharacters.length)];
			})
			.join('');

		element.textContent = nextText;

		if (progress < 1) {
			activeDecryptions.set(element, requestAnimationFrame(tick));
			return;
		}

		element.textContent = originalText;
		element.classList.remove('decrypting');
		element.classList.add('decrypted');
		activeDecryptions.delete(element);
	};

	activeDecryptions.set(element, requestAnimationFrame(tick));
};

const getCardRevealTargets = (card) => {
	return Array.from(card.querySelectorAll('h3, .exp-tech, .exp-action, .exp-badge, .exp-card-preview *')).filter((element) => {
		return element.textContent && element.textContent.trim().length > 0;
	});
};


const animateProjectCard = (card) => {
	if (!card) {
		return 0;
	}

	card.classList.add('card-reveal', 'card-reveal-active');
	const revealTargets = getCardRevealTargets(card);
	revealTargets.forEach((target) => {
		decryptText(target, 900);
	});

	window.setTimeout(() => {
		card.classList.remove('card-reveal-active');
	}, 900);

	return 280;
};

const buildDecryptTargets = () => {
	return document.querySelectorAll([
		'.section h2',
		'.about-text',
		'.experience-item h3',
		'.experience-item .meta',
		'.experience-item p',
		'.cert-list li',
		'.footer p:last-child',
		'.project-modal h3',
		'.project-summary',
		'.project-detail-card h4',
		'.project-detail-card p',
		'.project-flow li',
		'.project-flow figcaption',
		'.project-stack span',
		'.project-kicker'
	].join(', '));
};

const setupDecryptReveal = () => {
	const targets = Array.from(buildDecryptTargets());
	if (targets.length === 0) {
		return;
	}

	const observer = new IntersectionObserver((entries, observe) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			decryptText(entry.target);
			observe.unobserve(entry.target);
		});
	}, {
		threshold: 0.35,
		rootMargin: '0px 0px -10% 0px'
	});

	targets.forEach((target) => {
		observer.observe(target);
	});
};

setupDecryptReveal();

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

	// Update glare effect colors for all project cards
	const cards = document.querySelectorAll('[data-project]');
	cards.forEach((card) => {
		const glareColor = resolvedTheme === 'light' ? '#9c6a24' : '#c9a962';
		const hex = glareColor.replace('#', '');
		let rgba = glareColor;
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		rgba = `rgba(${r}, ${g}, ${b}, 0.25)`;
		card.style.setProperty('--gh-rgba', rgba);
	});
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

const initGlareHover = (element, options = {}) => {
	if (!element) return;

	const {
		width = '100%',
		height = '100%',
		background = 'transparent',
		borderRadius = 'inherit',
		borderColor = 'transparent',
		glareColor = '#ffffff',
		glareOpacity = 0.3,
		glareAngle = -45,
		glareSize = 250,
		transitionDuration = 650,
		playOnce = false
	} = options;

	const hex = glareColor.replace('#', '');
	let rgba = glareColor;
	
	if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
	} else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
		const r = parseInt(hex[0] + hex[0], 16);
		const g = parseInt(hex[1] + hex[1], 16);
		const b = parseInt(hex[2] + hex[2], 16);
		rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
	}

	element.classList.add('glare-hover');
	if (playOnce) {
		element.classList.add('glare-hover--play-once');
	}

	element.style.setProperty('--gh-width', width);
	element.style.setProperty('--gh-height', height);
	element.style.setProperty('--gh-bg', background);
	element.style.setProperty('--gh-br', borderRadius);
	element.style.setProperty('--gh-angle', `${glareAngle}deg`);
	element.style.setProperty('--gh-duration', `${transitionDuration}ms`);
	element.style.setProperty('--gh-size', `${glareSize}%`);
	element.style.setProperty('--gh-rgba', rgba);
	element.style.setProperty('--gh-border', borderColor);
};

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

	window.setTimeout(() => {
		buildDecryptTargets().forEach((target) => {
			if (modal && modal.contains(target)) {
				delete target.dataset.originalText;
				target.classList.remove('decrypted', 'decrypting');
				decryptText(target, 620);
			}
		});
	}, 40);

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
				const openDelay = animateProjectCard(card);
				window.setTimeout(() => {
					openModal();
				}, openDelay);
			}
		});

		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				const key = card.dataset.project;
				if (key && renderProject(key)) {
					const openDelay = animateProjectCard(card);
					window.setTimeout(() => {
						openModal();
					}, openDelay);
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

	// Apply glare hover effect to project cards
	projectCards.forEach((card) => {
		const themeMode = getThemeMode();
		initGlareHover(card, {
			width: '100%',
			height: '100%',
			background: 'transparent',
			borderRadius: 'inherit',
			glareColor: themeMode === 'light' ? '#9c6a24' : '#c9a962',
			glareOpacity: 0.25,
			glareAngle: -45,
			glareSize: 280,
			transitionDuration: 800
		});
	});
}

// Initialize TargetCursor
if (window.gsap && typeof createTargetCursor === 'function') {
	createTargetCursor({
		targetSelector: '.cursor-target',
		spinDuration: 2,
		hideDefaultCursor: true,
		hoverDuration: 0.2,
		parallaxOn: true
	});
}
