import React, { useEffect, useRef, useState } from 'react';
import './firebase';

interface VideoModalData {
  isOpen: boolean;
  title: string;
  serviceName: string;
  videoUrl?: string;
}

export default function App() {
  // Navigation & Scroll
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Video Demo Modal
  const [videoModal, setVideoModal] = useState<VideoModalData>({
    isOpen: false,
    title: '',
    serviceName: '',
  });

  // Official CAR editz Studio Productions (Locked & Permanent)
  const [currentPpfVideoUrl, setCurrentPpfVideoUrl] = useState<string>(() => {
    return localStorage.getItem('car_editz_ppf_video') || '/assets/videos/ppf-installation-showcase.mp4';
  });
  const [isUploadingPpf, setIsUploadingPpf] = useState(false);
  const [ppfUploadMsg, setPpfUploadMsg] = useState<string | null>(null);
  const [isDraggingPpf, setIsDraggingPpf] = useState(false);
  const ppfFileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePpfFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingPpf(true);
    setPpfUploadMsg('Uploading PPF Video...');
    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('/api/upload-video?target=ppf', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newUrl = data.url;
        setCurrentPpfVideoUrl(newUrl);
        localStorage.setItem('car_editz_ppf_video', newUrl);
        setPpfUploadMsg('Video updated successfully! ✓');
        setTimeout(() => setPpfUploadMsg(null), 3500);
      } else {
        setPpfUploadMsg(data.error || 'Failed to upload video');
        setTimeout(() => setPpfUploadMsg(null), 3500);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setPpfUploadMsg('Upload failed. Please try again.');
      setTimeout(() => setPpfUploadMsg(null), 3500);
    } finally {
      setIsUploadingPpf(false);
    }
  };

  const ceramicVideoUrl = '/assets/videos/ceramic-coating-showcase.mp4';
  const grapheneVideoUrl = '/assets/videos/graphene-coating-showcase.mp4';

  // Refs for Ambient Canvas
  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Header scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Simple active link detection
      const sections = ['home', 'about', 'services', 'ppf', 'ceramic', 'graphene', 'work', 'products', 'contact'];
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sections[i]);
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Ambient Canvas Particles Animation (Nano-carbon embers)
  useEffect(() => {
    const canvas = ambientCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(width > 768 ? 32 : 16, 36);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.6 - 0.15,
      alpha: Math.random() * 0.45 + 0.15,
      fadeSpeed: Math.random() * 0.006 + 0.002,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.fadeSpeed;

        if (p.alpha > 0.65 || p.alpha < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 0, 18, ${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(230, 0, 18, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Mouse movement for spotlight glow on cards
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // 5. Open video showcase modal
  const openVideo = (title: string, serviceName: string, videoUrl?: string) => {
    setVideoModal({
      isOpen: true,
      title,
      serviceName,
      videoUrl: videoUrl || '',
    });
  };

  // 6. Form Submission handler via Express & Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          vehicle,
          service,
          notes,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Inquiry received! Our master detailer will reach out within 2 hours.',
        });
        setFullName('');
        setPhone('');
        setVehicle('');
        setService('');
        setNotes('');
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to submit inquiry. Please verify all fields.',
        });
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Network connection issue. Please verify or reach us via WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Dynamic Nano Carbon Ambient Particle Canvas */}
      <canvas id="ambient-canvas" ref={ambientCanvasRef}></canvas>

      {/* HEADER */}
      <header id="main-header" className={isScrolled ? 'scrolled' : ''}>
        <div className="wrap">
          <nav>
            <a className="brand-logo" href="#home" id="brand-logo-link">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRocNJWWNfHHjrMZkacWBoGIBJ2qKJjyRR9sgk8BKmQ6bbGI-zinxTKgtPLVS9fy3LqBCHQ6HMb8CUhvq7VFRFGF39cha31uW6kF4MXGLFn0w_N0OeZcFDecIVKqgnBIoqtxY0L-KAr-awtlQCTEHSHiCWAhEPlbXXNpSgw4uTdPguIqd3y31I00BFcdWSWSHE52AXJhugnl7ZBub89Sj2o0rWcjvU-QMD0qLxS5FqGf6eVhkTFNgJVe4-RTEU39zl"
                alt="CAR editz"
                style={{ height: '38px', width: 'auto', objectFit: 'contain', display: 'block' }}
              />
              <span>
                CAR <span className="red">EDITZ</span>
              </span>
              <span className="brand-badge hidden sm:inline-block">STUDIO</span>
            </a>

            <div className="links">
              <a className={activeSection === 'home' ? 'active' : ''} href="#home">
                Home
              </a>
              <a className={activeSection === 'about' ? 'active' : ''} href="#about">
                About
              </a>
              <a className={activeSection === 'services' ? 'active' : ''} href="#services">
                Services
              </a>
              <a className={activeSection === 'work' ? 'active' : ''} href="#work">
                Gallery
              </a>
              <a className={activeSection === 'products' ? 'active' : ''} href="#products">
                Products
              </a>
              <a className={activeSection === 'contact' ? 'active' : ''} href="#contact">
                Contact
              </a>

              <div className="icons">
                <a href="#contact" title="Instagram">
                  IG
                </a>
                <a href="#contact" title="Facebook">
                  FB
                </a>
                <a
                  href="https://wa.me/919994551416?text=Hi%20CAR%20editz%2C%20I%20would%20like%20to%20inquire%20about%20car%20detailing%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Connect on WhatsApp: +91 99945 51416"
                >
                  WA
                </a>
              </div>

              <a className="book" href="#contact" id="nav-book-service-btn">
                Book Service
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="wrap">
          <div className="eyebrow reveal-item revealed">
            High-Performance Automotive Care &amp; Armor
          </div>
          <h1 className="reveal-item delay-1 revealed">
            DRIVE BETTER
            <br />
            <span>LOOK LONGER</span>
          </h1>
          <p className="reveal-item delay-2 revealed">
            Precision paint protection film, graphene &amp; ceramic coatings, surgical paint
            correction, and custom automotive detailing designed for exotic, luxury, and enthusiast
            vehicles.
          </p>
          <div className="hero-actions reveal-item delay-3 revealed">
            <a className="btn red" href="#services" id="hero-explore-btn">
              Explore Services →
            </a>
            <a className="btn" href="#contact" id="hero-quote-btn">
              Get Quote / Book
            </a>
          </div>
        </div>
      </section>

      {/* SERVICE QUICK BAR */}
      <div className="servicebar" id="service-quick-bar">
        <div className="wrap">
          <a href="#ppf" id="quickbar-ppf">
            <b>◊</b>PPF Film
          </a>
          <a href="#ceramic" id="quickbar-ceramic">
            <b>♦</b>Ceramic Coating
          </a>
          <a href="#graphene" id="quickbar-graphene">
            <b>⬡</b>Graphene Coat
          </a>
          <a href="#wash" id="quickbar-wash">
            <b>▱</b>Wash &amp; Detailing
          </a>
          <a href="#tint" id="quickbar-tint">
            <b>▣</b>Auto Tinting
          </a>
          <a href="#paint" id="quickbar-paint">
            <b>◎</b>Paint Correction
          </a>
        </div>
      </div>

      {/* 01 / ABOUT */}
      <section id="about">
        <div className="wrap">
          <div className="top reveal-item revealed">
            <div>
              <div className="kicker">01 / Studio Overview</div>
              <h2>CAR EDITZ STUDIO</h2>
            </div>
            <div className="intro">
              Ultra-high standard vehicle enhancement, surface protection, and paint restoration
              crafted under one master roof.
            </div>
          </div>

          <div className="about-grid">
            <div className="about-card reveal-item delay-1 revealed" style={{ gridColumn: '1 / -1' }}>
              <p className="about-quote">
                “We don't just detail cars — we preserve automotive art. Every curve, panel, and
                surface is treated with laboratory-grade precision and unmatched passion.”
              </p>
              <div className="steps">
                <div className="step" id="step-protect">
                  <b data-num="01">01</b>PROTECT
                </div>
                <div className="step" id="step-enhance">
                  <b data-num="02">02</b>ENHANCE
                </div>
                <div className="step" id="step-detail">
                  <b data-num="03">03</b>DETAIL
                </div>
                <div className="step" id="step-defend">
                  <b data-num="04">04</b>DEFEND
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / SERVICES GRID */}
      <section id="services">
        <div className="wrap">
          <div className="top reveal-item revealed">
            <div>
              <div className="kicker">02 / Specialist Services</div>
              <h2>OUR CORE SERVICES</h2>
            </div>
            <div className="intro">
              Engineered protection and flawless aesthetic finishes tailored specifically for your
              vehicle.
            </div>
          </div>

          <div className="cards">
            {/* CARD 1: PPF */}
            <a
              className="card reveal-item delay-1 revealed"
              href="#ppf"
              id="service-card-ppf"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="PPF"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQeYSnsfSmymKvAw2NnQ4cqOofF8jHsaHaUmtv6Z7CWX2FX5fD3t3cLqzLn6fwJMRqcAF-t5i2j1pUhbcp0tCaMiV7NL-cjJ6Q3O-9fzLDwEQ8F8eIcNc9J8cIIZkOYk6vDImCDgNd5wusYQUw44xpz1oZaxpO5pBe7_guPV-8vDAQ4O2wUIvthalThLSxbwNCTrDbtZ1jmccDWfpQ2OUdWi3JaFFlh82zM7apg4HTHeka3nkEEww"
              />
              <div className="txt">
                <span className="txt-badge">Armor Shield</span>
                <h3>PAINT PROTECTION FILM</h3>
                <p>Self-healing invisible barrier against stone chips and abrasions.</p>
              </div>
            </a>

            {/* CARD 2: CERAMIC */}
            <a
              className="card reveal-item delay-2 revealed"
              href="#ceramic"
              id="service-card-ceramic"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="Ceramic Coating"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDibAiL2ByWDO_GNULlK5B05DVsjrUwIFpf12pX6jeT8l2PcTN-arbDg8KKjX7SmxxFBMSSWZE4McrR_Jg_rsITD1YCy_MQaRNJqN8p7hc5iXO0Rzi421QTm0ZeSeL-cyu1GZrPPH77qLJ5QhATdPwsCywqMSPjNrcRFEVQYv_5sUdgnKRfUS_aqScEAOxSf8RkmyeQo0JztXpxfoGHAj0IfNUOAId7Rr3atkQ5TK5mlQyF7W7PBwg"
              />
              <div className="txt">
                <span className="txt-badge">Deep Hydrophobic</span>
                <h3>CERAMIC COATING</h3>
                <p>Ultra-dense molecular gloss with permanent water beading.</p>
              </div>
            </a>

            {/* CARD 3: GRAPHENE */}
            <a
              className="card reveal-item delay-3 revealed"
              href="#graphene"
              id="service-card-graphene"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="Graphene Coating"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq9sP19S906yuyYsPKC2A5OlZ-pbEfyI3X4pDe0KfeiZ6u_lebPQt__sL84zNOthpAgLQ_POWck9JNn_scB6DFvDgCGk03UnkPtlgpEs3xMQ2FnsTCVdy3B2-taacUSGSALeOJLi3GcJ8zejCWP4bwZ1nhwlOgTMUDgdMyRrjYgRdJJvJf8vTRYSSDW4rSfvcbaueA8Fp7DCkyrM1z_d3rEwwDX7xRGJ1VhXnpyKenlDjYiw-R_bg"
              />
              <div className="txt">
                <span className="txt-badge">Next-Gen Carbon</span>
                <h3>GRAPHENE COATING</h3>
                <p>Enhanced heat dissipation, zero water spotting, and slickness.</p>
              </div>
            </a>

            {/* CARD 4: DETAILING */}
            <a
              className="card reveal-item delay-1 revealed"
              href="#wash"
              id="service-card-wash"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="Detailing"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjG0Lv0OezET0akFRidrBunOyzeMVjibQZ_iBFZmaO-ojXG6X3mgZwbrdVSsanYh2miycEKbOYLAE26jrNSzTzYCx8Dx8ZTnjpz4PjORU_YvKkQzW-mtDO4brBzWuPVohSNK59v3wlTZpG70XAx5dEjRLGK1dt0RCD9Eb6W1maAgduvgiK-Ykjlj0CzO7COjQV5bdD0xuStfo7RsaQN8sIpe7lAOFKOvhayTtclvbO-KAmK_it9QY"
              />
              <div className="txt">
                <span className="txt-badge">Deep Restoration</span>
                <h3>WASH &amp; DETAILING</h3>
                <p>Multi-stage decon wash, steam interior sanitize &amp; leather prep.</p>
              </div>
            </a>

            {/* CARD 5: WINDOW TINT */}
            <a
              className="card reveal-item delay-2 revealed"
              href="#tint"
              id="service-card-tint"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="Tinting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFfx13u9cvcUSZ6JNz8iq6C7G6AYGhzTMVs80a9eYE41cNlRH665r7_DyfIr35uJTpwZUmO8FGgLRUQXj3K_ndz7RUMDPd2vH45sOSjTtylE7AjfLDkJKjVq9DmreZUIrQaQmXXFLcmtu7qCK0cUvTSGDrzCCBChMiNFttd_ZH0K484xHrRyNo1VQuh-aNti7QidFRSB049M-mtqIBXLDagGmwI1uPejZQa8UmvvIhjx6q8fl9F7o"
              />
              <div className="txt">
                <span className="txt-badge">Thermal &amp; UV Shield</span>
                <h3>CERAMIC WINDOW TINT</h3>
                <p>99% UV rejection, privacy, and maximum cabin heat reduction.</p>
              </div>
            </a>

            {/* CARD 6: PAINT CORRECTION */}
            <a
              className="card reveal-item delay-3 revealed"
              href="#paint"
              id="service-card-paint"
              onMouseMove={handleMouseMove}
            >
              <div className="border-beam"></div>
              <img
                alt="Paint Correction"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALCHta78fWJq4HWltbCZ0iES4ZhxL2cXSXpPdpue-rTmzjN7E7NPgUBTH1lJK3Z6y5EkYqsMadLQSsQq33xIyZcDWcvgvqComG0iACJQNuocX_rgHRwQwCEfPiZGaivhniBeBYWCrS6x_mquBgOx3tRQZXjsWXLiGkblRD9j47RqX3TD_FtXy5xE1IEua0NDF_AtDUSqvznhYmh0TEomkivhz2GSyTaNzMnoU7tALMzLrImGc0jqE"
              />
              <div className="txt">
                <span className="txt-badge">Mirror Reflection</span>
                <h3>PAINT CORRECTION</h3>
                <p>Compound rotary defect elimination and micro-marring correction.</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 03 / PPF DETAIL */}
      <section id="ppf">
        <div className="wrap">
          <div className="detail">
            <div className="copy reveal-item delay-1 revealed">
              <div className="kicker">03 / Protection</div>
              <h2>PAINT PROTECTION FILM (PPF)</h2>
              <p className="one">
                Engineered thermoplastic urethane film that protects vehicle paint from rock chips,
                scratch marks, road debris, and bug acid with self-healing technology.
              </p>
              <div className="steps">
                <div className="step">
                  <b data-num="01">01</b>SURFACE DECON
                </div>
                <div className="step">
                  <b data-num="02">02</b>LASER TEMPLATE
                </div>
                <div className="step">
                  <b data-num="03">03</b>SEAMLESS FIT
                </div>
                <div className="step">
                  <b data-num="04">04</b>HEAT SEAL
                </div>
              </div>
            </div>
            <div
              className={`media reveal-item delay-2 revealed ${isDraggingPpf ? 'dragging-active' : ''}`}
              id="media-ppf"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPpf(true);
              }}
              onDragLeave={() => setIsDraggingPpf(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPpf(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  handlePpfFileUpload(file);
                }
              }}
              style={{
                position: 'relative',
                outline: isDraggingPpf ? '2px dashed var(--red-accent)' : 'none',
              }}
            >
              <input
                ref={ppfFileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handlePpfFileUpload(file);
                  }
                }}
              />

              {/* Upload / Replace Video Control */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {ppfUploadMsg && (
                  <span
                    style={{
                      background: 'rgba(7, 9, 14, 0.9)',
                      backdropFilter: 'blur(8px)',
                      color: ppfUploadMsg.includes('✓') ? '#25D366' : 'var(--red-accent)',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      fontWeight: 600,
                    }}
                  >
                    {ppfUploadMsg}
                  </span>
                )}
                <button
                  type="button"
                  id="upload-ppf-video-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    ppfFileInputRef.current?.click();
                  }}
                  disabled={isUploadingPpf}
                  style={{
                    background: 'rgba(10, 12, 18, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                    cursor: isUploadingPpf ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  title="Upload video file (MP4/MOV) for PPF section"
                >
                  <span style={{ fontSize: '13px' }}>{isUploadingPpf ? '⏳' : '📹'}</span>
                  <span>{isUploadingPpf ? 'Uploading...' : 'Replace Video'}</span>
                </button>
              </div>

              {currentPpfVideoUrl ? (
                <video
                  key={currentPpfVideoUrl}
                  src={currentPpfVideoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <img
                  alt="PPF Application"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRjBA7ubuLmQuZkj6A7y1hnlYRrj8DOGNfPVfHUotDk9MdLf8UVOL4ZuH_Nk5OCHqxrWxHcqsvww4W1tK7Swh427Gm_a2Itcu2DgORN8Ua_0AJmWbG0nv6iWoP8HJS32cik2S0YEKG81rTwIFxPzJEvYfxo_CL4bNoXIk3hGtlbqnBErk7k8R3XnR7x2CIK1Ho-l4yG280QpaACWNKgrqBbkXTq_nkQSdWqEHcktW97QAbj1pnqv0"
                />
              )}

              {/* Play / Expand Video Button */}
              <div
                className="play-wrap"
                onClick={() =>
                  openVideo(
                    'PPF Precision Laser Installation',
                    'Paint Protection Film (PPF)',
                    currentPpfVideoUrl
                  )
                }
                role="button"
                tabIndex={0}
                id="play-ppf-video"
                title="Watch Fullscreen with Sound"
              >
                <div className="play-radar"></div>
                <div className="play">▶</div>
              </div>

              <label>PPF INSTALLATION DEMO</label>
            </div>
          </div>
        </div>
      </section>

      {/* 04 / CERAMIC DETAIL */}
      <section id="ceramic">
        <div className="wrap">
          <div className="detail reverse">
            <div className="copy reveal-item delay-1 revealed">
              <div className="kicker">04 / Nano Coating</div>
              <h2>CERAMIC COATING</h2>
              <p className="one">
                9H hardness ceramic matrix that bonds directly with factory clear coat. Creates an
                impenetrable shield against harsh contaminants, bird droppings, and UV fading.
              </p>
              <div className="steps">
                <div className="step">
                  <b data-num="01">01</b>STAGE 2 POLISH
                </div>
                <div className="step">
                  <b data-num="02">02</b>PANEL WIPE
                </div>
                <div className="step">
                  <b data-num="03">03</b>SIO2 COAT
                </div>
                <div className="step">
                  <b data-num="04">04</b>IR CURE
                </div>
              </div>
            </div>
            <div className="media reveal-item delay-2 revealed" id="media-ceramic">
              <video
                src={ceramicVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                className="play-wrap"
                onClick={() =>
                  openVideo(
                    'Mahindra XUV700 9H Nano Ceramic Coating & Mirror Finish Showcase',
                    '04 / Nano Coating - Ceramic Coating',
                    ceramicVideoUrl
                  )
                }
                role="button"
                tabIndex={0}
                id="play-ceramic-video"
                title="Watch Fullscreen with Sound"
              >
                <div className="play-radar"></div>
                <div className="play">▶</div>
              </div>
              <label>9H NANO CERAMIC COATING DEMO</label>
            </div>
          </div>
        </div>
      </section>

      {/* 05 / GRAPHENE DETAIL */}
      <section id="graphene">
        <div className="wrap">
          <div className="detail">
            <div className="copy reveal-item delay-1 revealed">
              <div className="kicker">05 / Carbon Tech</div>
              <h2>GRAPHENE COATING</h2>
              <p className="one">
                Graphene nanoparticles provide superior thermal conductivity, reducing water spot
                etching while providing unprecedented slickness and depth of color on dark paints.
              </p>
              <div className="steps">
                <div className="step">
                  <b data-num="01">01</b>CORRECTION
                </div>
                <div className="step">
                  <b data-num="02">02</b>INFUSION
                </div>
                <div className="step">
                  <b data-num="03">03</b>MULTI-LAYER
                </div>
                <div className="step">
                  <b data-num="04">04</b>FINAL BUFF
                </div>
              </div>
            </div>
            <div className="media reveal-item delay-2 revealed" id="media-graphene">
              <video
                src={grapheneVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                className="play-wrap"
                onClick={() =>
                  openVideo(
                    'Tata Nexon EV Graphene Machine Polish & Detailing Reel',
                    '05 / Carbon Tech - Graphene Coating',
                    grapheneVideoUrl
                  )
                }
                role="button"
                tabIndex={0}
                id="play-graphene-video"
                title="Watch Fullscreen with Sound"
              >
                <div className="play-radar"></div>
                <div className="play">▶</div>
              </div>
              <label>GRAPHENE INFUSION DEMO</label>
            </div>
          </div>
        </div>
      </section>

      {/* 06 / GALLERY WORK */}
      <section id="work">
        <div className="wrap">
          <div className="top reveal-item revealed">
            <div>
              <div className="kicker">06 / Master Gallery</div>
              <h2>RECENT STUDIO RESTORATIONS</h2>
            </div>
            <div className="intro">
              Curated showcase of supercar PPF wraps, mirror paint correction finishes, and bespoke
              ceramic coatings.
            </div>
          </div>

          <div className="gallery-grid">
            <div
              className="gallery-item reveal-item delay-1 revealed"
              id="gallery-item-1"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop"
                alt="Mercedes AMG GT Black Series PPF"
              />
            </div>
            <div
              className="gallery-item reveal-item delay-2 revealed"
              id="gallery-item-2"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop"
                alt="Porsche 911 GT3 Ceramic Coating"
              />
            </div>
            <div
              className="gallery-item reveal-item delay-3 revealed"
              id="gallery-item-3"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=800&auto=format&fit=crop"
                alt="Audi R8 V10 Multi-stage Polish"
              />
            </div>
            <div
              className="gallery-item reveal-item delay-1 revealed"
              id="gallery-item-4"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=800&auto=format&fit=crop"
                alt="Ferrari F8 Tributo Full Body PPF"
              />
            </div>
            <div
              className="gallery-item reveal-item delay-2 revealed"
              id="gallery-item-5"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop"
                alt="Lamborghini Huracan EVO Graphene"
              />
            </div>
            <div
              className="gallery-item reveal-item delay-3 revealed"
              id="gallery-item-6"
              onMouseMove={handleMouseMove}
            >
              <img
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop"
                alt="BMW M4 Competition Ceramic Tint"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 07 / PRODUCTS WE USE */}
      <section id="products">
        <div className="wrap">
          <div className="top reveal-item revealed">
            <div>
              <div className="kicker">07 / Formulation Standard</div>
              <h2>PRODUCTS &amp; CERTIFIED ARMOR</h2>
            </div>
            <div className="intro">
              We exclusively apply world-class industrial chemical formulations and certified
              optical film membranes.
            </div>
          </div>

          <div className="products-bar">
            <div className="prod-card reveal-item delay-1 revealed" id="prod-card-xpel">
              <span className="tag">Self-Healing TPU</span>
              <h4>XPEL ULTIMATE</h4>
              <p>Optically clear 8.5 mil polyurethane shield with elastomeric heat-recovery.</p>
            </div>
            <div className="prod-card reveal-item delay-2 revealed" id="prod-card-gyeon">
              <span className="tag">Quartz Matrix</span>
              <h4>GYEON MOHS+</h4>
              <p>Dual-stage Polysilazane ceramic formulation offering hard 9H protection.</p>
            </div>
            <div className="prod-card reveal-item delay-3 revealed" id="prod-card-adams">
              <span className="tag">10H Carbon Matrix</span>
              <h4>ADAM'S GRAPHENE</h4>
              <p>Reduced water-spotting index with ultra-slick reduced surface friction.</p>
            </div>
            <div className="prod-card reveal-item delay-4 revealed" id="prod-card-stek">
              <span className="tag">Nanotech Tint</span>
              <h4>STEK SMART FILM</h4>
              <p>99% UV rejection and infrared thermal rejection for luxury cabin comfort.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 08 / CONTACT & VIP BOOKING */}
      <section id="contact">
        <div className="wrap">
          <div className="contact">
            <div className="reveal-item revealed">
              <div className="kicker">08 / VIP Booking</div>
              <h2>
                BOOK YOUR
                <br />
                <span style={{ color: 'var(--red-primary)' }}>SERVICE</span>
              </h2>
              <p className="intro">
                Secure your slot in our climate-controlled detailing bay. Consultation and paint
                gauge inspections are complimentary.
              </p>

              <div className="contact-badges">
                <a
                  className="contact-pill"
                  href="https://wa.me/919994551416?text=Hi%20CAR%20editz%2C%20I%20would%20like%20to%20book%20a%20detailing%20service."
                  target="_blank"
                  rel="noopener noreferrer"
                  id="contact-whatsapp-pill"
                  style={{
                    borderColor: 'rgba(37, 211, 102, 0.4)',
                    color: '#25D366',
                    background: 'rgba(37, 211, 102, 0.08)',
                  }}
                >
                  💬 WhatsApp: +91 99945 51416
                </a>
                <a className="contact-pill" href="#contact" id="contact-instagram-pill">
                  ◎ Instagram
                </a>
                <a className="contact-pill" href="tel:+919994551416" id="contact-call-pill">
                  ☎ Call: +91 99945 51416
                </a>
              </div>
            </div>

            {/* Form synced with Express backend and Firebase Firestore */}
            <form className="booking-form reveal-item delay-1 revealed" onSubmit={handleSubmit} id="booking-form">
              <input
                id="booking-fullname-input"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <input
                id="booking-phone-input"
                placeholder="Phone / WhatsApp Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                id="booking-vehicle-input"
                placeholder="Vehicle Make, Model & Year (e.g. 2024 Porsche 911 GT3)"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                required
              />
              <select
                id="booking-service-select"
                value={service}
                onChange={(e) => setService(e.target.value)}
                required
              >
                <option disabled value="">
                  Select Primary Service
                </option>
                <option value="Full Body PPF (Matte / Gloss)">Full Body PPF (Matte / Gloss)</option>
                <option value="Front Track Package PPF">Front Track Package PPF</option>
                <option value="Ceramic Coating (3 - 5 Year)">Ceramic Coating (3 - 5 Year)</option>
                <option value="Graphene Coating (7 Year)">Graphene Coating (7 Year)</option>
                <option value="Stage 2 Paint Correction">Stage 2 Paint Correction</option>
                <option value="Ceramic Window Tint">Ceramic Window Tint</option>
                <option value="Full Interior & Exterior Detail">Full Interior & Exterior Detail</option>
              </select>
              <textarea
                id="booking-notes-textarea"
                placeholder="Specific requirements or vehicle condition (e.g. swirl marks, delivery date, custom wrap)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {submitStatus.type === 'success' && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(22, 163, 74, 0.15)',
                    border: '1px solid #16a34a',
                    padding: '14px 18px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#86efac',
                  }}
                  id="booking-success-message"
                >
                  <div style={{ fontWeight: 700 }}>
                    {submitStatus.message}
                  </div>
                </div>
              )}

              {submitStatus.type === 'error' && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(230, 0, 18, 0.15)',
                    border: '1px solid var(--red-primary)',
                    padding: '14px 18px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#ff9ca3',
                  }}
                  id="booking-error-message"
                >
                  {submitStatus.message}
                </div>
              )}

              <button
                className="btn red"
                type="submit"
                disabled={isSubmitting}
                id="booking-submit-btn"
                style={{
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.75 : 1,
                }}
              >
                {isSubmitting ? 'Processing Submission...' : 'Request Instant Quote →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap foot">
          <span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDASQd2QwdmBCaWoNjZFGJ8ZUf7wuBE6ENJd4Vsr7nvxk240KoHxaTtbUKUHd0IrJ-ex4i-PfL1H0QxFcUSGCJ-LBjv0ZnflhelGGhhi5dIyainKOPJCCvvuRLHIfotIADLsteBLroFUs17aGPKv_Ow48DN6Az9K6damnTBaAiuNykxcTvYhdu0HqWN-z_HxXXqq8JF6q8bUlQdtkhZ5jbu7SNIpaFedjVoHK1FoQ5XrAXFEiG-qYIyfAYIiAWQG5w2"
                alt="CAR editz"
                style={{ height: '22px', width: 'auto', objectFit: 'contain', verticalAlign: 'middle' }}
              />
              <span>
                © 2026 <strong>CAR EDITZ</strong> — Elite Automotive Care, Paint Protection &amp;
                Detailing.
              </span>
            </span>
          </span>

          <div className="foot-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#ppf">PPF</a>
            <a href="#ceramic">Ceramic</a>
            <a href="#work">Gallery</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>

      {/* VIDEO MODAL FOR CINEMATIC DEMOS */}
      {videoModal.isOpen && (
        <div
          id="video-modal"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
        >
          <div
            style={{
              width: 'min(900px, 95vw)',
              background: '#0b0d13',
              border: '1px solid rgba(230,0,18,0.5)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(230,0,18,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: '#07090d',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--red-accent)',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {videoModal.serviceName}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    color: '#fff',
                    letterSpacing: '1px',
                    margin: '2px 0 0',
                  }}
                >
                  {videoModal.title}
                </h3>
              </div>
              <button
                type="button"
                id="close-video-modal-btn"
                onClick={() => setVideoModal({ ...videoModal, isOpen: false })}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
              <video
                src={videoModal.videoUrl}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              >
                Your browser does not support HTML video.
              </video>
            </div>

            {/* Official Studio Archive Badge (Protected / Locked) */}
            <div
              style={{
                padding: '14px 20px',
                background: '#07090d',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--red-primary)',
                    boxShadow: '0 0 8px var(--red-primary)',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#cbd5e1', letterSpacing: '1px', fontWeight: 600 }}>
                  OFFICIAL STUDIO REEL • CAR EDITZ DETAILING ARCHIVE
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#6e7787', letterSpacing: '0.5px' }}>
                Ultra HD • Original Audio
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
