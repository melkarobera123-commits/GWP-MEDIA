(function () {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  document.body.classList.add('js-reveal');

  // Subtle reveal on scroll
  const revealEls = qsa('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Blog search + tag filter
  const postSearch = qs('#postSearch');
  const posts = qsa('.blog-post[data-tags]');
  const chips = qsa('.filter-chip[data-filter]');
  if (posts.length && (postSearch || chips.length)) {
    let activeFilter = 'all';

    const applyFilter = () => {
      const term = (postSearch ? postSearch.value : '').trim().toLowerCase();
      posts.forEach((post) => {
        const text = post.textContent.toLowerCase();
        const tags = (post.getAttribute('data-tags') || '').toLowerCase();
        const matchesText = !term || text.includes(term);
        const matchesTag = activeFilter === 'all' || tags.includes(activeFilter);
        post.style.display = matchesText && matchesTag ? '' : 'none';
      });
    };

    if (postSearch) {
      postSearch.addEventListener('input', applyFilter);
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });

    applyFilter();
  }

  // Projects lightbox
  const lightbox = qs('#lightbox');
  const lightboxImg = qs('.lightbox-image');
  const closeBtn = qs('.lightbox-close');
  const lightboxPrev = qs('.lightbox-prev');
  const lightboxNext = qs('.lightbox-next');
  const posterImages = qsa('.poster-item img');

  if (lightbox && lightboxImg && closeBtn && posterImages.length) {
    let currentPosterIndex = 0;

    const showPosterAt = (index) => {
      if (!posterImages.length) return;
      const safeIndex = (index + posterImages.length) % posterImages.length;
      currentPosterIndex = safeIndex;
      const img = posterImages[safeIndex];
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.src = '';
      lightboxImg.alt = '';
      document.body.classList.remove('no-scroll');
    };

    posterImages.forEach((img, index) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        showPosterAt(index);
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      });
    });

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', () => showPosterAt(currentPosterIndex - 1));
    }
    if (lightboxNext) {
      lightboxNext.addEventListener('click', () => showPosterAt(currentPosterIndex + 1));
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPosterAt(currentPosterIndex - 1);
      if (e.key === 'ArrowRight') showPosterAt(currentPosterIndex + 1);
    });
  }

  // Reading progress for post pages
  const progressBar = qs('.reading-progress span');
  const content = qs('.post-content');
  if (progressBar && content) {
    const updateProgress = () => {
      const rect = content.getBoundingClientRect();
      const contentTop = rect.top + window.scrollY;
      const total = Math.max(1, content.offsetHeight - window.innerHeight);
      const progressed = Math.min(Math.max(window.scrollY - contentTop, 0), total);
      const ratio = progressed / total;
      progressBar.style.transform = `scaleX(${ratio})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }
})();
