// ===== Theme Management =====
const themeToggle = document.getElementById("theme-toggle")
const html = document.documentElement

function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  html.setAttribute("data-theme", savedTheme)
  initParticles()
  updateThemeImages() // Set correct images on page load
}

function toggleTheme() {
  const currentTheme = html.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"
  html.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  clearParticles()
  initParticles()
  updateThemeImages() // Switch images based on theme
}

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme)
}

// ===== Theme-based Image Switching =====
function updateThemeImages() {
  const themeImages = document.querySelectorAll(".theme-image")
  const currentTheme = html.getAttribute("data-theme")

  themeImages.forEach((img) => {
    const lightSrc = img.getAttribute("data-light")
    const darkSrc = img.getAttribute("data-dark")

    if (currentTheme === "dark" && darkSrc) {
      img.src = darkSrc
    } else if (lightSrc) {
      img.src = lightSrc
    }
  })
}

// ===== Particle System (Both Themes with different colors) =====
const canvas = document.getElementById("particles")
const ctx = canvas ? canvas.getContext("2d") : null
let particles = []
let animationId = null

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
}

function createParticle() {
  const isDark = html.getAttribute("data-theme") === "dark"
  return {
    x: Math.random() * (canvas ? canvas.width : window.innerWidth),
    y: Math.random() * (canvas ? canvas.height : window.innerHeight),
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1,
    opacity: isDark ? Math.random() * 0.5 + 0.2 : Math.random() * 0.3 + 0.1,
    color: isDark ? (Math.random() > 0.5 ? "#08FDD8" : "#B400FF") : Math.random() > 0.5 ? "#e85d75" : "#f5a623",
  }
}

function initParticles() {
  if (!canvas || animationId) return
  resizeCanvas()
  particles = []
  const isDark = html.getAttribute("data-theme") === "dark"
  const particleCount = isDark ? 80 : 50
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle())
  }
  animateParticles()
}

function clearParticles() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  particles = []
}

function animateParticles() {
  if (!ctx || !canvas) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const isDark = html.getAttribute("data-theme") === "dark"
  const lineOpacityMultiplier = isDark ? 0.2 : 0.1

  particles.forEach((particle, index) => {
    particle.x += particle.vx
    particle.y += particle.vy
    if (particle.x < 0) particle.x = canvas.width
    if (particle.x > canvas.width) particle.x = 0
    if (particle.y < 0) particle.y = canvas.height
    if (particle.y > canvas.height) particle.y = 0
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fillStyle = particle.color
    ctx.globalAlpha = particle.opacity
    ctx.fill()
    particles.forEach((otherParticle, otherIndex) => {
      if (index !== otherIndex) {
        const dx = particle.x - otherParticle.x
        const dy = particle.y - otherParticle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 150) {
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(otherParticle.x, otherParticle.y)
          ctx.strokeStyle = particle.color
          ctx.globalAlpha = ((150 - distance) / 150) * lineOpacityMultiplier
          ctx.stroke()
        }
      }
    })
  })
  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animateParticles)
}

window.addEventListener("resize", resizeCanvas)

// ===== Cursor Glow Effect (Dark Mode Only) =====
const cursorGlow = document.getElementById("cursor-glow")
document.addEventListener("mousemove", (e) => {
  if (cursorGlow && html.getAttribute("data-theme") === "dark") {
    cursorGlow.style.left = e.clientX + "px"
    cursorGlow.style.top = e.clientY + "px"
  }
})

// ===== 3D Tilt Effect on Hero Image =====
const heroImageWrapper = document.getElementById("hero-image")
if (heroImageWrapper) {
  heroImageWrapper.addEventListener("mousemove", (e) => {
    const rect = heroImageWrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    heroImageWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  })
  heroImageWrapper.addEventListener("mouseleave", () => {
    heroImageWrapper.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
  })
}

// ===== Enhanced 3D Tilt Effect on Cards (depth effect where cursor is closer) =====
function initTiltCards() {
  const tiltCards = document.querySelectorAll("[data-tilt]")
  tiltCards.forEach((card) => {
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0
    let rafId = null

    function animate() {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08

      card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(10px) scale(1.02)`

      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        rafId = requestAnimationFrame(animate)
      }
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Enhanced tilt calculation for depth effect
      targetX = ((y - centerY) / centerY) * 8
      targetY = ((centerX - x) / centerX) * 8

      // Update glow position for cards with glow effect
      const glow = card.querySelector(".card-glow")
      if (glow) {
        const percentX = (x / rect.width) * 100
        const percentY = (y / rect.height) * 100
        card.style.setProperty("--mouse-x", percentX + "%")
        card.style.setProperty("--mouse-y", percentY + "%")
      }

      if (!rafId) {
        rafId = requestAnimationFrame(animate)
      }
    })

    card.addEventListener("mouseleave", () => {
      targetX = 0
      targetY = 0
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      const resetAnimation = () => {
        currentX += (0 - currentX) * 0.12
        currentY += (0 - currentY) * 0.12
        if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
          card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(0) scale(1)`
          requestAnimationFrame(resetAnimation)
        } else {
          card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)"
        }
      }
      resetAnimation()
    })
  })
}

// ===== Typing Effect for Hero Roles =====
const typingElement = document.getElementById("typing-roles")
if (typingElement) {
  const roles = [
    "AI Engineer",
    "Machine Learning Developer",
    "Full Stack Builder",
    "ML Student",
    "Security Enthusiast",
    "Problem Solver",
    "Tech Enthusiast",
    "Lifelong Learner",
    "Open Source Contributor",
    "Ironman Fan"

  ]
  let roleIndex = 0
  let charIndex = 0
  let isDeleting = false
  let typingSpeed = 100

  function typeRole() {
    const currentRole = roles[roleIndex]

    if (isDeleting) {
      typingElement.textContent = currentRole.substring(0, charIndex - 1)
      charIndex--
      typingSpeed = 50
    } else {
      typingElement.textContent = currentRole.substring(0, charIndex + 1)
      charIndex++
      typingSpeed = 100
    }

    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2000
      isDeleting = true
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false
      roleIndex = (roleIndex + 1) % roles.length
      typingSpeed = 500
    }

    setTimeout(typeRole, typingSpeed)
  }

  setTimeout(typeRole, 1000)
}

// ===== Scroll Animations =====
const fadeElements = document.querySelectorAll(
  ".section-title, .about-content, .skill-category, .project-card-enhanced, .project-card-mini, .achievement-item, .focus-card, .intro-quote-card, .book-quote, .case-study-card, .research-commitment, .contact-method",
)
const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 }
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in", "visible")
    }
  })
}, observerOptions)
fadeElements.forEach((el) => {
  el.classList.add("fade-in")
  fadeObserver.observe(el)
})

// ===== Stat Counter Animation =====
const statNumbers = document.querySelectorAll(".stat-flow-number")
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target
        const text = target.textContent
        const countTo = Number.parseInt(text)
        if (!countTo || isNaN(countTo)) return
        let current = 0
        const increment = countTo / 40
        const stepTime = 50
        const counter = setInterval(() => {
          current += increment
          if (current >= countTo) {
            target.textContent = text
            clearInterval(counter)
          } else {
            target.textContent = Math.floor(current) + (text.includes("+") ? "+" : "")
          }
        }, stepTime)
        countObserver.unobserve(target)
      }
    })
  },
  { threshold: 0.5 },
)
statNumbers.forEach((stat) => countObserver.observe(stat))

// ===== Mobile Navigation =====
const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
const navLinks = document.querySelector(".nav-links")
if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("active")
    mobileMenuBtn.classList.toggle("active")
  })
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active")
      mobileMenuBtn.classList.remove("active")
    })
  })
}

// ===== Smooth Scroll for Scroll Indicator =====
const scrollIndicator = document.getElementById("scroll-down")
if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const nextSection = document.querySelector(".section")
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  })
}

// ===== Navbar Background on Scroll =====
const navbar = document.querySelector(".navbar")
window.addEventListener("scroll", () => {
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "var(--card-shadow)"
    } else {
      navbar.style.boxShadow = "none"
    }
  }
})

// ===== Hero Image Scale on Scroll =====
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY
  const heroImg = document.querySelector(".hero-img")
  if (heroImg && scrollY < 600) {
    const scale = 1 + scrollY * 0.0003
    const imgs = document.querySelectorAll(".hero-img")
    imgs.forEach((img) => {
      img.style.transform = `scale(${Math.min(scale, 1.15)})`
    })
  }
})

// ===== Initialize =====
initTheme()
initTiltCards()

// Reinitialize tilt cards on page navigation (for SPA-like behavior)
document.addEventListener("DOMContentLoaded", initTiltCards)

