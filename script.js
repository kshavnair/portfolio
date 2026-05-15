document.querySelector('.year').textContent = new Date().getFullYear();

// Initialize TextType for landing subtitle
const landingTextTypeElement = document.getElementById('landing-text-type');
if (landingTextTypeElement && typeof TextType !== 'undefined') {
	window.landingTextType = new TextType(landingTextTypeElement, {
		texts: ['Building stuff', 'Shipping things', 'Debugging Reality'],
		typingSpeed: 80,
		deletingSpeed: 40,
		pauseDuration: 2000,
		loop: true,
		showCursor: true,
		cursorCharacter: '|'
	});
}
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

// Particle splash effect disabled for simplicity
// if (splashCanvas && splashContext && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
// 	resizeSplashCanvas();
// 	window.addEventListener('resize', resizeSplashCanvas, { passive: true });
// 	document.addEventListener('pointerdown', (event) => {
// 		if (event.isPrimary === false) {
// 			return;
// 		}
// 		createSplashBurst(event.clientX, event.clientY);
// 	}, { passive: true, capture: true });
// }



const getCardRevealTargets = (card) => {
	return Array.from(card.querySelectorAll('h3, .exp-tech, .exp-action, .exp-badge, .exp-card-preview *')).filter((element) => {
		return element.textContent && element.textContent.trim().length > 0;
	});
};


const animateProjectCard = (card) => {
	if (!card) {
		return 0;
	}

	// Project card animation without text decryption
	return 0;
};

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
		impact: 'Achieved 89% model accuracy with SHAP-based explainability for every decision',
		vision: 'Create a practical credit-risk model that is not a black box and can provide both performance and transparency for decision support.',
		flow: [
			'Collect and standardize applicant data',
			'Clean outliers and encode categorical fields',
			'Train and evaluate classification models',
			'Generate explainability and feature-importance views',
			'Serve the final decision support result'
		],
		flowCaption: 'Pipeline from raw applicant records to explainable approval insights.',
		stack: ['Python', 'Pandas', 'Scikit-learn', 'SHAP', 'Model explainability'],
		notes: 'Balanced performance with interpretability so model behavior remains visible to users.',
		githubUrl: 'https://github.com/kshavnair/credit-approval',
		screenshots: [
			{ src: 'assets/credit-feature-importance.png', caption: 'Feature importance showing top predictive variables (age, employment, income)' },
			{ src: 'assets/credit-roc-curves.png', caption: 'ROC curves for all models - Random Forest achieved 0.795 AUC' }
		]
	},
	audio: {
		title: 'Cocktail Party Problem - Speech Separation',
		summary: 'A source-separation experiment to isolate voices from a mixed audio stream and recover cleaner individual speech signals.',
		impact: 'Demonstrated waveform-level separation with 92% intelligibility preservation',
		vision: 'Make mixed audio interpretable by separating overlapping speakers and preserving intelligibility.',
		flow: [
			'Load mixed waveform input',
			'Convert to frequency-domain representation',
			'Apply separation logic to identify source components',
			'Reconstruct time-domain outputs',
			'Evaluate quality of separated speech'
		],
		flowCaption: 'Flow from mixed recording to reconstructed single-speaker tracks.',
		stack: ['Python', 'NumPy', 'Librosa', 'Signal processing', 'Matplotlib'],
		notes: 'Focused on preserving speech clarity while reducing bleed between separated sources.',
		githubUrl: 'https://github.com/kshavnair/single-input-audio-separation',
		screenshots: []
	},
	rng: {
		title: 'Secure Seeded Key Generator',
		summary: 'A deterministic-yet-secure key-generation concept that uses seeded randomness with hashing primitives for reproducible secure outputs. Developed during IIT Roorkee summer training.',
		impact: 'Created reproducible key derivation while maintaining cryptographic strength (SHA-256)',
		vision: 'Blend reproducibility with cryptographic strength for key material generation in controlled scenarios.',
		flow: [
			'Initialize entropy and seed components',
			'Apply seed mixing and random transformation',
			'Hash and derive final key bytes',
			'Validate output consistency and strength',
			'Export generated key artifacts'
		],
		flowCaption: 'From seed material to derived secure key output.',
		stack: ['Python', 'SHA-256', 'hashlib', 'Randomness analysis', 'Cryptography'],
		notes: 'The key idea is controlled seed usage with strong hashing to avoid weak deterministic output patterns.',
		githubUrl: 'https://github.com/kshavnair/RNG-Generator',
		screenshots: []
	},
	telemetry: {
		title: 'Telemetry Anomaly Detection',
		summary: 'A telemetry-monitoring ML workflow to detect unusual system behavior and surface anomalies early for operational response.',
		impact: 'Built models detecting anomalies with < 5% false positive rate on satellite data',
		vision: 'Reduce risk in monitored systems by identifying subtle drift and anomalies before critical failure.',
		flow: [
			'Ingest satellite telemetry channels',
			'Normalize and construct temporal features',
			'Train anomaly detection model',
			'Score incoming sequences in near real time',
			'Flag and visualize anomaly events'
		],
		flowCaption: 'Operational flow for anomaly identification in telemetry streams.',
		stack: ['Python', 'TensorFlow', 'PyTorch', 'Pandas', 'Time-series features'],
		notes: 'Designed to detect unusual patterns while minimizing false alerts across noisy telemetry inputs.',
		githubUrl: 'https://github.com/kshavnair/Satellite-telemetry-anomaly',
		screenshots: [
			{ src: 'assets/telemetry-anomaly-chart.png', caption: 'Anomaly detection visualization - 500 anomalies detected in satellite telemetry' }
		]
	},
	resume: {
		title: 'AI Resume Intelligence Web App',
		summary: 'A resume analysis tool that evaluates ATS compatibility, highlights improvement areas, and supports AI-assisted rewrite suggestions.',
		impact: 'Scored 500+ resumes with 94% ATS accuracy; integrated LLM-powered suggestions for guided rewrites',
		vision: 'Help users move from raw resumes to job-ready documents with transparent scoring and guided improvements.',
		flow: [
			'Upload resume document',
			'Parse structure and extract content',
			'Run ATS and quality scoring modules',
			'Generate AI-assisted rewrite suggestions',
			'Return actionable improvement report'
		],
		flowCaption: 'From uploaded resume to structured scoring and rewrite guidance.',
		stack: ['FastAPI', 'JavaScript', 'ATS scoring', 'LLM rewriter', 'React'],
		notes: 'Kept the interface practical: immediate feedback, clear score explanation, and simple iteration loop.',
		githubUrl: 'https://github.com/kshavnair/resume-analyse',
		screenshots: [
			{ src: 'assets/resume-app-dashboard.png', caption: 'Resume Intelligence App - Upload interface with ATS scoring, target role selection, and AI generation options' }
		]
	},
	marine: {
		title: 'Marine Species eDNA Novelty Detection',
		summary: 'A full-stack novelty detection concept for marine eDNA sequences, designed to inspect unknown biological samples and present interpretable outputs.',
		impact: 'Deployed CNN-based classifier achieving 96% accuracy on known species; integrated novelty scoring for unknown sequences',
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
		githubUrl: 'https://github.com/kshavnair/marine-novelty',
		screenshots: [
			{ src: 'assets/marine-species-dashboard.png', caption: 'Marine Species Discovery Platform - Interactive landing with Global Map, Advanced Search, and AI Species ID capabilities' }
		]
	},
	crm: {
		title: 'Enterprise CRM Platform',
		summary: 'A production-style CRM for internal teams with role-based access, protected dashboards, and operational modules for sales and service workflows.',
		impact: 'Deployed to Vercel with authenticated role-based access for admin, sales, and service teams',
		vision: 'Unify lead tracking, customer lifecycle, machine management, and service operations into one fast internal system.',
		flow: [
			'Sign in through Supabase Auth',
			'Route users by role (admin, sales, service)',
			'Manage leads, accounts, machines, tickets, and parts',
			'Search client history and operational records',
			'Execute day-to-day CRM workflows from a single dashboard'
		],
		flowCaption: 'End-to-end path from secure login to role-scoped CRM operations.',
		stack: ['Next.js 16', 'TypeScript', 'Supabase Auth', 'PostgreSQL', 'Role-based access control'],
		notes: 'Live site: https://crm-kshavnair.vercel.app | Login: 1234@ex.com | Password: 12345678',
		liveUrl: 'https://crm-kshavnair.vercel.app/login',
		authTitle: 'Important Login Credentials',
		authDetails: 'Email: 1234@ex.com | Password: 12345678 | Auth: Supabase role-based access (admin, sales, service)',
		githubUrl: 'https://github.com/kshavnair/CRM-for-company-management',
		screenshots: []
	}
};

const modalTitle = document.getElementById('project-modal-title');
const modalSummary = document.getElementById('project-modal-summary');
const modalImpact = document.getElementById('project-modal-impact');
const modalVision = document.getElementById('project-modal-vision');
const modalFlow = document.getElementById('project-modal-flow');
const modalFlowCaption = document.getElementById('project-modal-flow-caption');
const modalStack = document.getElementById('project-modal-stack');
const modalNotes = document.getElementById('project-modal-notes');
const modalLiveLink = document.getElementById('project-modal-live-link');
const modalLink = document.getElementById('project-modal-link');
const modalAuthCallout = document.getElementById('project-auth-callout');
const modalAuthTitle = document.getElementById('project-auth-title');
const modalAuthDetails = document.getElementById('project-auth-details');
const modalScreenshotsSection = document.getElementById('project-screenshots-section');
const modalScreenshots = document.getElementById('project-screenshots');

const renderProject = (projectKey) => {
	const project = projectDetails[projectKey];
	if (!project || !modalTitle || !modalSummary || !modalVision || !modalFlow || !modalFlowCaption || !modalStack || !modalNotes || !modalLink) {
		return false;
	}

	modalTitle.textContent = project.title;
	modalSummary.textContent = project.summary;
	if (modalImpact) {
		modalImpact.textContent = project.impact;
	}
	modalVision.textContent = project.vision;
	modalFlowCaption.textContent = project.flowCaption;
	modalNotes.textContent = project.notes;
	modalLink.href = project.githubUrl;

	if (modalLiveLink) {
		if (project.liveUrl) {
			modalLiveLink.href = project.liveUrl;
			modalLiveLink.style.display = 'inline-flex';
		} else {
			modalLiveLink.style.display = 'none';
		}
	}

	if (modalAuthCallout && modalAuthTitle && modalAuthDetails) {
		if (project.authDetails) {
			modalAuthTitle.textContent = project.authTitle || 'Login Access';
			modalAuthDetails.textContent = project.authDetails;
			modalAuthCallout.style.display = 'block';
		} else {
			modalAuthCallout.style.display = 'none';
		}
	}

	modalFlow.innerHTML = '';
	project.flow.forEach((step, index) => {
		const li = document.createElement('li');
		const stepNumber = document.createElement('span');
		const stepText = document.createElement('span');
		stepNumber.className = 'project-flow-step';
		stepNumber.textContent = String(index + 1);
		stepText.className = 'project-flow-text';
		stepText.textContent = step;
		li.append(stepNumber, stepText);
		modalFlow.appendChild(li);
	});

	modalStack.innerHTML = '';
	project.stack.forEach((item) => {
		const pill = document.createElement('span');
		pill.textContent = item;
		modalStack.appendChild(pill);
	});

	// Render screenshots
	if (modalScreenshots && modalScreenshotsSection) {
		if (project.screenshots && project.screenshots.length > 0) {
			modalScreenshots.innerHTML = '';
			project.screenshots.forEach((screenshot) => {
				const img = document.createElement('img');
				img.src = screenshot.src;
				img.alt = screenshot.caption;
				img.className = 'project-screenshot';
				const figure = document.createElement('figure');
				figure.className = 'project-screenshot-figure';
				figure.appendChild(img);
				const caption = document.createElement('figcaption');
				caption.textContent = screenshot.caption;
				figure.appendChild(caption);
				modalScreenshots.appendChild(figure);
			});
			modalScreenshotsSection.style.display = 'block';
		} else {
			modalScreenshotsSection.style.display = 'none';
		}
	}

	return true;
};

const openModal = () => {
	if (!modal) {
		return;
	}

 window.dispatchEvent(new Event('cursor:reset'));
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
	}, 250);
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

// TargetCursor re-enabled with improved performance settings
if (window.gsap && typeof createTargetCursor === 'function') {
	createTargetCursor({
		targetSelector: '.cursor-target',
		spinDuration: 2,
		hideDefaultCursor: true,
		hoverDuration: 0.2,
		parallaxOn: false
	});
}

// Dock-style navbar magnification
const dockPanel = document.getElementById('dock-panel');
const dockItems = dockPanel ? Array.from(dockPanel.querySelectorAll('[data-dock-item]')) : [];
const dockMaxDistance = 180;
const dockMaxScale = 1;

if (dockPanel && dockItems.length > 0 && window.matchMedia('(hover: hover)').matches) {
	const resetDockItems = () => {
		dockItems.forEach((item) => {
			item.style.setProperty('--dock-scale', '1');
			item.style.setProperty('--dock-translate', '0px');
			item.classList.remove('is-active');
		});
	};

	const updateDockItems = (clientX) => {
		const panelRect = dockPanel.getBoundingClientRect();
		dockItems.forEach((item) => {
			const rect = item.getBoundingClientRect();
			const itemCenter = rect.left + rect.width / 2;
			const distance = Math.abs(clientX - itemCenter);
			const proximity = Math.max(0, dockMaxDistance - distance);
			const progress = proximity / dockMaxDistance;
			const scale = 1 + progress * (dockMaxScale - 1);
			const lift = 0;
			item.style.setProperty('--dock-scale', scale.toFixed(3));
			item.style.setProperty('--dock-translate', `${lift.toFixed(1)}px`);
			item.classList.toggle('is-active', distance < rect.width / 1.25);
		});
		dockPanel.style.setProperty('--dock-pointer-x', `${clientX - panelRect.left}px`);
	};

	dockPanel.addEventListener('mousemove', (event) => {
		updateDockItems(event.clientX);
	});

	dockPanel.addEventListener('mouseleave', resetDockItems);
	dockItems.forEach((item) => {
		item.addEventListener('focus', () => {
			item.style.setProperty('--dock-scale', '1');
			item.style.setProperty('--dock-translate', '0px');
			item.classList.add('is-active');
		});
		item.addEventListener('blur', () => {
			resetDockItems();
		});
	});
}

// Responsive nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
	navToggle.addEventListener('click', () => {
		const isOpen = navLinks.classList.toggle('is-open');
		navToggle.setAttribute('aria-expanded', String(isOpen));
	});

	// Close when a link is clicked
	navLinks.querySelectorAll('a, button').forEach((el) => {
		el.addEventListener('click', () => {
			navLinks.classList.remove('is-open');
			navToggle.setAttribute('aria-expanded', 'false');
		});
	});
}

// Resume view/download (no upload)
// Use the CV copied into the site's assets folder for reliable deployment.
const RESUME_PATH = 'assets/CV.pdf';
const resumeButton = document.getElementById('resume-button');
const resumeModal = document.getElementById('resume-modal');
const resumeViewLink = document.getElementById('resume-view-link');
const resumeDownloadLink = document.getElementById('resume-download-link');

const openResumeModal = () => {
	if (!resumeModal) return;
	window.dispatchEvent(new Event('cursor:reset'));
	// set links to the resume asset; user can replace the file in assets/
	if (resumeViewLink) resumeViewLink.href = RESUME_PATH;
	if (resumeDownloadLink) {
		resumeDownloadLink.href = RESUME_PATH;
		resumeDownloadLink.setAttribute('download', 'Keshav_Nair_CV.pdf');
	}
	resumeModal.hidden = false;
	requestAnimationFrame(() => {
		resumeModal.classList.add('is-open');
		document.body.classList.add('modal-open');
	});
};

const closeResumeModal = () => {
	if (!resumeModal) return;
	resumeModal.classList.remove('is-open');
	document.body.classList.remove('modal-open');
	window.setTimeout(() => {
		if (!resumeModal.classList.contains('is-open')) {
			resumeModal.hidden = true;
		}
	}, 220);
};

if (resumeButton && resumeModal) {
	resumeButton.addEventListener('click', () => {
		openResumeModal();
	});

	// Close handlers
	const resumeCloseButtons = resumeModal ? resumeModal.querySelectorAll('[data-close-resume]') : [];
	resumeCloseButtons.forEach((b) => b.addEventListener('click', closeResumeModal));

	// close on Escape
	document.addEventListener('keydown', (ev) => {
		if (ev.key === 'Escape' && resumeModal && !resumeModal.hidden) {
			closeResumeModal();
		}
	});

	// close when backdrop clicked
	if (resumeModal) {
		const resumeBackdrop = resumeModal.querySelector('.project-modal-backdrop');
		resumeBackdrop?.addEventListener('click', closeResumeModal);
	}
}

// Landing page scroll indicator animation
const landingScrollIndicator = document.querySelector('.landing-scroll-indicator');
const landingExploreButton = document.querySelector('.landing-cta');

const runExploreReveal = () => {
	const aboutSection = document.getElementById('about');
	if (!aboutSection) return;

	if (typeof gsap === 'undefined') {
		aboutSection.scrollIntoView({ behavior: 'smooth' });
		return;
	}

	const revealTargets = Array.from(document.querySelectorAll('main .section'));
	if (revealTargets.length === 0) {
		aboutSection.scrollIntoView({ behavior: 'smooth' });
		return;
	}

	gsap.killTweensOf(revealTargets);
	gsap.set(revealTargets, { autoAlpha: 0, y: 28 });
	aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
	window.setTimeout(() => {
		gsap.to(revealTargets, {
			autoAlpha: 1,
			y: 0,
			duration: 0.75,
			stagger: 0.1,
			ease: 'power3.out'
		});
	}, 280);
};

if (landingExploreButton) {
	landingExploreButton.addEventListener('click', (event) => {
		event.preventDefault();
		runExploreReveal();
	});
}

if (landingScrollIndicator) {
	const handleLandingScroll = () => {
		const scrolled = window.scrollY;
		if (scrolled > window.innerHeight * 0.5) {
			landingScrollIndicator.style.opacity = '0';
			landingScrollIndicator.style.pointerEvents = 'none';
		} else {
			landingScrollIndicator.style.opacity = '1';
			landingScrollIndicator.style.pointerEvents = 'auto';
		}
	};
	
	window.addEventListener('scroll', handleLandingScroll);
	
	// Add smooth scroll behavior to the scroll indicator
	landingScrollIndicator.style.cursor = 'pointer';
	landingScrollIndicator.addEventListener('click', (event) => {
		event.preventDefault();
		runExploreReveal();
	});
}
