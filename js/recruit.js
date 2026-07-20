/**
 * Silk Kanazawa 求人LP - JavaScript
 * アニメーション・インタラクション・アクセシビリティ機能
 * （main.js からスケジュール/Google Sheets 連携を除いた軽量版）
 */

(function() {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ===== Scroll Reveal Animation =====
  const initScrollReveal = function() {
    const revealItems = document.querySelectorAll(".scroll-reveal");

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px"
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealItems.forEach((el) => observer.observe(el));
    } else {
      // reduced-motionまたはObserver非対応時は即時表示
      revealItems.forEach((el) => el.classList.add("visible"));
    }
  };

  // ===== Smooth Scroll =====
  const initSmoothScroll = function() {
    document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((anchor) => {
      anchor.addEventListener("click", function(e) {
        const href = this.getAttribute("href");

        if (href === "#") {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });

        // フォーカス管理（アクセシビリティ）
        target.setAttribute('tabindex', '-1');
        target.focus();
      });
    });
  };

  // ===== Mobile Navigation =====
  const initMobileNav = function() {
    const toggle = document.querySelector('.header-mobile-toggle');
    const nav = document.querySelector('.header-nav');
    const navLinks = document.querySelectorAll('.header-nav-list a');

    if (!toggle || !nav) return;

    const openNav = function() {
      nav.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'メニューを閉じる');
      document.body.style.overflow = 'hidden';
    };

    const closeNav = function() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'メニューを開く');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
      }
    });

    if (!prefersReducedMotion) {
      nav.addEventListener('click', (e) => {
        if (e.target === nav) {
          closeNav();
        }
      });
    }
  };

  // ===== FAQ Accordion =====
  const initFaqAccordion = function() {
    const faqButtons = document.querySelectorAll(".faq-question");

    faqButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const panelId = button.getAttribute("aria-controls");
        const panel = document.getElementById(panelId);

        if (!panel) return;

        const isOpen = button.getAttribute("aria-expanded") === "true";

        // 他のパネルを閉じる（アコーディオン形式）
        faqButtons.forEach((otherButton) => {
          const otherPanelId = otherButton.getAttribute("aria-controls");
          const otherPanel = document.getElementById(otherPanelId);

          otherButton.setAttribute("aria-expanded", "false");
          otherButton.querySelector('.faq-icon').textContent = '+';
          if (otherPanel) {
            otherPanel.hidden = true;
          }
        });

        // 開閉切り替え
        if (!isOpen) {
          button.setAttribute("aria-expanded", "true");
          button.querySelector('.faq-icon').textContent = '×';
          panel.hidden = false;

          // スムーズスクロール（reduced-motion時を除く）
          if (!prefersReducedMotion) {
            button.scrollIntoView({
              behavior: "smooth",
              block: "nearest"
            });
          }
        }
      });
    });
  };

  // ===== CTA Tracking =====
  const initCtaTracking = function() {
    const ctaLinks = document.querySelectorAll("[data-cta-channel]");

    ctaLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const channel = link.dataset.ctaChannel || "unknown";
        const location = link.dataset.ctaLocation || "unknown";

        // GA4イベント送信
        if (typeof gtag === "function") {
          gtag("event", "apply_click", {
            channel: channel,
            location: location,
            event_category: "engagement",
            event_label: `${channel}_${location}`
          });
        }

        // コンソールログ（開発用）
        console.log(`CTA Click: ${channel} from ${location}`);
      });
    });
  };

  // ===== Header Background on Scroll =====
  const initHeaderScroll = function() {
    const header = document.querySelector(".header");

    if (!header) return;

    let lastScrollY = 0;

    window.addEventListener("scroll", () => {
      const currentScrollY = window.pageYOffset;

      // スクロール方向を判定
      const isScrollingDown = currentScrollY > lastScrollY;

      if (currentScrollY > 50) {
        header.classList.add("scrolled");

        // スクロールダウン時はヘッダーを少し縮小
        if (isScrollingDown) {
          header.style.transform = "translateY(-8px)";
        } else {
          header.style.transform = "translateY(0)";
        }
      } else {
        header.classList.remove("scrolled");
        header.style.transform = "translateY(0)";
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  };

  // ===== Lazy Loading for Images =====
  const initLazyLoading = function() {
    const images = Array.from(document.querySelectorAll('img[loading="lazy"]'));

    images.forEach((img) => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('loaded');
        });
        img.addEventListener('error', () => {
          img.classList.add('error');
        });
      }
    });
  };

  // ===== Accessibility =====
  const initFocusManagement = function() {
    // ESCキーで開いているFAQを閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      const openFaq = document.querySelector('.faq-question[aria-expanded="true"]');
      if (openFaq) {
        openFaq.click();
      }
    });
  };

  // ===== Initialize All =====
  const runInit = function() {
    initScrollReveal();
    initSmoothScroll();
    initMobileNav();
    initFaqAccordion();
    initCtaTracking();
    initHeaderScroll();
    initLazyLoading();
    initFocusManagement();
  };

  // ===== DOM Ready =====
  const init = function() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runInit);
    } else {
      runInit();
    }
  };

  init();

})();
