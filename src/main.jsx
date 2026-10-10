import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Award, Bookmark, BookmarkCheck, BriefcaseBusiness, CheckCircle2,
  ChevronDown, Clock3, Compass, ExternalLink, Filter, Globe2, GraduationCap,
  Menu, Search, Sparkles, Target, TrendingUp, UserRound, X, Zap, Plus,
  CircleDot, FileText, BarChart3, SlidersHorizontal
} from "lucide-react";
import "./styles.css";
 
/* =========================================================
   BEYOND — PHASE 2A
   Frontend-first intelligence upgrade.
   Data is DEMO DATA until connected to verified sources.
   ========================================================= */
 
const demoOpportunities = [
  {
    id: "opp-001",
    title: "AI for Social Good Fellowship",
    organization: "Global Innovation Lab",
    type: "Fellowship",
    location: "Remote",
    remote: true,
    field: "Artificial Intelligence",
    level: "Students & Early Career",
    funding: "Fully Funded",
    deadline: "2026-11-14",
    skills: ["AI", "Python", "Research"],
    eligibility: "Open to university students and early-career applicants worldwide.",
    description: "A project-based fellowship for people building responsible AI solutions with measurable social impact.",
    source: "Global Innovation Lab",
    url: "https://example.com",
    tags: ["AI", "Global", "Funded"],
    featured: true
  },
  {
    id: "opp-002",
    title: "Future Web Creators Internship",
    organization: "Open Web Studio",
    type: "Internship",
    location: "Remote",
    remote: true,
    field: "Web Development",
    level: "Beginner / Student",
    funding: "Paid",
    deadline: "2026-10-29",
    skills: ["HTML", "CSS", "JavaScript", "Git"],
    eligibility: "Students and recent graduates with a portfolio or web project.",
    description: "A practical internship focused on modern frontend development, product thinking and accessible UX.",
    source: "Open Web Studio",
    url: "https://example.com",
    tags: ["Web", "Paid", "Remote"],
    featured: true
  },
  {
    id: "opp-003",
    title: "Women in Technology Global Grant",
    organization: "Future Forward Foundation",
    type: "Grant",
    location: "Global",
    remote: false,
    field: "Technology",
    level: "Students",
    funding: "Funded",
    deadline: "2026-12-05",
    skills: ["Technology", "Leadership"],
    eligibility: "Women pursuing education or projects in technology-related fields.",
    description: "Funding support for women developing technology skills, projects or community initiatives.",
    source: "Future Forward Foundation",
    url: "https://example.com",
    tags: ["Women", "Grant", "Global"],
    featured: true
  },
  {
    id: "opp-004",
    title: "Global AI Challenge 2027",
    organization: "Future Makers",
    type: "Competition",
    location: "Global",
    remote: true,
    field: "Artificial Intelligence",
    level: "Open to Students",
    funding: "Prize",
    deadline: "2027-01-18",
    skills: ["AI", "Problem Solving", "Innovation"],
    eligibility: "Students and young professionals can participate individually or in teams.",
    description: "A global innovation challenge for practical AI ideas that solve meaningful problems.",
    source: "Future Makers",
    url: "https://example.com",
    tags: ["AI", "Competition", "Global"],
    featured: false
  },
  {
    id: "opp-005",
    title: "Digital Skills Accelerator",
    organization: "Next Skills Institute",
    type: "Training",
    location: "Online",
    remote: true,
    field: "Digital Skills",
    level: "Beginner",
    funding: "Free",
    deadline: "2026-10-31",
    skills: ["Digital Skills", "Career Development"],
    eligibility: "Open to learners seeking practical technology and career skills.",
    description: "A structured online program covering digital productivity, professional communication and career readiness.",
    source: "Next Skills Institute",
    url: "https://example.com",
    tags: ["Free", "Skills", "Online"],
    featured: false
  },
  {
    id: "opp-006",
    title: "Product Design Scholarship",
    organization: "Design Futures",
    type: "Scholarship",
    location: "Europe",
    remote: false,
    field: "Design & Technology",
    level: "Undergraduate",
    funding: "Full Tuition",
    deadline: "2026-11-30",
    skills: ["Design", "UX", "Technology"],
    eligibility: "Undergraduate students interested in technology, design and innovation.",
    description: "Scholarship support for students who want to combine technology with human-centered design.",
    source: "Design Futures",
    url: "https://example.com",
    tags: ["Scholarship", "Design", "Tuition"],
    featured: false
  },
  {
    id: "opp-007",
    title: "Remote Research Assistant Program",
    organization: "Open Research Network",
    type: "Research",
    location: "Remote",
    remote: true,
    field: "Computer Science",
    level: "Undergraduate",
    funding: "Stipend",
    deadline: "2026-11-08",
    skills: ["Research", "Computer Science", "Writing"],
    eligibility: "Undergraduate students with strong interest in research and technology.",
    description: "Remote research placements supporting open-source and academic technology projects.",
    source: "Open Research Network",
    url: "https://example.com",
    tags: ["Research", "Remote", "Stipend"],
    featured: false
  },
  {
    id: "opp-008",
    title: "Young Founders Venture Sprint",
    organization: "Launchpad Collective",
    type: "Accelerator",
    location: "Global",
    remote: true,
    field: "Entrepreneurship",
    level: "Early Stage",
    funding: "Mentorship + Prize",
    deadline: "2026-12-20",
    skills: ["Entrepreneurship", "Product", "Leadership"],
    eligibility: "Young founders or aspiring founders with an idea, prototype or early product.",
    description: "An intensive sprint for turning promising ideas into validated products with expert mentorship.",
    source: "Launchpad Collective",
    url: "https://example.com",
    tags: ["Startup", "Mentorship", "Global"],
    featured: false
  }
];
 
const typeOptions = ["All", "Job", "Internship", "Fellowship", "Scholarship", "Grant", "Competition", "Training", "Research", "Accelerator"];
const applicationStatuses = ["Interested", "Preparing", "Applied", "Interview", "Accepted", "Rejected", "Withdrawn"];
 
const defaultProfile = {
  name: "",
  field: "Computer Science",
  education: "Undergraduate",
  skills: ["JavaScript", "HTML", "CSS", "AI"],
  interests: ["Artificial Intelligence", "Web Development"],
  languages: ["English"],
  remote: true
};
 
const loadJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};
 
function getMatch(item, profile) {
  const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
  const profileInterests = (profile.interests || []).map(s => s.toLowerCase());
const itemSkills = (item.skills || []).map(s => String(s).toLowerCase());
 
  const skillHits = itemSkills.filter(s =>
    profileSkills.some(ps => ps.includes(s) || s.includes(ps))
  ).length;
  const skillScore = Math.min(35, Math.round((skillHits / Math.max(itemSkills.length, 1)) * 35));
 
  const educationScore = /student|undergraduate/i.test(item.level) && /undergraduate|student/i.test(profile.education)
    ? 25 : 15;
 
 const fieldText = String(item.field || "") + " " + String(item.description || "");
  const interestHits = profileInterests.filter(i => fieldText.includes(i)).length;
  const interestScore = Math.min(15, interestHits * 8);
 
  const remoteScore = profile.remote && item.remote ? 10 : profile.remote && !item.remote ? 4 : 8;
 
  const typeScore = item.funding ? 5 : 3;
 
  return Math.min(99, Math.max(45, skillScore + educationScore + interestScore + remoteScore + typeScore));
}
 
function matchReasons(item, profile) {
  const reasons = [];
  const skills = (profile.skills || []).map(s => s.toLowerCase());
  const hits = (item.skills || []).filter(s => skills.some(ps => ps.includes(String(s).toLowerCase()) || String(s).toLowerCase().includes(ps)));
  if (hits.length) reasons.push(`Your skills align with ${hits.slice(0, 2).join(" and ")}.`);
  if (profile.remote && item.remote) reasons.push("Matches your remote preference.");
  if (/student|undergraduate/i.test(String(item.level || ""))) reasons.push("Student-friendly opportunity.");
  if ((profile.interests || []).some(i => `${item.field || ""} ${(item.tags || []).join(" ")}`.toLowerCase().includes(i.toLowerCase()))) {
    reasons.push("Strong alignment with your interests.");
  }
  if (!reasons.length) reasons.push("Explore this opportunity to improve your profile match.");
  return reasons.slice(0, 3);
}
 
function daysLeft(deadline) {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.ceil((date - new Date()) / 86400000));
}
 
const normalizeOpportunity = (item, index) => {
  const skills = Array.isArray(item?.skills) ? item.skills.filter(Boolean).map(String) : [];
  const tags = Array.isArray(item?.tags) ? item.tags.filter(Boolean).map(String) : skills;
 
  return {
    id: item?.id || `opportunity-${index}`,
    title: String(item?.title || "Untitled opportunity"),
    organization: String(item?.organization || "Unknown organization"),
    type: String(item?.type || "Other"),
    location: String(item?.location || (item?.remote ? "Remote" : "Not specified")),
    remote: Boolean(item?.remote),
    field: String(item?.field || tags[0] || "General"),
    level: String(item?.level || "Open to applicants"),
    funding: String(item?.funding || "Not specified"),
    deadline: item?.deadline || null,
    skills,
    eligibility: String(item?.eligibility || "See the original listing for eligibility requirements."),
    description: String(item?.description || "See the original listing for full details."),
    source: String(item?.source || "Original source"),
    sourceUrl: String(item?.sourceUrl || item?.url || ""),
    url: String(item?.url || item?.apply_url || ""),
    tags,
    publishedAt: item?.publishedAt || null,
    applyUrl: String(item?.applyUrl || item?.apply_url || item?.applicationUrl || ''),
    isDemo: Boolean(item?.isDemo || item?.demo),
    featured: Boolean(item?.featured)
  };
};
 
function App() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [fundedOnly, setFundedOnly] = useState(false);
  const [sort, setSort] = useState("match");
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(() => loadJSON("beyond_saved", []));
  const [profile, setProfile] = useState(() => {
    const savedProfile = loadJSON("beyond_profile", defaultProfile);
    return {
      ...defaultProfile,
      ...(savedProfile || {}),
      skills: Array.isArray(savedProfile?.skills) ? savedProfile.skills : defaultProfile.skills,
      interests: Array.isArray(savedProfile?.interests) ? savedProfile.interests : defaultProfile.interests,
      languages: Array.isArray(savedProfile?.languages) ? savedProfile.languages : defaultProfile.languages,
      remote: typeof savedProfile?.remote === "boolean" ? savedProfile.remote : defaultProfile.remote
    };
  });
  const [applications, setApplications] = useState(() => loadJSON("beyond_applications", {}));
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState("");
  
  const [opportunities, setOpportunities] = useState([]);
 
const [loadingOpportunities, setLoadingOpportunities] = useState(true);
 
const [opportunityError, setOpportunityError] = useState("");
const [dataMode, setDataMode] = useState("loading");
const API_BASE_URL = "https://beyond-website.onrender.com";
useEffect(() => {
 
  let cancelled = false;
 
  async function loadOpportunities() {
 
    try {
 
      setLoadingOpportunities(true);
 
      setOpportunityError("");
 
      const response = await fetch(`${API_BASE_URL}/api/opportunities`);
 
      if (!response.ok) {
 
        throw new Error(`API returned ${response.status}`);
 
      }
 
      const data = await response.json();
 
      if (!data.success) {
 
        throw new Error(data.error || "Unable to load opportunities");
 
      }
 
      if (!cancelled) {
        setDataMode(data.mode || "live");
        setOpportunities(
          Array.isArray(data.opportunities)
            ? data.opportunities.map((item, index) => normalizeOpportunity(item, index))
            : []
        );
        const activeSources = (data.sources || []).filter(source => source.status === "connected");
        setOpportunityError(data.mode === "live"
          ? `Live listings loaded${activeSources.length ? ` from ${activeSources.map(source => `${source.name} (${source.count})`).join(" · ")}` : ""}. Open a listing to continue to the source website and apply.`
          : "No live opportunities were returned by the connected sources. Please try again later.");
      }
 
    } catch (error) {
 
      console.error("Opportunity feed failed:", error);
 
      if (!cancelled) {
        // Never show fictional opportunities as if they were real listings.
        setDataMode("error");
        setOpportunities([]);
        setOpportunityError(
          "We couldn't load live opportunities right now. Please refresh in a moment. If this continues, the API may be unavailable."
        );
      }
 
    } finally {
 
      if (!cancelled) {
 
        setLoadingOpportunities(false);
 
      }
 
    }
 
  }
 
  loadOpportunities();
 
  return () => {
 
    cancelled = true;
 
  };
 
}, []);
 
  useEffect(() => localStorage.setItem("beyond_saved", JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem("beyond_profile", JSON.stringify(profile)), [profile]);
  useEffect(() => localStorage.setItem("beyond_applications", JSON.stringify(applications)), [applications]);
 
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);
 
  // Recalculate when either the live feed or the user's profile changes.
  const scored = useMemo(() => opportunities.map(item => ({
    ...item,
    match: getMatch(item, profile)
  })), [opportunities, profile]);
 
  // Search each word independently so queries such as "remote AI internship"
  // can match words that appear in different parts of an opportunity.
  const filtered = useMemo(() => {
    const searchTerms = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
 
    const result = scored.filter(item => {
      const text = [
        item.title,
        item.organization,
        item.type,
        item.field,
        item.location,
        item.description,
        item.eligibility,
        item.funding,
        ...(item.skills || []),
        ...(item.tags || [])
      ]
        .filter(value => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();
 
      const matchesSearch = searchTerms.length === 0 ||
        searchTerms.every(term => text.includes(term));
 
      return matchesSearch
        && (type === "All" || item.type === type)
        && (!remoteOnly || item.remote)
        && (!fundedOnly || /paid|funded|stipend|prize|tuition|mentorship/i.test(item.funding || ""));
    });
 
    return [...result].sort((a, b) => {
      if (sort === "deadline") {
        const aTime = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bTime = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aTime - bTime;
      }
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.match - a.match;
    });
  }, [scored, query, type, remoteOnly, fundedOnly, sort]);
 
  const go = target => {
    setPage(target);
    setSelected(null);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  const toggleSaved = id => {
    setSaved(current => {
      const isSaved = current.includes(id);
      setToast(isSaved ? "Removed from saved" : "Saved to BEYOND");
      return isSaved ? current.filter(x => x !== id) : [...current, id];
    });
  };
 
  const setStatus = (id, status) => {
    setApplications(current => ({
      ...current,
      [id]: { status, updatedAt: new Date().toISOString() }
    }));
    setToast(`Application marked ${status}`);
  };
if (loadingOpportunities) {
 
  return (
 
    <div className="app-shell">
 
      <main className="section container">
 
        <div className="empty-state">
 
          <div className="empty-icon">
 
            <Sparkles size={24} />
 
          </div>
 
          <h3>Finding opportunities for you...</h3>
 
          <p>BEYOND is connecting to its opportunity sources.</p>
 
        </div>
 
      </main>
 
    </div>
 
  );
 
}
  return (
    <div className="app-shell">
      <header className="nav-wrap">
        <nav className="navbar container">
          <button className="brand" onClick={() => go("home")}>
            <span className="brand-mark"><Compass size={18}/></span>
            <span>BEYOND</span>
          </button>
 
          <div className={`nav-links ${mobileMenu ? "open" : ""}`}>
            {[
              ["home", "Home"],
              ["explore", "Explore"],
              ["saved", `Saved ${saved.length ? `(${saved.length})` : ""}`],
              ["dashboard", "Dashboard"],
              ["applications", "Applications"]
            ].map(([key, label]) => (
              <button key={key} className={page === key ? "active" : ""} onClick={() => go(key)}>
                {label}
              </button>
            ))}
          </div>
 
          <div className="nav-actions">
            <button className="profile-button" onClick={() => setShowProfile(true)}>
              <span className="avatar">{profile.name ? profile.name[0].toUpperCase() : "B"}</span>
              <span className="desktop-only">{profile.name || "My Profile"}</span>
              <ChevronDown size={15} className="desktop-only"/>
            </button>
            <button className="menu-button" onClick={() => setMobileMenu(v => !v)}>
              {mobileMenu ? <X size={21}/> : <Menu size={21}/>}
            </button>
          </div>
        </nav>
      </header>
 
      {opportunityError && <div className="demo-notice container"><span className="demo-dot" />{opportunityError}</div>}
      <main>
        {page === "home" && <Home opportunities={scored} dataMode={dataMode} onExplore={() => go("explore")} onOpen={setSelected}/>}
        {page === "explore" && (
          <Explore
            query={query} setQuery={setQuery}
            type={type} setType={setType}
            remoteOnly={remoteOnly} setRemoteOnly={setRemoteOnly}
            fundedOnly={fundedOnly} setFundedOnly={setFundedOnly}
            sort={sort} setSort={setSort}
            opportunities={filtered} saved={saved}
            toggleSaved={toggleSaved} onOpen={setSelected}
          />
        )}
        {page === "saved" && (
          <Saved
            items={scored.filter(x => saved.includes(x.id))}
            saved={saved} toggleSaved={toggleSaved}
            onOpen={setSelected} onExplore={() => go("explore")}
          />
        )}
        {page === "dashboard" && (
          <Dashboard
            profile={profile}
            saved={saved}
            applications={applications}
            opportunities={scored}
            onExplore={() => go("explore")}
            onEdit={() => setShowProfile(true)}
            onOpen={setSelected}
          />
        )}
        {page === "applications" && (
          <Applications
            opportunities={scored}
            applications={applications}
            setStatus={setStatus}
            onOpen={setSelected}
          />
        )}
      </main>
 
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand footer-brand"><span className="brand-mark"><Compass size={18}/></span><span>BEYOND</span></div>
            <p>Opportunities beyond boundaries.</p>
          </div>
          <div><h4>Discover</h4><button onClick={() => go("explore")}>Explore</button><button onClick={() => go("saved")}>Saved</button></div>
          <div><h4>My journey</h4><button onClick={() => go("dashboard")}>Dashboard</button><button onClick={() => go("applications")}>Applications</button></div>
          <div><h4>Trust</h4><p>Recommendations are guidance, not guarantees. Always verify details on the original source.</p></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 BEYOND</span><span>Built with intention.</span></div>
      </footer>
 
      {selected && (
        <OpportunityModal
          item={selected}
          profile={profile}
          saved={saved.includes(selected.id)}
          application={applications[selected.id]}
          toggleSaved={toggleSaved}
          setStatus={setStatus}
          onClose={() => setSelected(null)}
        />
      )}
 
      {showProfile && (
        <ProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={() => setShowProfile(false)}
          onSaved={() => setToast("Profile updated")}
        />
      )}
 
      {toast && <div className="toast"><CheckCircle2 size={17}/> {toast}</div>}
    </div>
  );
}
 
function Home({ opportunities, dataMode = "demo", onExplore, onOpen }) {
  const featured = [...opportunities].sort((a, b) => b.match - a.match).slice(0, 3);
  return <>
    <section className="hero">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
      <div className="container hero-inner">
        <div className="eyebrow"><Sparkles size={14}/> OPPORTUNITY INTELLIGENCE</div>
        <h1>Go beyond <span>what’s possible.</span></h1>
        <p className="hero-copy">Discover scholarships, internships, fellowships, jobs, grants and global programs that fit <strong>you</strong> — not just your search history.</p>
        <div className="hero-actions">
          <button className="primary-button large" onClick={onExplore}>Explore opportunities <ArrowRight size={18}/></button>
          <button className="ghost-button large" onClick={() => featured[0] && onOpen(featured[0])} disabled={!featured.length}>See your match <Sparkles size={17}/></button>
        </div>
        <div className="hero-proof">
          <span><CheckCircle2 size={15}/> Personalized matching</span>
          <span><CheckCircle2 size={15}/> Deadline aware</span>
          <span><CheckCircle2 size={15}/> Application tracking</span>
        </div>
      </div>
      <div className="hero-visual" aria-label="Students collaborating and planning their future">
        <div className="hero-photo-main"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1100&q=85" alt="Students collaborating around a table" /></div>
        <div className="hero-photo-small"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=85" alt="A team sharing ideas" /></div>
        <div className="hero-float-card"><span className="float-icon"><Sparkles size={15}/></span><div><strong>Your next chapter</strong><small>Starts with one opportunity</small></div><span className="float-arrow"><ArrowRight size={15}/></span></div>
        <div className="hero-image-caption"><span className="caption-line"/> BIGGER POSSIBILITIES, CLOSER THAN EVER</div>
      </div>
    </section>
 
    <section className="stats-strip">
      <div className="container stats-grid">
        <div><strong>{opportunities.length}</strong><span>{dataMode === "live" ? "Live job listings" : "Opportunities in preview"}</span></div>
        <div><strong>{opportunities.length ? Math.max(...opportunities.map(x => x.match)) : 0}%</strong><span>Top profile match</span></div>
        <div><strong>5</strong><span>Personal signals</span></div>
        <div><strong>24/7</strong><span>Opportunity discovery</span></div>
      </div>
    </section>
 
    <section className="section container">
      <div className="section-heading">
        <div><div className="eyebrow">RECOMMENDED</div><h2>Worth your attention.</h2></div>
        <button className="text-button" onClick={onExplore}>View all <ArrowRight size={16}/></button>
      </div>
      <div className="opportunity-grid">{featured.map(item => <OpportunityCard key={item.id} item={item} onOpen={onOpen}/>)}</div>
    </section>
 
    <section className="section muted-section">
      <div className="container story-grid">
        <div>
          <div className="eyebrow">BEYOND INTELLIGENCE</div>
          <h2>Less searching. <span>More direction.</span></h2>
          <p>BEYOND turns scattered opportunities into a personalized shortlist using your skills, interests, education and preferences.</p>
          <button className="primary-button" onClick={onExplore}>Find my next move <ArrowRight size={17}/></button>
        </div>
        <div className="intelligence-card">
          <div className="intelligence-top"><span className="mini-icon"><Sparkles size={16}/></span><span>PROFILE MATCH</span></div>
          <div className="match-row"><div><span className="match-number">{opportunities.length ? Math.max(...opportunities.map(x => x.match)) : 0}%</span><span className="match-label">Top match</span></div><div className="match-ring"><span>{opportunities.length ? Math.max(...opportunities.map(x => x.match)) : 0}</span></div></div>
          <div className="reason-list"><div><CheckCircle2 size={16}/> Skills alignment</div><div><CheckCircle2 size={16}/> Student eligibility</div><div><CheckCircle2 size={16}/> Remote preference</div><div><CheckCircle2 size={16}/> Interest alignment</div></div>
        </div>
      </div>
    </section>
  </>;
}
 
function Explore({ query, setQuery, type, setType, remoteOnly, setRemoteOnly, fundedOnly, setFundedOnly, sort, setSort, opportunities, saved, toggleSaved, onOpen }) {
  return <section className="section container">
    <div className="page-heading"><div><div className="eyebrow">EXPLORE</div><h1>Find what fits you.</h1><p>Search, filter and prioritize opportunities with BEYOND Intelligence.</p></div></div>
    <div className="search-panel">
      <div className="search-box"><Search size={19}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try: remote AI internship, scholarship, web..." />{query && <button onClick={() => setQuery("")}><X size={16}/></button>}</div>
      <div className="filter-row">
        <select value={type} onChange={e => setType(e.target.value)}>{typeOptions.map(x => <option key={x}>{x}</option>)}</select>
        <label className={`toggle-filter ${remoteOnly ? "selected" : ""}`}><input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)}/><Globe2 size={15}/> Remote</label>
        <label className={`toggle-filter ${fundedOnly ? "selected" : ""}`}><input type="checkbox" checked={fundedOnly} onChange={e => setFundedOnly(e.target.checked)}/><Award size={15}/> Funded / paid</label>
        <select value={sort} onChange={e => setSort(e.target.value)}><option value="match">Best match</option><option value="deadline">Deadline soonest</option><option value="title">Alphabetical</option></select>
      </div>
    </div>
    <div className="results-bar"><span><strong>{opportunities.length}</strong> opportunities</span><span className="results-hint"><SlidersHorizontal size={14}/> Personalized results</span></div>
    {opportunities.length ? <div className="opportunity-grid">{opportunities.map(item => <OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} toggleSaved={toggleSaved} onOpen={onOpen}/>)}</div> :
      <div className="empty-state"><div className="empty-icon"><Search size={24}/></div><h3>No opportunities found</h3><p>Try a broader search or remove a filter.</p></div>}
  </section>;
}
 
function Saved({ items, saved, toggleSaved, onOpen, onExplore }) {
  return <section className="section container">
    <div className="page-heading"><div><div className="eyebrow">YOUR SHORTLIST</div><h1>Saved opportunities.</h1><p>Keep the possibilities you want to revisit.</p></div></div>
    {items.length ? <div className="opportunity-grid">{items.map(item => <OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} toggleSaved={toggleSaved} onOpen={onOpen}/>)}</div> :
      <div className="empty-state"><div className="empty-icon"><Bookmark size={24}/></div><h3>Your shortlist is empty</h3><p>Save opportunities while exploring and they will appear here.</p><button className="primary-button" onClick={onExplore}>Explore opportunities <ArrowRight size={17}/></button></div>}
  </section>;
}
 
function Dashboard({ profile, saved, applications, opportunities, onExplore, onEdit, onOpen }) {
  const savedItems = opportunities.filter(x => saved.includes(x.id));
  const appliedCount = Object.keys(applications).filter(id => applications[id]?.status && applications[id].status !== "Interested").length;
  const avg = opportunities.length ? Math.round(opportunities.reduce((a, b) => a + b.match, 0) / opportunities.length) : 0;
  const first = profile.name ? profile.name.split(" ")[0] : "there";
  return <section className="section container">
    <div className="dashboard-head"><div><div className="eyebrow">YOUR BEYOND</div><h1>Good to see you, {first}.</h1><p>Your opportunities, signals and applications in one place.</p></div><button className="ghost-button" onClick={onEdit}><UserRound size={16}/> Edit profile</button></div>
    <div className="dashboard-grid">
      <div className="profile-card card"><div className="card-label">PROFILE SIGNAL</div><div className="profile-big"><div className="avatar large">{profile.name ? profile.name[0].toUpperCase() : "B"}</div><div><h3>{profile.name || "Your profile"}</h3><p>{profile.field} · {profile.education}</p></div></div><div className="skill-wrap">{profile.skills.map(s => <span className="tag" key={s}>{s}</span>)}</div><button className="text-button" onClick={onEdit}>Improve profile <ArrowRight size={16}/></button></div>
      <Metric icon={<Target size={18}/>} label="Average fit" value={`${avg}%`} note="Across current opportunities"/>
      <Metric icon={<BookmarkCheck size={18}/>} label="Saved" value={saved.length} note="In your shortlist"/>
      <Metric icon={<FileText size={18}/>} label="Applications" value={appliedCount} note="Tracked applications"/>
    </div>
    <div className="dashboard-section">
      <div className="section-heading"><div><div className="eyebrow">NEXT MOVES</div><h2>Recommended starting points.</h2></div><button className="text-button" onClick={onExplore}>Explore all <ArrowRight size={16}/></button></div>
      <div className="mini-list">{(savedItems.length ? savedItems : opportunities.slice(0, 4)).map(item => <button className="mini-opportunity" key={item.id} onClick={() => onOpen(item)}><div className="mini-logo">{(item.organization || "?")[0]}</div><div className="mini-main"><strong>{item.title}</strong><span>{item.organization} · {item.type}</span></div><div className="mini-match">{item.match}%</div></button>)}</div>
    </div>
  </section>;
}
 
function Metric({ icon, label, value, note }) {
  return <div className="metric-card card"><div className="metric-icon">{icon}</div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}
 
function Applications({ opportunities, applications, setStatus, onOpen }) {
  const tracked = opportunities.filter(item => applications[item.id]);
  return <section className="section container">
    <div className="page-heading"><div><div className="eyebrow">APPLICATION TRACKER</div><h1>Move opportunities forward.</h1><p>Track your progress from interest to outcome.</p></div></div>
    {tracked.length ? <div className="application-list">{tracked.map(item => <div className="application-row" key={item.id}><div className="mini-logo">{(item.organization || "?")[0]}</div><div className="application-main"><strong>{item.title}</strong><span>{item.organization} · deadline {item.deadline ? new Date(item.deadline).toLocaleDateString() : "not specified"}</span></div><select value={applications[item.id].status} onChange={e => setStatus(item.id, e.target.value)}>{applicationStatuses.map(s => <option key={s}>{s}</option>)}</select><button className="icon-button" onClick={() => onOpen(item)}><ExternalLink size={16}/></button></div>)}</div> :
    <div className="empty-state"><div className="empty-icon"><FileText size={24}/></div><h3>No applications tracked yet</h3><p>Open an opportunity and choose a status to start tracking.</p></div>}
  </section>;
}
 
const opportunityImages = {
  Job: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
  Internship: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85",
  Fellowship: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=85",
  Scholarship: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=900&q=85",
  Grant: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85",
  Competition: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
  Training: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=85",
  Research: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85",
  Accelerator: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85"
};
 
function OpportunityCard({ item, saved = false, toggleSaved, onOpen }) {
  const days = daysLeft(item.deadline);
  const image = opportunityImages[item.type] || opportunityImages.Job;
  return <article className="opportunity-card">
    <button className="card-image-button" onClick={() => onOpen(item)} aria-label={`View ${item.title}`}>
      <img className="card-image" src={image} alt="" loading="lazy" />
      <span className="image-kicker">BEYOND SELECTS</span>
      {item.isDemo && <span className="sample-image-label">Sample</span>}
    </button>
    <div className="card-content">
      <div className="card-topline"><span className="type-pill">{item.type}</span><button className={`save-button ${saved ? "saved" : ""}`} onClick={() => toggleSaved?.(item.id)} aria-label={saved ? "Remove saved opportunity" : "Save opportunity"}>{saved ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}</button></div>
      <div className="org-line"><span className="org-logo">{(item.organization || "?")[0]}</span><span>{item.organization}</span></div>
      <button className="card-title" onClick={() => onOpen(item)}>{item.title}</button>
      <p className="card-description">{item.description}</p>
      <div className="tag-row"><span className="soft-tag"><Globe2 size={13}/> {item.location}</span><span className="soft-tag"><Award size={13}/> {item.funding}</span></div>
      <div className="card-bottom"><div className="deadline"><Clock3 size={14}/> {days === null ? "Deadline not specified" : days ? `${days} days left` : "Deadline passed"}</div><div className="match-badge"><Sparkles size={13}/> {item.match}% match</div></div>
      <button className="card-open-link" onClick={() => onOpen(item)}>View opportunity <ArrowRight size={15}/></button>
    </div>
  </article>;
}
 
function OpportunityModal({ item, profile, saved, application, toggleSaved, setStatus, onClose }) {
  const reasons = matchReasons(item, profile);
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal opportunity-modal" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X size={19}/></button>
    <div className="modal-type">{item.type} · {item.field}</div><h2>{item.title}</h2><p className="modal-org">{item.organization} · {item.location}</p>
    <div className="match-banner"><div><span>BEYOND MATCH</span><strong>{item.match}%</strong></div><div><p>{reasons[0]}</p></div></div>
    <div className="reason-panel"><div className="reason-title"><Zap size={15}/> Why this matches you</div>{reasons.map(r => <div className="reason-line" key={r}><CheckCircle2 size={15}/>{r}</div>)}</div>
    <div className="detail-grid"><div><span>Deadline</span><strong>{item.deadline ? new Date(item.deadline).toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}) : "Not specified"}</strong></div><div><span>Funding</span><strong>{item.funding}</strong></div><div><span>Level</span><strong>{item.level}</strong></div><div><span>Format</span><strong>{item.remote ? "Remote" : "On-site / Mixed"}</strong></div></div>
    <h3>About</h3><p>{item.description}</p><h3>Eligibility</h3><p>{item.eligibility}</p><h3>Skills</h3><div className="tag-row">{(item.skills || []).map(s => <span className="tag" key={s}>{s}</span>)}</div>
    <div className="application-box"><div><span>Application status</span><strong>{application?.status || "Not tracked"}</strong></div><select value={application?.status || "Interested"} onChange={e => setStatus(item.id,e.target.value)}>{applicationStatuses.map(s => <option key={s}>{s}</option>)}</select></div>
    <div className="application-cta-panel">
      <div className="application-cta-copy"><span className="application-cta-eyebrow">YOUR NEXT STEP</span><strong>Ready to take the next step?</strong><p>Review the official requirements before you submit an application.</p></div>
      {(() => {
        const destination = item.applyUrl || item.url || item.sourceUrl;
        const isSafeDestination = /^https?:\/\//i.test(destination || "") && !/example\.com/i.test(destination || "") && !item.isDemo;
        return isSafeDestination
          ? <a className="primary-button apply-button" href={destination} target="_blank" rel="noopener noreferrer">View job & apply <ExternalLink size={17}/></a>
          : <span className="apply-unavailable" title="This sample record does not have a verified application URL">Application link not available for this sample</span>;
      })()}
    </div>
    <div className="modal-actions"><button className="ghost-button" onClick={() => toggleSaved(item.id)}>{saved ? <BookmarkCheck size={17}/> : <Bookmark size={17}/>} {saved ? "Saved to shortlist" : "Save opportunity"}
    </button>{(() => { const source = item.sourceUrl || item.url; return !item.isDemo && /^https?:\/\//i.test(source || "") && !/example\.com/i.test(source || "") ? <a className="source-link" href={source} target="_blank" rel="noopener noreferrer">View original listing <ExternalLink size={15}/></a> : null; })()}</div>
    <p className="source-note"><Globe2 size={13}/> {item.isDemo ? "Sample opportunity for design preview. Employer and application details are not verified." : `Source: ${item.source || "Original listing"}. Confirm the requirements on the official website.`}</p>
  </div></div>;
}
 
function ProfileModal({ profile, setProfile, onClose, onSaved }) {
  const [draft, setDraft] = useState(profile);
  const [skill, setSkill] = useState("");
  const [interest, setInterest] = useState("");
 
  const add = (field, value, clear) => {
    const v = value.trim();
    if (!v || !Array.isArray(draft[field]) || draft[field].includes(v)) return;
    setDraft({...draft, [field]: [...draft[field], v]});
    clear("");
  };
 
  const save = () => { setProfile(draft); onSaved(); onClose(); };
 
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal profile-modal" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose}><X size={19}/></button><div className="modal-type">YOUR PROFILE</div><h2>Make BEYOND more personal.</h2><p>These details power your recommendation score in this prototype.</p>
    <label className="field-label">Name<input value={draft.name} onChange={e => setDraft({...draft,name:e.target.value})} placeholder="Your name"/></label>
    <label className="field-label">Study / career field<input value={draft.field} onChange={e => setDraft({...draft,field:e.target.value})}/></label>
    <label className="field-label">Education<select value={draft.education} onChange={e => setDraft({...draft,education:e.target.value})}><option>Undergraduate</option><option>Graduate</option><option>Recent Graduate</option><option>Early Career</option></select></label>
    <label className="field-label">Add a skill<div className="inline-input"><input value={skill} onChange={e=>setSkill(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add("skills",skill,setSkill)} placeholder="JavaScript, Python..."/><button className="ghost-button" onClick={()=>add("skills",skill,setSkill)}><Plus size={15}/> Add</button></div></label>
    <div className="tag-row">{(draft.skills || []).map(s=><button className="tag removable" key={s} onClick={()=>setDraft({...draft,skills:draft.skills.filter(x=>x!==s)})}>{s}<X size={12}/></button>)}</div>
    <label className="field-label">Add an interest<div className="inline-input"><input value={interest} onChange={e=>setInterest(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add("interests",interest,setInterest)} placeholder="AI, Design..."/><button className="ghost-button" onClick={()=>add("interests",interest,setInterest)}><Plus size={15}/> Add</button></div></label>
    <div className="tag-row">{(draft.interests || []).map(s=><button className="tag removable" key={s} onClick={()=>setDraft({...draft,interests:draft.interests.filter(x=>x!==s)})}>{s}<X size={12}/></button>)}</div>
    <label className="check-line"><input type="checkbox" checked={draft.remote} onChange={e=>setDraft({...draft,remote:e.target.checked})}/> Prefer remote opportunities</label>
    <button className="primary-button full" onClick={save}>Save profile <CheckCircle2 size={17}/></button>
  </div></div>;
}
 
createRoot(document.getElementById("root")).render(<App />);
