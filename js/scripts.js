class Terminal {
  constructor() {
    this.input = document.getElementById("terminal-input");
    this.interactiveTerminal = document.getElementById("interactive-terminal");
    this.commandHistory = [];
    this.historyIndex = -1;
    this.currentDirectory = "~";

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
    };

    this.init();
  }

  init() {
    this.input.addEventListener("keydown", this.handleKeyDown.bind(this));

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
        event.target.closest(".download-button")
      ) {
        return;
      }

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
        this.executeCommand();
        break;
      case "ArrowUp":
        event.preventDefault();
        this.navigateHistory(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.navigateHistory(1);
        break;
      case "Tab":
        event.preventDefault();
        this.autoComplete();
        break;
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
  <strong>clear</strong>      - Clear terminal screen<br>
  <strong>exit</strong>       - Close terminal<br>
  <strong>ls</strong>         - List directory contents<br>
  <strong>whoami</strong>     - Display current user<br>
  <strong>date</strong>       - Show current date and time<br>
  <strong>pwd</strong>        - Print working directory
</div>`;
    this.addOutput(helpText);
  }

  showAbout() {
    const aboutText = `
<div class="section-content">
<pre>NAME:        Ashis Sharma
ROLE:        DevOps Engineer
COMPANY:     Jukshio Technology Pvt. Ltd.
STATUS:      Currently Active

DESCRIPTION:
My love for technology and Cloud Services runs deep, and I find my greatest joy in
getting my hands dirty with hands-on work. With a strong technical background, I enjoy
nothing more than coming up with creative solutions that truly resonate with my clients.

I take pride in my ability to deliver results even under tight deadlines, all while
working closely with my clients to ensure their visions are brought to life in the
best possible way.

SPECIALTIES:
  • Technology & Cloud Services
  • Creative Problem Solving
  • Client-focused Solutions
  • Results-driven Approach</pre>
</div>`;
    this.addOutput(aboutText);
  }

  showSkills() {
    const skillsText = `
<div class="section-content">
<pre>TECHNICAL SKILLS:

[01] Kubernetes              [06] Golang
[02] Docker                  [07] Gitlab CI/CD
[03] Google Cloud Platform   [08] Node.js
[04] Microsoft Azure         [09] Linux
[05] Terraform               [10] Git</pre>
</div>`;
    this.addOutput(skillsText);
  }

  showExperience() {
    const experienceText = `
<div class="section-content">
<pre>[01] DevOps Engineer
     Company:     Jukshio Technology Pvt. Ltd.
     Duration:    2023 - Present (Current Position)

     Key Responsibilities:
     • Designed and implemented cloud infrastructure on GCP and Azure
     • Built and maintained CI/CD pipelines using GitLab CI/CD
     • Managed Kubernetes clusters for containerized applications
     • Automated deployment processes using Terraform and Infrastructure as Code
     • Monitored system performance and implemented logging solutions
     • Collaborated with development teams to optimize application deployment
     • Implemented security best practices for cloud environments
     • Reduced deployment time by 60% through automation initiatives

[02] Test Engineer
     Company:     Wipro
     Duration:    2022 - 2023 (9 Months)

     Key Responsibilities:
     • Developed comprehensive test plans and test cases for web applications
     • Performed manual and automated testing using various testing frameworks
     • Identified, documented, and tracked software defects through resolution
     • Collaborated with development teams to ensure quality deliverables
     • Conducted regression testing and user acceptance testing
     • Created detailed test reports and documentation
     • Participated in agile development processes and sprint planning
     • Improved testing efficiency by implementing automated test scripts</pre>
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
      this.addOutput(
        `<div class="section-content">Loading blog posts...</div>`
      );
      // Try to load blogs if not already loaded
      await this.loadBlogs();
      if (this.blogsData && this.blogsData.length > 0) {
        this.showBlogs();
      } else {
        this.addOutput(
          `<div class="error-message">Unable to load blog posts at this time.</div>`
        );
      }
    }
  }

  showContact() {
    const contactText = `
<div class="section-content">
<pre>CONTACT INFORMATION:
Click on the links below to visit my profiles:

LinkedIn:      <a href="https://www.linkedin.com/in/ashissharma/" target="_blank" class="social-link">https://www.linkedin.com/in/ashissharma/</a>
  └─ Click to view professional profile and connect

GitHub:        <a href="https://github.com/ashissharma97" target="_blank" class="social-link">https://github.com/ashissharma97</a>
  └─ Click to explore my code repositories and projects

Email:         <a href="mailto:ashissharma@outlook.com" class="social-link">ashissharma@outlook.com</a>
  └─ Click to send me an email directly

StackOverflow: <a href="https://stackoverflow.com/users/10069184/ashis" target="_blank" class="social-link">https://stackoverflow.com/users/10069184/ashis</a>
  └─ Click to view my contributions and Q&A activity</pre>
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

    // Simulate download process
    statusDiv.innerHTML =
      '<div class="section-content" style="color: #ffff00;">Preparing download...</div>';

    setTimeout(() => {
      // Create a dummy PDF download (you would replace this with actual resume file)
      const link = document.createElement("a");
      link.href = "#"; // Replace with actual resume PDF path
      link.download = "Ashis_Sharma_Resume.pdf";

      // Log the email for analytics (in real implementation, you'd send this to your backend)
      console.log("Resume downloaded by:", email);

      statusDiv.innerHTML =
        '<div class="success-message">Resume download started! Check your downloads folder.</div>';

      // In a real implementation, you would:
      // 1. Send the email to your backend for tracking
      // 2. Provide the actual resume file path
      // 3. Maybe send a follow-up email to the user

      // For demo purposes, show a message
      setTimeout(() => {
        statusDiv.innerHTML +=
          '<div class="section-content" style="color: #888; font-size: 12px;">Note: This is a demo. In production, the actual resume file would be downloaded.</div>';
      }, 1000);
    }, 1500);
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
