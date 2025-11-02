class Terminal {
  constructor() {
    this.input = document.getElementById("terminal-input");
    this.interactiveTerminal = document.getElementById("interactive-terminal");
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentDirectory = "~";
    this.startTime = Date.now();
    this.suggestions = [];
    this.currentSuggestionIndex = -1;

    this.commands = {
      help: this.showHelp.bind(this),
      about: this.showAbout.bind(this),
      skills: this.showSkills.bind(this),
      experience: this.showExperience.bind(this),
      blogs: this.showBlogs.bind(this),
      contact: this.showContact.bind(this),
      resume: this.showResume.bind(this),
      clear: this.clearTerminal.bind(this),
      exit: this.exitTerminal.bind(this),
      ls: this.listDirectory.bind(this),
      whoami: this.whoAmI.bind(this),
      date: this.showDate.bind(this),
      pwd: this.showPwd.bind(this),
      history: this.showHistory.bind(this),
      uptime: this.showUptime.bind(this),
    };

    // Command descriptions for better auto-suggestions
    this.commandDescriptions = {
      help: "Display available commands",
      about:
        "Show information about Ashis (DevOps & AI Infrastructure Engineer)",
      skills: "List technical skills including AI/ML and cloud expertise",
      experience: "Show 4+ years of work experience in DevOps and AI",
      blogs: "View recent technical blog posts",
      contact: "Get contact information and social profiles",
      resume: "Download latest resume (PDF)",
      clear: "Clear terminal screen",
      exit: "Close terminal",
      ls: "List directory contents",
      whoami: "Display current user",
      date: "Show current date and time",
      pwd: "Print working directory",
      history: "Show command history",
      uptime: "Show system uptime",
    };

    this.init();
  }

  init() {
    this.input.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.input.addEventListener("input", this.handleInput.bind(this));

    // Create suggestions container
    this.createSuggestionsContainer();

    // Mobile-friendly focus handling
    if (!this.isMobile()) {
      this.input.focus();
    }

    // Focus input when clicking anywhere in terminal, but not on form inputs
    document.addEventListener("click", (event) => {
      // Don't focus terminal input if clicking on form elements
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.tagName === "BUTTON" ||
        event.target.closest(".email-input") ||
        event.target.closest(".download-button") ||
        event.target.closest(".suggestions-container")
      ) {
        return;
      }

      // Hide suggestions when clicking elsewhere
      this.hideSuggestions();

      // Only auto-focus on non-mobile devices
      if (!this.isMobile()) {
        this.input.focus();
      }
    });

    // Handle mobile viewport changes
    this.handleViewportChanges();

    // Load blogs data
    this.loadBlogs();

    // Add accessibility improvements
    this.setupAccessibility();
  }

  isMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  handleViewportChanges() {
    // Handle orientation changes on mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    });

    // Handle resize events
    window.addEventListener("resize", () => {
      this.scrollToBottom();
    });
  }

  setupAccessibility() {
    // Add ARIA labels and roles
    this.input.setAttribute("aria-label", "Terminal command input");
    this.input.setAttribute("role", "textbox");
    this.interactiveTerminal.setAttribute("role", "log");
    this.interactiveTerminal.setAttribute("aria-live", "polite");

    // Add skip link for screen readers
    const skipLink = document.createElement("a");
    skipLink.href = "#terminal-input";
    skipLink.textContent = "Skip to terminal input";
    skipLink.className = "skip-link";
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #00ff00;
      color: #000;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
    `;
    skipLink.addEventListener("focus", () => {
      skipLink.style.top = "6px";
    });
    skipLink.addEventListener("blur", () => {
      skipLink.style.top = "-40px";
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "Enter":
        this.hideSuggestions();
        this.executeCommand();
        break;
      case "ArrowUp":
        event.preventDefault();
        if (this.suggestions.length > 0) {
          this.navigateSuggestions(-1);
        } else {
          this.navigateHistory(-1);
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (this.suggestions.length > 0) {
          this.navigateSuggestions(1);
        } else {
          this.navigateHistory(1);
        }
        break;
      case "Tab":
        event.preventDefault();
        this.autoComplete();
        break;
      case "Escape":
        this.hideSuggestions();
        break;
    }
  }

  handleInput(event) {
    const input = event.target.value.toLowerCase().trim();
    if (input.length > 0) {
      this.showSuggestions(input);
    } else {
      this.hideSuggestions();
    }
  }

  executeCommand() {
    const command = this.input.value.trim();

    // Handle empty command (just Enter pressed)
    if (command === "") {
      return;
    }

    // Add to history
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;

    // Display command
    this.addOutput(
      `<span class="prompt">ashis@ashissharma.com:${this.currentDirectory}$ </span><span class="command">${command}</span>`
    );

    // Parse and execute command
    const [cmd, ...args] = command.toLowerCase().split(" ");

    if (this.commands[cmd]) {
      this.commands[cmd](args);
    } else {
      this.addOutput(
        `<span class="error-message">Command not found: ${cmd}. Type 'help' for available commands.</span>`
      );
    }

    // Clear input
    this.input.value = "";

    // Scroll to bottom
    this.scrollToBottom();
  }

  addOutput(content) {
    const outputDiv = document.createElement("div");
    outputDiv.innerHTML = content;
    outputDiv.className = "output-section";
    this.interactiveTerminal.appendChild(outputDiv);
  }

  scrollToBottom() {
    const terminalBody = document.querySelector(".terminal-body");
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    this.historyIndex += direction;

    if (this.historyIndex < 0) {
      this.historyIndex = 0;
    } else if (this.historyIndex >= this.commandHistory.length) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = "";
      return;
    }

    this.input.value = this.commandHistory[this.historyIndex] || "";
  }

  autoComplete() {
    const input = this.input.value.toLowerCase();
    const matches = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(input)
    );

    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.addOutput(
        `<span class="section-content">Available commands: ${matches.join(
          ", "
        )}</span>`
      );
    }
  }

  // Command implementations
  showHelp() {
    const helpText = `
<div class="section-content">
  <strong>about</strong>      - Display information about Ashis<br>
  <strong>skills</strong>     - List technical skills and expertise<br>
  <strong>experience</strong> - Show work experience<br>
  <strong>blogs</strong>      - View recent blog posts<br>
  <strong>contact</strong>    - Get contact information<br>
  <strong>resume</strong>     - Download resume<br>
  <strong>history</strong>    - Show command history<br>
  <strong>uptime</strong>     - Show system uptime<br>

  <strong>clear</strong>      - Clear terminal screen<br>
  <strong>exit</strong>       - Close terminal<br>
  <strong>ls</strong>         - List directory contents<br>
  <strong>whoami</strong>     - Display current user<br>
  <strong>date</strong>       - Show current date and time<br>
  <strong>pwd</strong>        - Print working directory<br><br>
  <span style="color: #888;">Tips:</span><br>
  • Use <strong>Tab</strong> for command completion<br>
  • Use <strong>↑/↓</strong> arrows for command history<br>
  • Press <strong>Escape</strong> to hide suggestions
</div>`;
    this.addOutput(helpText);
  }

  showAbout() {
    const aboutText = `
<div class="section-content">
<pre>NAME:        Ashis Sharma
ROLE:        DevOps and AI Infrastructure Engineer
COMPANY:     Jukshio
LOCATION:    Hyderabad, India
EXPERIENCE:  5+ years
STATUS:      Currently Active

DESCRIPTION:
DevOps & AI Infrastructure Engineer with 5+ years' experience scaling GPU-based LLM training 
clusters (100+ GPUs) and automating multi-cloud MLOps pipelines across GCP and Azure. Proven 
success reducing deployment times by 60% and optimizing GPU utilization through Terraform, 
Helm, and Kubeflow. Passionate about building scalable AI infrastructure that bridges model 
research and production reliability.

EDUCATION:
Bachelor of Science: Information Technology
SRM University Sikkim, Gangtok (2019)

SPECIALTIES:
  • Large-scale GPU-based LLM Training & Deployment
  • High-performance GPU Cluster Management (100+ GPUs)
  • Multi-cloud MLOps Pipeline Development
  • Infrastructure as Code with Terraform & Kubernetes
  • DevSecOps Implementation & Security Automation
  • Monitoring & Observability (Prometheus, Grafana)</pre>
</div>`;
    this.addOutput(aboutText);
  }

  showSkills() {
    const skillsText = `
<div class="section-content">
<pre>TECHNICAL SKILLS:

Cloud & Infrastructure:
[01] Google Cloud Platform (GCP)   [02] Microsoft Azure
[03] Terraform

Containers & Orchestration:
[04] Kubernetes                  [05] Docker
[06] Helm                       [07] Kustomize
[08] K3s                        [09] Slurm

Programming Languages:
[10] Golang                     [11] Python
[12] JavaScript                 [13] Bash Scripting

CI/CD & Automation:
[14] GitLab CI/CD               [15] GitHub Actions
[16] Multi-stage Pipelines

Monitoring & Security:
[17] Prometheus                 [18] Grafana
[19] Loki                       [20] EFK Stack
[21] Trivy                      [22] SonarQube
[23] WAF                        [24] OWASP Rules

AI & HPC:
[25] CUDA Programming           [26] TensorRT
[27] vLLM                       [28] SGLang
[29] Kubeflow
</div>`;
    this.addOutput(skillsText);
  }

  showExperience() {
    const experienceText = `
<div class="section-content">
<pre>[01] DevOps Engineer
     Company:     Jukshio
     Duration:    June 2020 - Present (5+ years)
     Location:    Hyderabad, India

     Key Achievements:
     • Configured and optimized Slurm-based GPU clusters for large-scale LLM fine-tuning (100+ GPUs).
     • Deployed scalable Kubernetes inference services using SGLang and vLLM, improving 
       latency and throughput for customer workloads.
     • Automated infrastructure provisioning with Terraform, Helm, and Kustomize, 
       reducing setup time by 40%.
     • Designed multi-stage CI/CD pipelines (build, test, security scan, deployment) 
       in GitLab CI, cutting release cycles by 60%.
     • Implemented DevSecOps practices with SonarQube, Trivy, and OWASP WAF, 
       enhancing compliance and security posture.
     • Built and automated Kubeflow-based MLOps pipeline supporting 20+ model training 
       jobs across GPU clusters.
     • Managed Prometheus and Grafana observability stack; reduced time-to-detect 
       incidents by 40%.
     • Migrated workloads from Azure to GCP, improving reliability and reducing 
       cloud costs by 25%.
     • Developed SDKs for enterprise clients (Jio, HDFC Bank), streamlining 
       integration workflows.
     • Created internal dashboards in React + Node.js to automate reporting and 
       enhance productivity.

[02] Test Engineer
     Company:     Wipro
     Duration:    August 2019 - March 2020 (8 months)
     Location:    Chennai, India

     Key Responsibilities:
     • Automated regression testing with Selenium WebDriver (Java) and built data 
       validation utilities to accelerate QA cycles.</pre>
</div>`;
    this.addOutput(experienceText);
  }

  async showBlogs() {
    if (this.blogsData && this.blogsData.length > 0) {
      // Show all blogs at once, just like terminal-blogs.html
      const blogsHtml = this.blogsData
        .map((blog, index) => {
          const date = new Date(blog.addedOn).toLocaleDateString();
          return `<div class="section-content">
<pre>[${String(index + 1).padStart(2, "0")}] ${blog.title} (${date})
     URL: <a href="${blog.link}" target="_blank" class="blog-link">${
            blog.link
          }</a></pre>
</div>`;
        })
        .join("");

      this.addOutput(blogsHtml);
    } else {
      // Show loading animation while fetching blogs
      const loading = this.createLoadingAnimation("Fetching blog posts");

      try {
        await this.loadBlogs();
        loading.stop();

        if (this.blogsData && this.blogsData.length > 0) {
          this.showBlogs();
        } else {
          this.addOutput(
            `<div class="error-message">Unable to load blog posts at this time.</div>`
          );
        }
      } catch (error) {
        loading.stop();
        this.addOutput(
          `<div class="error-message">Failed to fetch blog posts. Please try again.</div>`
        );
      }
    }
  }

  showContact() {
    const contactText = `
<div class="section-content">
<pre>CONTACT INFORMATION:
Click on the links below to visit my profiles:

Email:         <a href="mailto:ashissharma@outlook.com" class="social-link">ashissharma@outlook.com</a>
  └─ Click to send me an email directly

LinkedIn:      <a href="https://www.linkedin.com/in/ashissharma/" target="_blank" class="social-link">https://www.linkedin.com/in/ashissharma/</a>
  └─ Click to view professional profile and connect

GitHub:        <a href="https://github.com/ashissharma97" target="_blank" class="social-link">https://github.com/ashissharma97</a>
  └─ Click to explore my code repositories and projects

Medium:        <a href="https://medium.com/@ashisrm" target="_blank" class="social-link">https://medium.com/@ashisrm</a>
  └─ Click to read my technical articles and insights

Location:      Hyderabad, India 500039</pre>
</div>`;
    this.addOutput(contactText);
  }

  showResume() {
    const resumeText = `
<div class="resume-download">
    <div class="section-content">
        To download my resume, please provide your email address:
    </div>
    <input type="email" id="resume-email" class="email-input" placeholder="Enter your email address" required>
    <br>
    <button class="download-button" onclick="terminal.downloadResume()">Download Resume</button>
    <div id="resume-status"></div>
</div>`;
    this.addOutput(resumeText);
  }

  downloadResume() {
    const emailInput = document.getElementById("resume-email");
    const statusDiv = document.getElementById("resume-status");
    const email = emailInput.value.trim();

    // Clear previous status
    statusDiv.innerHTML = "";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      statusDiv.innerHTML =
        '<div class="error-message">Please enter your email address.</div>';
      return;
    }

    if (!emailRegex.test(email)) {
      statusDiv.innerHTML =
        '<div class="error-message">Please enter a valid email address.</div>';
      return;
    }

    // Show progress bar for download
    statusDiv.innerHTML =
      '<div class="section-content" style="color: #ffff00;">Preparing download...</div>';

    const progressBar = this.createProgressBar(100);
    statusDiv.appendChild(progressBar.element || document.createElement("div"));

    // Simulate download progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random progress increments
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        progressBar.complete();

        // Create actual PDF download
        const link = document.createElement("a");
        link.href = "./Ashis_Sharma_Resume.pdf"; // Path to the actual resume PDF
        link.download = "Ashis_Sharma_Resume.pdf";
        link.style.display = "none";

        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Log the email for analytics (in real implementation, you'd send this to your backend)
        console.log("Resume downloaded by:", email);

        setTimeout(() => {
          statusDiv.innerHTML =
            '<div class="success-message">Resume download started! Check your downloads folder.</div>';

          // Clear the email input after successful download
          emailInput.value = "";
        }, 500);
      } else {
        progressBar.update(Math.floor(progress));
      }
    }, 200);
  }

  clearTerminal() {
    this.interactiveTerminal.innerHTML = "";
  }

  exitTerminal() {
    this.addOutput(
      `<div class="section-content">Thanks for visiting! Closing terminal in 5 seconds...</div>`
    );
    setTimeout(() => {
      // Try to close the window
      if (window.close) {
        window.close();
      }

      // Fallback: Try different methods to close
      try {
        window.open("", "_self", "");
        window.close();
      } catch (e) {
        // If all else fails, redirect to a blank page or show message
        this.addOutput(
          `<div class="section-content">Please close this tab manually or press Ctrl+W (Cmd+W on Mac)</div>`
        );
      }
    }, 5000);
  }

  listDirectory() {
    const lsText = `
<div class="section-content">
<span style="color: #00ff00;">about/</span><br>
<span style="color: #00ff00;">skills/</span><br>
<span style="color: #00ff00;">experience/</span><br>
<span style="color: #00ff00;">blogs/</span><br>
<span style="color: #00ff00;">contact/</span><br>
<span style="color: #ffffff;">resume.pdf</span>
</div>`;
    this.addOutput(lsText);
  }

  whoAmI() {
    this.addOutput(`<div class="section-content">ashis</div>`);
  }

  showDate() {
    const now = new Date();
    this.addOutput(`<div class="section-content">${now.toString()}</div>`);
  }

  showPwd() {
    this.addOutput(`<div class="section-content">www.ashissharma.com</div>`);
  }

  // New enhanced methods
  createSuggestionsContainer() {
    const container = document.createElement("div");
    container.className = "suggestions-container";
    container.style.cssText = `
      position: absolute;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;
    this.input.parentNode.appendChild(container);
    this.suggestionsContainer = container;
  }

  showSuggestions(input) {
    const matches = Object.keys(this.commands)
      .filter((cmd) => cmd.startsWith(input))
      .map((cmd) => ({
        command: cmd,
        description: this.commandDescriptions[cmd],
      }));

    if (matches.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestions = matches;
    this.currentSuggestionIndex = -1;

    const html = matches
      .map(
        (match, index) => `
      <div class="suggestion-item" data-index="${index}" style="
        padding: 8px 12px;
        cursor: pointer;
        border-bottom: 1px solid #333;
        color: #00ff00;
        font-family: 'Courier New', monospace;
      ">
        <strong>${match.command}</strong>
        <span style="color: #888; margin-left: 10px;">${match.description}</span>
      </div>
    `
      )
      .join("");

    this.suggestionsContainer.innerHTML = html;
    this.suggestionsContainer.style.display = "block";

    // Position suggestions below input
    const inputRect = this.input.getBoundingClientRect();
    // Calculate position relative to document for proper absolute positioning
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    this.suggestionsContainer.style.top = `${inputRect.top + scrollTop + inputRect.height + 5}px`;
    this.suggestionsContainer.style.left = `${inputRect.left + scrollLeft}px`;
    this.suggestionsContainer.style.width = `${inputRect.width}px`;

    // Add click handlers
    this.suggestionsContainer
      .querySelectorAll(".suggestion-item")
      .forEach((item, index) => {
        item.addEventListener("click", () => {
          this.input.value = matches[index].command;
          this.hideSuggestions();
          this.input.focus();
        });
      });
  }

  hideSuggestions() {
    if (this.suggestionsContainer) {
      this.suggestionsContainer.style.display = "none";
    }
    this.suggestions = [];
    this.currentSuggestionIndex = -1;
  }

  navigateSuggestions(direction) {
    if (this.suggestions.length === 0) return;

    this.currentSuggestionIndex += direction;

    if (this.currentSuggestionIndex < 0) {
      this.currentSuggestionIndex = this.suggestions.length - 1;
    } else if (this.currentSuggestionIndex >= this.suggestions.length) {
      this.currentSuggestionIndex = 0;
    }

    // Update visual selection
    this.suggestionsContainer
      .querySelectorAll(".suggestion-item")
      .forEach((item, index) => {
        if (index === this.currentSuggestionIndex) {
          item.style.backgroundColor = "#333";
          this.input.value = this.suggestions[index].command;
        } else {
          item.style.backgroundColor = "transparent";
        }
      });
  }

  showHistory() {
    if (this.commandHistory.length === 0) {
      this.addOutput(
        `<div class="section-content">No commands in history.</div>`
      );
      return;
    }

    const historyText = this.commandHistory
      .map(
        (cmd, index) =>
          `<div class="section-content">${index + 1}  ${cmd}</div>`
      )
      .join("");

    this.addOutput(
      `<div class="section-content"><strong>Command History:</strong></div>${historyText}`
    );
  }

  showUptime() {
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let uptimeStr = "";
    if (days > 0) uptimeStr += `${days} day${days > 1 ? "s" : ""}, `;
    if (hours % 24 > 0)
      uptimeStr += `${hours % 24} hour${hours % 24 > 1 ? "s" : ""}, `;
    if (minutes % 60 > 0)
      uptimeStr += `${minutes % 60} minute${minutes % 60 > 1 ? "s" : ""}, `;
    uptimeStr += `${seconds % 60} second${seconds % 60 > 1 ? "s" : ""}`;

    this.addOutput(
      `<div class="section-content">System uptime: ${uptimeStr}</div>`
    );
  }

  createLoadingAnimation(text = "Loading") {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading-animation";
    loadingDiv.style.cssText = `
      color: #ffff00;
      font-family: 'Courier New', monospace;
    `;

    let dots = 0;
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      loadingDiv.textContent = text + ".".repeat(dots);
    }, 500);

    this.interactiveTerminal.appendChild(loadingDiv);
    this.scrollToBottom();

    return {
      element: loadingDiv,
      stop: () => {
        clearInterval(interval);
        loadingDiv.remove();
      },
    };
  }

  createProgressBar(total = 100) {
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.style.cssText = `
      margin: 10px 0;
      font-family: 'Courier New', monospace;
    `;

    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
      width: 100%;
      height: 20px;
      background: #333;
      border: 1px solid #555;
      position: relative;
      overflow: hidden;
    `;

    const progressFill = document.createElement("div");
    progressFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #00ff00, #00aa00);
      width: 0%;
      transition: width 0.3s ease;
    `;

    const progressText = document.createElement("div");
    progressText.style.cssText = `
      color: #00ff00;
      margin-top: 5px;
    `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    this.interactiveTerminal.appendChild(progressContainer);
    this.scrollToBottom();

    return {
      update: (current) => {
        const percentage = Math.min(100, Math.max(0, (current / total) * 100));
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `Progress: ${Math.round(
          percentage
        )}% (${current}/${total})`;
      },
      complete: () => {
        progressFill.style.width = "100%";
        progressText.textContent = `Complete: 100% (${total}/${total})`;
        setTimeout(() => progressContainer.remove(), 2000);
      },
    };
  }

  highlightSyntax(code, language = "javascript") {
    // Simple syntax highlighting for common languages
    const keywords = {
      javascript: [
        "function",
        "const",
        "let",
        "var",
        "if",
        "else",
        "for",
        "while",
        "return",
        "class",
        "import",
        "export",
      ],
      python: [
        "def",
        "class",
        "if",
        "else",
        "elif",
        "for",
        "while",
        "return",
        "import",
        "from",
        "try",
        "except",
      ],
      bash: [
        "echo",
        "cd",
        "ls",
        "mkdir",
        "rm",
        "cp",
        "mv",
        "grep",
        "find",
        "chmod",
        "sudo",
      ],
    };

    let highlighted = code;

    // Highlight keywords
    if (keywords[language]) {
      keywords[language].forEach((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, "g");
        highlighted = highlighted.replace(
          regex,
          `<span style="color: #ff6b6b;">${keyword}</span>`
        );
      });
    }

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #4ecdc4;">$1$2$1</span>'
    );

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|#.*$)/gm,
      '<span style="color: #888;">$1</span>'
    );

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b\d+\.?\d*\b/g,
      '<span style="color: #f7dc6f;">$&</span>'
    );

    return highlighted;
  }

  async loadBlogs() {
    try {
      const response = await fetch(
        "https://blogs-function.netlify.app/.netlify/functions/blogs-function"
      );
      const blogs = await response.json();
      this.blogsData = blogs.sort(
        (a, b) => Date.parse(b.addedOn) - Date.parse(a.addedOn)
      );
    } catch (error) {
      console.error("Failed to load blogs:", error);
      this.blogsData = [];
    }
  }

  async sendMessage() {
    const name = document.getElementById("contact-name").value;
    const message = document.getElementById("contact-message").value;

    if (!name || !message) {
      this.addOutput(
        `<div class="error-message">Please fill in all fields.</div>`
      );
      return;
    }

    try {
      // Initialize EmailJS if not already done
      if (typeof emailjs !== "undefined") {
        await emailjs.send(
          "service_16ayyef",
          "template_48nqu1e",
          { name: name, message: message },
          "TVJL_f4Vr5Uwg2l-R"
        );
        this.addOutput(
          `<div class="success-message">Message sent successfully!</div>`
        );
        document.getElementById("contact-name").value = "";
        document.getElementById("contact-message").value = "";
      } else {
        this.addOutput(
          `<div class="success-message">Message would be sent: "${message}" from ${name}</div>`
        );
      }
    } catch (error) {
      this.addOutput(
        `<div class="error-message">Failed to send message. Please try again.</div>`
      );
    }
  }
}

// Initialize terminal when page loads
let terminal;
document.addEventListener("DOMContentLoaded", () => {
  terminal = new Terminal();
});

// Initialize EmailJS
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("user_etepfJ0QfVa5RVKcZWOCb");
  }
})();
